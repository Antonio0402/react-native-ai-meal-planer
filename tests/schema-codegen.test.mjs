import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { verifyConfig, assertBackendTables, normalize, drift } from '../scripts/schema-codegen.mjs';

const project = 'abcdefghijklmnopqrst';
const front = { EXPO_PUBLIC_SUPABASE_URL: `https://${project}.supabase.co` };
const back = { SUPABASE_URL: `https://${project}.supabase.co`,
  DATABASE_URL: `postgresql://postgres.${project}:not-a-real-password@aws-0.pooler.supabase.com:6543/postgres` };

test('URL frontend/backend và tenant pooler phải cùng project', () => {
  assert.equal(verifyConfig(front, back).project, project);
  assert.throws(() => verifyConfig(front, { ...back, SUPABASE_URL: 'https://zzzzzzzzzzzzzzzzzzzz.supabase.co' }), /khác nhau/);
  assert.throws(() => verifyConfig(front, { ...back, DATABASE_URL: back.DATABASE_URL.replace(project, 'zzzzzzzzzzzzzzzzzzzz') }), /database của project/);
});

test('direct DB và SQLAlchemy psycopg URL được nhận diện', () => {
  assert.equal(verifyConfig(front, { ...back, DATABASE_URL: `postgresql+psycopg://postgres:password@db.${project}.supabase.co:5432/postgres` }).project, project);
});

test('tham chiếu DATABASE_PASSWORD được URL-encode, không dùng placeholder để kết nối', () => {
  const result = verifyConfig(front, { ...back, DATABASE_PASSWORD: 'p@ss:/#%',
    DATABASE_URL: back.DATABASE_URL.replace('not-a-real-password', '${DATABASE_PASSWORD}') });
  assert.equal(decodeURIComponent(new URL(result.databaseUrl).password), 'p@ss:/#%');
  assert.throws(() => verifyConfig(front, { ...back, DATABASE_URL: '${UNKNOWN}' }), /tham chiếu/);
});

test('từ chối URL giả và database khác, lỗi không chứa credentials', () => {
  for (const url of ['sqlite:///:memory:', back.DATABASE_URL.replace(/\/postgres$/, '/other'),
    back.DATABASE_URL.replace('aws-0.pooler.supabase.com', 'malicious.invalid')]) {
    assert.throws(() => verifyConfig(front, { ...back, DATABASE_URL: url }), error => !error.message.includes('not-a-real-password'));
  }
  assert.throws(() => verifyConfig(front, { ...back, SUPABASE_PROJECT_ID: 'wrong' }), /không khớp/);
});

test('guard backend từ chối thiếu bảng, column hoặc RLS', () => {
  assert.throws(() => assertBackendTables({ tables: [], columns: [], grants: [] }), /Thiếu bảng/);
  assert.throws(() => assertBackendTables({ tables: [{ name: 'app_data_snapshots', rls: true }], columns: [], grants: [] }), /Column/);
});

test('normalize giữ newline LF ổn định', () => {
  assert.equal(normalize('types\r\n\r\n'), 'types\n');
});

test('drift phát hiện metadata thay đổi mà không ghi đè baseline', async () => {
  const schemaFile = new URL('../../fast-api/database.schema.json', import.meta.url);
  const before = await readFile(schemaFile, 'utf8');
  const schema = JSON.parse(before);
  schema.columns[0].type = 'simulated-column-change';
  assert.deepEqual((await drift(JSON.stringify(schema, null, 2) + '\n')).map(p => p.replaceAll('\\', '/')), ['fast-api/database.schema.json']);
  assert.equal(await readFile(schemaFile, 'utf8'), before);
});

test('guard từ chối grant client hoặc đổi nullability của bảng backend', async () => {
  const schema = JSON.parse(await readFile(new URL('../../fast-api/database.schema.json', import.meta.url), 'utf8'));
  assertBackendTables(schema);
  const exposed = structuredClone(schema);
  exposed.grants.push({ table_name: 'app_data_snapshots', grantee: 'anon', privilege_type: 'SELECT' });
  assert.throws(() => assertBackendTables(exposed), /grant ngoài hợp đồng/);
  const nullable = structuredClone(schema);
  nullable.columns.find(c => c.table_name === 'app_data_snapshots' && c.name === 'data').not_null = false;
  assert.throws(() => assertBackendTables(nullable), /Column/);
});

test('generate:api dừng khi kiểm tra project lỗi, không ghi baseline hoặc API types', async () => {
  const baseline = new URL('../../fast-api/database.schema.json', import.meta.url);
  const types = new URL('../src/services/generated/api.types.ts', import.meta.url);
  const before = await Promise.all([readFile(baseline, 'utf8'), readFile(types, 'utf8')]);
  const result = spawnSync(process.execPath, ['scripts/schema-codegen.mjs', 'all'], {
    cwd: fileURLToPath(new URL('../', import.meta.url)), encoding: 'utf8', timeout: 10000,
    env: { ...process.env, EXPO_PUBLIC_SUPABASE_URL: 'https://abcdefghijklmnopqrst.supabase.co',
      SUPABASE_URL: 'https://zzzzzzzzzzzzzzzzzzzz.supabase.co' },
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /khác nhau/);
  assert.deepEqual(await Promise.all([readFile(baseline, 'utf8'), readFile(types, 'utf8')]), before);
});
