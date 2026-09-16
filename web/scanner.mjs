// All returned fields are fixed metadata or numbers. Input never enters a report.
export const MAX_BYTES = 2 * 1024 * 1024;
export const DOCS = 'https://docs.docker.com/build/building/secrets/';
export const RULES = {
  'BP001': {
    severity: 'high',
    en: ['Secret-like build argument', 'ARG is not a secret channel. Its value can appear in image history or provenance.', 'Use a BuildKit secret mount for the build step. Rotate exposed credentials and retire affected images.'],
    ja: ['秘密情報らしいビルド引数', 'ARGは秘密情報の受け渡し用ではありません。値が履歴やprovenanceに残る可能性があります。', '必要なRUNだけでBuildKit secret mountを使います。露出した認証情報は失効・再発行し、対象イメージも対応してください。'],
  },
  'BP002': {
    severity: 'high',
    en: ['Secret-like environment variable', 'A secret-like ENV assignment may persist in the image configuration.', 'Use a build secret mount, or supply runtime secrets through your deployment platform.'],
    ja: ['秘密情報らしい環境変数', '秘密情報らしいENVの代入がイメージ設定に残る可能性があります。', 'ビルド時はsecret mount、実行時はデプロイ基盤のシークレット機能を使います。'],
  },
  'BP003': {
    severity: 'high',
    en: ['Credential-shaped literal', 'A value matches a known credential format. This is a pattern match, not a check that the credential works.', 'Remove the literal, rotate it if real, and inspect existing images and build caches.'],
    ja: ['認証情報の形式に一致する値', '既知の認証情報形式に一致しました。有効性は確認していません。', '値を除去し、本物なら失効・再発行してください。既存イメージとビルドキャッシュも確認します。'],
  },
  'BP004': {
    severity: 'high',
    en: ['Authentication embedded in a URL', 'Credentials or credential variables in URLs can persist in build history or config files.', 'Use an SSH mount or short-lived secret mount. Avoid saving authenticated URLs into Git configuration.'],
    ja: ['URL内の認証情報', 'URLに埋め込まれた認証情報や変数が、履歴や設定ファイルに残る可能性があります。', 'SSH mountや一時的なsecret mountを使い、認証付きURLをGit設定へ保存しないようにします。'],
  },
  'BP005': {
    severity: 'high',
    en: ['Sensitive file copied into a layer', 'A COPY or ADD instruction names a file commonly used for secrets.', 'Keep secret files out of the build context and use secret mounts. Deleting a file in a later layer does not erase earlier layers.'],
    ja: ['機密ファイルのレイヤーへのコピー', 'COPYまたはADDが、秘密情報によく使われるファイル名を参照しています。', '機密ファイルをビルドコンテキストから外し、secret mountを使います。後のレイヤーで削除しても、前のレイヤーは消えません。'],
  },
  'BP006': {
    severity: 'review',
    en: ['Whole build context copied', 'COPY . or ADD . may include local credentials unless your .dockerignore excludes them.', 'Review .dockerignore for .env, private keys, .git and local credential files. This app does not read your .dockerignore.'],
    ja: ['ビルドコンテキスト全体のコピー', 'COPY .やADD .は、.dockerignore次第でローカルの認証情報を含む可能性があります。', '.env、秘密鍵、.git、認証設定が.dockerignoreで除外されているか確認します。このツールは.dockerignoreを読みません。'],
  },
  'BP007': {
    severity: 'high',
    en: ['Authentication written to a file', 'This command appears to save authentication into Git, npm or another credentials file.', 'Keep authentication ephemeral. Secret mounts alone do not help if the consuming command writes the secret into a layer.'],
    ja: ['認証情報のファイル保存', 'Git・npmなどの認証設定をファイルへ保存するコマンドの可能性があります。', '認証情報を一時的に扱います。secret mountでも、コマンドがレイヤーへ書き出すと残ってしまいます。'],
  },
  'BP008': {
    severity: 'review',
    en: ['Secret may be printed to build logs', 'A command appears to print a secret variable, a mounted secret, or enable shell tracing.', 'Avoid printing secrets and disable shell tracing around secret-consuming commands. Review existing build logs.'],
    ja: ['ビルドログへの秘密情報出力の可能性', '秘密変数・マウントした秘密の出力、またはシェルトレースが見つかりました。', '秘密の出力を避け、扱う箇所ではシェルトレースを無効にします。既存のビルドログも確認してください。'],
  },
};

const sensitiveName = /(?:^|_)(?:TOKEN|PASSWORD|PASSWD|SECRET|API_KEY|PRIVATE_KEY|ACCESS_KEY)(?:_|$)/i;
const credential = /\b(?:gh[pousr]_[A-Za-z0-9]{20,255}|github_pat_[A-Za-z0-9_]{20,255}|AKIA[A-Z0-9]{16}|sk_(?:live|test)_[A-Za-z0-9]{16,255}|sk-(?:proj-)?[A-Za-z0-9_-]{20,255}|xox[baprs]-[A-Za-z0-9-]{10,255})\b|-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/;
const sensitiveFile = /(?:^|[\s"'\/])(?:\.env(?:\.[\w*-]+)?|\.npmrc|\.netrc|\.git-credentials|id_rsa|id_ed25519|credentials|[^\s"']*\.pem)(?:[\s"'\/]|$)/i;

function recordsFrom(input, requested) {
  let mode = requested;
  if (mode === 'auto') {
    const trimmed = input.trimStart();
    mode = /^[\[{]/.test(trimmed) ? 'json' : /(?:^|\n)\s*(?:FROM|ARG|ENV|COPY|ADD|RUN|#\s*syntax=)\b/i.test(input) ? 'dockerfile' : 'history';
  }
  if (mode === 'json') {
    let parsed;
    try { parsed = JSON.parse(input); } catch { throw new Error('invalidJson'); }
    const images = Array.isArray(parsed) ? parsed : [parsed];
    const rows = [];
    let recognized = false;
    for (const image of images) {
      if (!image || typeof image !== 'object') throw new Error('unsupportedJson');
      if (Array.isArray(image.history)) {
        recognized = true;
        image.history.forEach((item, i) => {
          if (item && typeof item.created_by === 'string') rows.push({ text: item.created_by, line: i + 1, location: 'history' });
        });
      }
      const env = image.config?.Env ?? image.Config?.Env;
      if (Array.isArray(env)) {
        recognized = true;
        env.forEach((item, i) => {
          if (typeof item === 'string') rows.push({ text: `ENV ${item}`, line: i + 1, location: 'env' });
        });
      }
    }
    if (!recognized || !rows.length) throw new Error('unsupportedJson');
    return { mode, rows };
  }
  if (!['dockerfile', 'history'].includes(mode)) throw new Error('invalidMode');
  const rows = [];
  let pending = '', firstLine = 1;
  input.split(/\r?\n/).forEach((text, i) => {
    if (!pending && (!text.trim() || (mode === 'dockerfile' && text.trimStart().startsWith('#')))) return;
    if (!pending) firstLine = i + 1;
    pending += text.replace(/\\\s*$/, '') + ' ';
    if (!/\\\s*$/.test(text)) {
      rows.push({ text: pending.trim(), line: firstLine, location: 'line' });
      pending = '';
    }
  });
  if (pending) rows.push({ text: pending.trim(), line: firstLine, location: 'line' });
  return { mode, rows };
}

export function scan(input, mode = 'auto') {
  if (typeof input !== 'string' || !input.trim()) throw new Error('empty');
  if (new TextEncoder().encode(input).length > MAX_BYTES) throw new Error('tooLarge');
  if (input.includes('\0')) throw new Error('binary');
  const { mode: detectedMode, rows } = recordsFrom(input, mode);
  if (!rows.length) throw new Error('empty');
  const findings = [];
  let secretMounts = 0;
  let truncated = false;
  for (const row of rows) {
    const text = row.text;
    const add = id => {
      if (findings.length >= 500) { truncated = true; return; }
      findings.push({ id, severity: RULES[id].severity, line: row.line, location: row.location });
    };
    if (/--mount=type=(secret|ssh)(?:[,\s]|$)/i.test(text)) secretMounts++;
    const arg = text.match(/(?:^|\s|\))ARG\s+([A-Z_][A-Z0-9_]*)/i);
    if (arg && sensitiveName.test(arg[1])) add('BP001');
    const env = text.match(/(?:^|\s|\))ENV\s+(.+)/i);
    if (env) {
      const assignments = [...env[1].matchAll(/(?:^|\s)([A-Z_][A-Z0-9_]*)\s*=/gi)];
      const names = assignments.length ? assignments.map(m => m[1]) : [env[1].split(/\s/)[0]];
      if (names.some(name => sensitiveName.test(name))) add('BP002');
    }
    if (credential.test(text)) add('BP003');
    if (/https?:\/\/[^\s/"']{1,512}@/i.test(text)) add('BP004');
    const copy = text.match(/(?:^|\s|\))(?:COPY|ADD)\s+(.+)/i);
    if (copy) {
      // Drop flags and the destination: copying a harmless file *to* .env is not secret ingestion.
      const args = copy[1].replace(/--[\w-]+=(?:"[^"]*"|'[^']*'|\S+)\s*/g, '');
      let sources;
      if (args.startsWith('[')) {
        try { const a = JSON.parse(args); sources = Array.isArray(a) ? a.slice(0, -1).join(' ') : args; }
        catch { sources = args; }
      } else sources = args.split(/\s+/).slice(0, -1).join(' ');
      const withoutTemplates = sources.replace(/(?:^|[\s"'])[^\s"']*\.env\.(?:example|sample|template)(?=[\s"']|$)/gi, ' ');
      if (sensitiveFile.test(withoutTemplates)) add('BP005');
      if (/(?:^|\s)(?:\.|\.\/|\*)(?:\s|$)/.test(sources)) add('BP006');
    }
    if (/git\s+config\b.*(?:https?:\/\/[^\s]{1,512}@|credential\.helper\s+store)|npm\s+config\s+set\b.*(?:_auth|token)|(?:>|tee\s+)[^;&|]*(?:\.npmrc|\.netrc|\.git-credentials)/i.test(text)) add('BP007');
    // Bare `set -x` is common in base images and says nothing about secrets, so only
    // flag tracing when a secret variable or mount is actually in play.
    const traces = /\bset\s+-[a-z]*x/i.test(text);
    const secretInPlay = /\$\{?\w*(?:TOKEN|SECRET|PASSWORD|API_KEY|CREDENTIAL)|--mount=type=secret|\/run\/secrets\//i.test(text);
    if ((traces && secretInPlay)
      || /\b(?:echo|printf)\b[^;&|]*(?:\$\{?\w*(?:TOKEN|SECRET|PASSWORD|API_KEY))|\bcat\s+\/run\/secrets\//i.test(text)) add('BP008');
  }
  return {
    version: '0.1.0', mode: detectedMode, records: rows.length, secretMounts, truncated,
    high: findings.filter(f => f.severity === 'high').length,
    review: findings.filter(f => f.severity === 'review').length,
    findings,
  };
}

export function reportMarkdown(result, lang = 'en') {
  const locale = lang === 'ja' ? 'ja' : 'en';
  const intro = locale === 'ja'
    ? '入力内の既知パターンだけを点検しました。認証情報の有効性・イメージのファイル層・安全性は未確認です。入力本文やファイル名は含みません。'
    : 'Heuristic review of supplied text only. Credential validity, filesystem layers and image safety are not verified. No input text or filenames are included.';
  return ['# BuildPeek', '', intro, '', `High: ${result.high} | Review: ${result.review} | Records: ${result.records}`, result.truncated ? 'TRUNCATED: first 500 findings only.' : '', '',
    ...result.findings.flatMap(f => [`## ${f.id} · ${f.location} ${f.line}`, RULES[f.id][locale][0], RULES[f.id][locale][1], RULES[f.id][locale][2], '']),
    DOCS, ''].join('\n');
}
