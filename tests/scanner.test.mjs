import test from 'node:test';
import assert from 'node:assert/strict';
import { scan, reportMarkdown, MAX_BYTES, RULES } from '../web/scanner.mjs';
import { messages } from '../web/i18n.mjs';
const ids = (text, mode = 'dockerfile') => scan(text, mode).findings.map(f => f.id);

test('ARG flags secret-like names but not harmless args', () => {
  assert.deepEqual(ids('ARG GITHUB_TOKEN'), ['BP001']);
  assert.deepEqual(ids('ARG NODE_VERSION=22'), []);
});
test('ENV checks all assignments and legacy syntax', () => {
  assert.deepEqual(ids('ENV NODE_ENV=production API_KEY=example'), ['BP002']);
  assert.deepEqual(ids('ENV PASSWORD example'), ['BP002']);
});
test('known token format is detected without returning the token', () => {
  const token = 'ghp_' + 'sYnThEtIc1234'.repeat(3);
  const result = scan(`RUN use ${token}`, 'dockerfile');
  assert.equal(result.high, 1);
  assert.equal(result.findings[0].id, 'BP003');
  assert.ok(!JSON.stringify(result).includes(token));
  for (const lang of ['en', 'ja']) assert.ok(!reportMarkdown(result, lang).includes(token));
});
test('private-key headers detected', () => assert.ok(ids('RUN echo "-----BEGIN OPENSSH PRIVATE KEY-----"').includes('BP003')));
test('authenticated Git URL flags both URL and persisted config', () => {
  assert.deepEqual(ids('RUN git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "git@github.com:"'), ['BP004', 'BP007']);
});
test('history retains secret detection even if a later instruction deletes a file', () => {
  const result = scan('COPY .env /app/.env\nRUN rm /app/.env', 'history');
  assert.deepEqual(result.findings.map(f => [f.id, f.line]), [['BP005', 1]]);
});
test('COPY flags, JSON syntax and destination exclusion', () => {
  assert.deepEqual(ids('COPY --chown=app:app .env /app/'), ['BP005']);
  assert.deepEqual(ids('COPY [".env", "/app/"]'), ['BP005']);
  assert.deepEqual(ids('COPY harmless.txt /app/.env'), []);
});
test('template exception does not hide a real sensitive source', () => {
  assert.deepEqual(ids('COPY .env.example /app/'), []);
  assert.deepEqual(ids('COPY .env.example .env /app/'), ['BP005']);
  assert.deepEqual(ids('COPY .env.sample .npmrc /app/'), ['BP005']);
});
test('whole-context copy requires review', () => {
  assert.deepEqual(ids('COPY . /app'), ['BP006']);
  assert.deepEqual(ids('ADD ["./", "/app/"]'), ['BP006']);
});
test('multiline Dockerfile preserves first line position', () => {
  const result = scan('# comment\nFROM alpine\nENV NODE_ENV=production \\\n API_KEY=example', 'dockerfile');
  assert.equal(result.findings[0].line, 3);
});
test('Dockerfile comments do not produce findings', () => {
  assert.deepEqual(ids('# ARG PASSWORD\nFROM alpine'), []);
});
test('mount with non-persisting use does not trigger secret findings', () => {
  const result = scan('RUN --mount=type=secret,id=aws AWS_SHARED_CREDENTIALS_FILE=/run/secrets/aws aws s3 cp s3://example/a /a', 'dockerfile');
  assert.equal(result.secretMounts, 1);
  assert.equal(result.findings.length, 0);
});
test('mount does not excuse printing a secret or writing auth config', () => {
  assert.deepEqual(ids('RUN --mount=type=secret,id=npm cat /run/secrets/npm > /root/.npmrc'), ['BP007', 'BP008']);
});
test('shell tracing and echoing secret variables need review', () => {
  assert.deepEqual(ids('RUN set -eux; echo $API_KEY'), ['BP008']);
});
test('image config scans history and env with precise locations', () => {
  const result = scan(JSON.stringify({ history: [{ created_by: '/bin/sh -c #(nop) ARG GITHUB_TOKEN' }], config: { Env: ['PASSWORD=example'] } }));
  assert.equal(result.mode, 'json');
  assert.deepEqual(result.findings.map(f => [f.id, f.location, f.line]), [['BP001', 'history', 1], ['BP002', 'env', 1]]);
});
test('docker inspect array env is recognized', () => {
  assert.equal(scan(JSON.stringify([{ Config: { Env: ['API_KEY=example'] } }])).findings[0].id, 'BP002');
});
test('unsupported, malformed and null JSON fail visibly', () => {
  for (const text of ['{}', '[null]', '{"history":[]}']) assert.throws(() => scan(text, 'json'), /unsupportedJson/);
  assert.throws(() => scan('{'), /invalidJson/);
});
test('empty, oversized and binary input are rejected', () => {
  assert.throws(() => scan(' '), /empty/);
  assert.throws(() => scan('# only comment', 'dockerfile'), /empty/);
  assert.throws(() => scan('a'.repeat(MAX_BYTES + 1)), /tooLarge/);
  assert.throws(() => scan('FROM alpine\0'), /binary/);
});
test('findings are capped and truncation is explicit in report', () => {
  const result = scan('ARG PASSWORD\n'.repeat(600), 'dockerfile');
  assert.equal(result.findings.length, 500);
  assert.equal(result.truncated, true);
  assert.match(reportMarkdown(result), /TRUNCATED/);
});
test('arbitrary source text cannot leak into exported report', () => {
  const marker = '<script>alert("private-project-name")</script>';
  const result = scan(`RUN ${marker}\nARG PASSWORD`);
  assert.ok(!reportMarkdown(result).includes('private-project-name'));
  assert.ok(!reportMarkdown(result).includes('<script>'));
});
test('localization keys and rule translations match', () => {
  assert.deepEqual(Object.keys(messages.en).sort(), Object.keys(messages.ja).sort());
  assert.equal(Object.keys(RULES).length, 8);
  for (const rule of Object.values(RULES)) {
    assert.equal(rule.en.length, 3); assert.equal(rule.ja.length, 3);
  }
});
