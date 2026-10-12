#!/usr/bin/env python3
"""Launch-day observation for BuildPeek.

Reads the Product Hunt page and X metrics, appends one JSON line per run to
state/observations.jsonl, and prints a summary. Never posts, never upvotes,
never comments. Read-only.

PH page is fetched with urllib (no browser, no login). If PH blocks the request
the run records http_status and continues rather than pretending success.
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATE = ROOT / 'state'
STATE.mkdir(exist_ok=True)

PH_URL = 'https://www.producthunt.com/products/buildpeek?launch=buildpeek'
UA = 'BuildPeekLaunchWatch/1.0 (+https://github.com/yukihamada/buildpeek)'


def fetch_ph():
    """Return (status, text). Never raises.

    GitHub Actions egress IPs are sometimes blocked by PH (observed 403 on a
    runner while the same request succeeded locally), so retry with backoff and
    report the final status honestly rather than treating a block as zero.
    """
    req = urllib.request.Request(PH_URL, headers={'User-Agent': UA, 'Accept': 'text/html'})
    last = (0, '')
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=45) as r:
                return r.status, r.read().decode('utf-8', 'replace')
        except urllib.error.HTTPError as e:
            last = (e.code, '')
        except Exception as e:
            last = (0, f'{type(e).__name__}: {e}')
        if attempt < 2:
            time.sleep(5 * (attempt + 1))
    return last


def parse_ph(text):
    """Best-effort counts from PH's embedded JSON.

    Omits anything not found, so a missing field is never reported
    as 0. `live` comes from the matching Post's explicit launchState, not from the absence of
    a "not live yet" sentence — an early version of this script inferred live
    from missing text and wrongly reported the launch as already public.
    """
    out = {'scoped': False}
    decoder = json.JSONDecoder()
    # Decode individual objects, not a character window around a slug. JSON key
    # order is unspecified, and nearby/nested products can have unrelated counts.
    for match in re.finditer(r'\{', text):
        try:
            post, _ = decoder.raw_decode(text, match.start())
        except ValueError:
            continue
        if post.get('slug') != 'buildpeek' or post.get('__typename') not in ('Product', 'Post'):
            continue
        out['scoped'] = True
        counts = (('followersCount', 'followers'), ('reviewsCount', 'reviews')) if post['__typename'] == 'Product' else (
            ('latestScore', 'score'), ('votesCount', 'upvotes'), ('commentsCount', 'comments'))
        for src, dst in counts:
            if type(post.get(src)) is int and post[src] >= 0:
                out[dst] = post[src]
        if post['__typename'] != 'Post':
            continue
        if post.get('launchState') in ('live', 'scheduled', 'upcoming', 'draft'):
            out['launch_state'] = post['launchState']
            out['live'] = post['launchState'] == 'live'
        if type(post.get('disabledWhenScheduled')) is bool:
            out['disabled_when_scheduled'] = post['disabledWhenScheduled']
        for src, dst in (('scheduledAt', 'scheduled_at'), ('featuredAt', 'featuredAt'), ('createdAt', 'createdAt')):
            if isinstance(post.get(src), str):
                out[dst] = post[src]
    return out


def x_metrics(ids):
    """Read tweet metrics.

    Prefers the local xapi helper; falls back to the X API with OAuth 1.0a
    signed in-process so CI runners without xapi still record numbers.
    """
    if not ids:
        return {}
    xapi = Path.home() / '.local/bin/xapi'
    if xapi.exists():
        import subprocess
        try:
            r = subprocess.run([str(xapi), 'metrics', ','.join(ids)],
                               capture_output=True, text=True, timeout=60)
            if r.returncode == 0:
                out = {}
                for line in r.stdout.splitlines():
                    parts = line.split()
                    if not parts or not parts[0].isdigit():
                        continue
                    d = {}
                    for kv in parts[1:]:
                        if '=' in kv:
                            k, v = kv.split('=', 1)
                            try:
                                d[k] = int(v)
                            except ValueError:
                                d[k] = v
                    out[parts[0]] = d
                return out
        except Exception as e:
            return {'error': f'{type(e).__name__}: {e}'}

    creds = {k: os.environ.get(k) for k in
             ('X_CONSUMER_KEY', 'X_CONSUMER_SECRET', 'X_ACCESS_TOKEN', 'X_ACCESS_TOKEN_SECRET')}
    if not all(creds.values()):
        return {'unavailable': 'no xapi and no X credentials in env'}

    import hmac
    import base64
    import hashlib
    import urllib.parse

    def signed_get(base_url, query):
        oauth = {
            'oauth_consumer_key': creds['X_CONSUMER_KEY'],
            'oauth_nonce': hashlib.sha1(os.urandom(32)).hexdigest(),
            'oauth_signature_method': 'HMAC-SHA1',
            'oauth_timestamp': str(int(time.time())),
            'oauth_token': creds['X_ACCESS_TOKEN'],
            'oauth_version': '1.0',
        }
        # Query params must be part of the signature base string, not just the
        # URL. Signing only the oauth params yields HTTP 401.
        allp = dict(oauth)
        allp.update(query)
        key = '&'.join([urllib.parse.quote(creds['X_CONSUMER_SECRET'], safe=''),
                        urllib.parse.quote(creds['X_ACCESS_TOKEN_SECRET'], safe='')])
        norm = '&'.join(f'{urllib.parse.quote(k, safe="")}={urllib.parse.quote(str(allp[k]), safe="")}'
                        for k in sorted(allp))
        base = '&'.join(['GET', urllib.parse.quote(base_url, safe=''),
                         urllib.parse.quote(norm, safe='')])
        oauth['oauth_signature'] = base64.b64encode(hmac.new(
            key.encode(), base.encode(), hashlib.sha1).digest()).decode()
        header = 'OAuth ' + ', '.join(
            f'{urllib.parse.quote(k, safe="")}="{urllib.parse.quote(v, safe="")}"'
            for k, v in sorted(oauth.items()))
        url = base_url + '?' + urllib.parse.urlencode(query)
        req = urllib.request.Request(url, headers={'Authorization': header})
        with urllib.request.urlopen(req, timeout=45) as r:
            return json.loads(r.read().decode('utf-8'))

    out = {}
    try:
        data = signed_get('https://api.x.com/2/tweets',
                          {'ids': ','.join(ids), 'tweet.fields': 'public_metrics'})
        for t in data.get('data', []):
            out[t['id']] = t.get('public_metrics', {})
    except Exception as e:
        return {'error': f'{type(e).__name__}: {e}'}
    return out


def main():
    now = datetime.now(timezone.utc)
    status, text = fetch_ph()
    obs = {'at': now.isoformat(), 'ph': {'http_status': status}}
    if status == 200:
        obs['ph'].update(parse_ph(text))
    else:
        obs['ph']['note'] = (text or 'no body')[:200]
        obs['ph']['hint'] = ('PH blocked this network. Run `python3 tools/launch_watch.py` '
                             'locally to record real numbers.')

    ids = [i.strip() for i in os.environ.get('TWEET_IDS', '').split(',') if i.strip()]
    if ids:
        obs['x'] = x_metrics(ids)

    with (STATE / 'observations.jsonl').open('a') as f:
        f.write(json.dumps(obs) + '\n')

    print(json.dumps(obs, indent=2))
    return 0


if __name__ == '__main__':
    sys.exit(main())
