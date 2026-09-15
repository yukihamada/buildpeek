import { RULES, MAX_BYTES, reportMarkdown, scan } from './scanner.mjs';
import { messages } from './i18n.mjs';

const $ = id => document.getElementById(id);
let lang = new URL(location.href).searchParams.get('lang') === 'ja' ? 'ja' : 'en';
let result = null, worker = null, requestId = 0, statusKey = '';
const t = key => messages[lang][key] || messages.en[key] || key;
const risky = `# Synthetic teaching example — no real credentials
FROM node:22-alpine
ARG GITHUB_TOKEN
ENV APP_TOKEN=example-only-not-a-real-token
RUN git config --global url."https://\${GITHUB_TOKEN}@github.com/".insteadOf "git@github.com:"
COPY .env /app/.env
COPY . /app
RUN npm ci
RUN rm /app/.env`;
const mounted = `# syntax=docker/dockerfile:1
# Synthetic teaching example — review the consuming command too
FROM amazon/aws-cli:2
RUN --mount=type=secret,id=aws \\
    AWS_SHARED_CREDENTIALS_FILE=/run/secrets/aws \\
    aws s3 cp s3://your-bucket/artifact /app/artifact`;

function node(tag, text, className) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
}
function status(key) { statusKey = key; $('status').textContent = key ? t(key) : ''; }
function reset() {
  requestId++;
  worker?.terminate(); worker = null;
  $('scan').disabled = false;
  result = null;
  render();
}
function applyLanguage() {
  document.documentElement.lang = lang;
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of document.querySelectorAll('[data-placeholder]')) el.placeholder = t(el.dataset.placeholder);
  $('language').textContent = lang === 'en' ? '日本語' : 'English';
  const rules = $('rule-list');
  if (rules) {
    rules.replaceChildren();
    for (const [id, rule] of Object.entries(RULES)) {
      const item = node('li', `${id} — ${rule[lang][0]}`, `rule-${rule.severity}`);
      rules.append(item);
    }
  }
  status(statusKey);
  render();
}
function save(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = node('a'); link.href = url; link.download = filename;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
function summaryCard() {
  const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 630;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#102b25'; ctx.fillRect(0, 0, 1200, 630);
  ctx.fillStyle = '#c7f2a0'; ctx.font = 'bold 32px system-ui'; ctx.fillText('BuildPeek', 65, 78);
  ctx.font = '17px system-ui'; ctx.fillText(t('screenshotLabel'), 65, 125);
  ctx.font = 'bold 108px system-ui'; ctx.fillText(String(result.high), 65, 295); ctx.fillText(String(result.review), 600, 295);
  ctx.font = '24px system-ui'; ctx.fillText(t('high'), 65, 345); ctx.fillText(t('review'), 600, 345);
  ctx.fillStyle = '#fffef9'; ctx.font = '22px system-ui'; ctx.fillText(`${t('records')}: ${result.records}`, 65, 437);
  ctx.font = '18px system-ui'; ctx.fillText(t('cardFoot'), 65, 545);
  if (result.truncated) ctx.fillText('TRUNCATED / FIRST 500 FINDINGS', 65, 580);
  canvas.toBlob(blob => { if (blob) save(blob, 'buildpeek-summary.png'); }, 'image/png');
}
function render() {
  const root = $('result'); root.replaceChildren();
  if (!result) {
    const empty = node('div', undefined, 'empty');
    empty.append(node('span', '⌕', 'empty-icon'), node('h3', t('idle')), node('p', t('idleBody')));
    root.append(empty); return;
  }
  const stats = node('div', undefined, 'stats');
  for (const key of ['high', 'review', 'records', 'mounts']) {
    const stat = node('div', undefined, `stat ${key === 'high' && result.high ? 'hot' : ''}`);
    stat.append(node('b', new Intl.NumberFormat(lang).format(result[key === 'mounts' ? 'secretMounts' : key])), node('span', t(key)));
    stats.append(stat);
  }
  root.append(node('p', t('scope'), 'scope'), stats); root.append(node('p', t('truncated'), 'warning'));
  if (!result.findings.length) {
    const warn = node('div', undefined, 'warning');
    warn.append(node('strong', t('noFindings')), node('div', t('noFindingsBody')));
    root.append(warn);
  }
  const list = node('div', undefined, 'findings');
  for (const finding of result.findings) {
    const rule = RULES[finding.id][lang];
    const article = node('article', undefined, `finding ${finding.severity}`);
    const meta = node('div', undefined, 'finding-meta');
    const loc = finding.location === 'history' ? 'historyLocation' : finding.location;
    meta.append(node('span', t(finding.severity === 'high' ? 'highBadge' : 'reviewBadge'), 'badge'), node('span', `${finding.id} / ${t(loc)} ${finding.line}`));
    const step = node('button', t('copyStep'), 'copy-step');
    step.onclick = async () => {
      const text = `${finding.id} · ${rule[0]}\n${t('next')}: ${rule[2]}`;
      try { await navigator.clipboard.writeText(text); status('copied'); }
      catch { status('copyFailed'); }
    };
    article.append(meta, node('h3', rule[0]), node('p', rule[1]), node('p', `${t('next')}: ${rule[2]}`, 'next'), step);
    list.append(article);
  }
  root.append(list);
  const actions = node('div', undefined, 'export-actions');
  const download = node('button', t('export')); download.id = 'download';
  download.onclick = () => save(new Blob([reportMarkdown(result, lang)], { type: 'text/markdown;charset=utf-8' }), 'buildpeek-review.md');
  const card = node('button', t('card')); card.id = 'card'; card.onclick = summaryCard;
  const copy = node('button', t('copy')); copy.id = 'copy';
  copy.onclick = async () => {
    try { await navigator.clipboard.writeText(reportMarkdown(result, lang)); status('copied'); }
    catch { status('copyFailed'); }
  };
  actions.append(download, card, copy); root.append(actions);
}
function finish(data) {
  result = data; status('ready'); render();
}
function run() {
  reset();
  if (!$('input').value.trim()) { status('empty'); return; }
  if (new TextEncoder().encode($('input').value).length > MAX_BYTES) { status('tooLarge'); return; }
  status('scanning'); $('scan').disabled = true;
  // file:// blocks module workers, so the offline build reviews inline instead.
  if (location.protocol === 'file:') {
    try { finish(scan($('input').value, $('mode').value)); }
    catch (error) { status(messages.en[error.message] ? error.message : 'workerFailed'); }
    $('scan').disabled = false;
    return;
  }
  const id = requestId;
  try {
    worker = new Worker('./worker.mjs', { type: 'module' });
    worker.onmessage = ({ data }) => {
      if (data.id !== requestId) return;
      worker?.terminate(); worker = null; $('scan').disabled = false;
      if (data.error) { status(messages.en[data.error] ? data.error : 'workerFailed'); return; }
      finish(data.result);
    };
    worker.onerror = () => { reset(); status('workerFailed'); };
    worker.postMessage({ id, input: $('input').value, mode: $('mode').value });
  } catch { reset(); status('workerFailed'); }
}
$('scan').onclick = run;
$('language').onclick = () => {
  lang = lang === 'en' ? 'ja' : 'en';
  const url = new URL(location.href); url.searchParams.set('lang', lang); history.replaceState(null, '', url);
applyLanguage();
if ($('version')) $('version').textContent = '0.1.0';
};
$('input').oninput = () => { reset(); status('stale'); };
$('mode').onchange = () => { reset(); status('stale'); };
$('clear').onclick = () => { reset(); $('input').value = ''; $('file').value = ''; status('clearDone'); $('input').focus(); };
for (const [id, text] of [['demo', risky], ['clean-demo', mounted]]) {
  $(id).onclick = () => {
    $('input').value = text; $('mode').value = 'dockerfile'; run();
    $('workspace').scrollIntoView({ behavior: 'instant', block: 'start' });
  };
}
$('file').onchange = async event => {
  reset(); status(''); const id = requestId;
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > MAX_BYTES) { status('tooLarge'); return; }
  try {
    const text = await file.text();
    if (id !== requestId) return;
    $('input').value = text; $('mode').value = 'auto'; run();
  } catch { if (id === requestId) status('readFailed'); }
};
applyLanguage();
