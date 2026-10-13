/** Sinh schema theo đúng project; các thao tác Supabase chỉ đọc. */
import { readFile, writeFile, mkdir, rm, open } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export const frontend = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const backend = path.resolve(frontend, '../fast-api');
const tooling = path.join(frontend, 'tools/schema-codegen/node_modules');
const generated = path.join(frontend, 'src/services/generated');
const snapshotFile = path.join(backend, 'database.schema.json');
const cli = path.join(tooling, 'supabase/dist/supabase.js');
const python = path.join(backend, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');

export async function readConfig(directory, environment = process.env) {
  let values = {};
  for (const name of ['.env', '.env.local']) {
    const filename = path.join(directory, name);
    if (existsSync(filename)) values = { ...values, ...parseEnv(await readFile(filename, 'utf8')) };
  }
  return { ...values, ...environment };
}

export function verifyConfig(front, back) {
  const refFor = value => {
    let url;
    try { url = new URL(value); } catch { throw new Error('Thiếu hoặc sai URL Supabase.'); }
    const match = /^([a-z0-9]{20})\.supabase\.co$/.exec(url.hostname);
    if (url.protocol !== 'https:' || !match || url.username || url.password || url.search)
      throw new Error('Cần URL Supabase chuẩn để xác minh project; custom domain phải được cấu hình riêng trước.');
    return match[1];
  };
  const project = refFor(front.EXPO_PUBLIC_SUPABASE_URL);
  if (project !== refFor(back.SUPABASE_URL)) throw new Error('Frontend và backend trỏ tới project Supabase khác nhau.');
  let dsn = back.DATABASE_URL;
  if (dsn?.includes('${DATABASE_PASSWORD}')) {
    if (!back.DATABASE_PASSWORD) throw new Error('Thiếu DATABASE_PASSWORD được tham chiếu trong DATABASE_URL.');
    // Mật khẩu được URL-encode trước khi chèn, kể cả ký tự @, #, / hoặc %.
    dsn = dsn.replaceAll('${DATABASE_PASSWORD}', encodeURIComponent(back.DATABASE_PASSWORD));
  }
  if (dsn?.includes('${')) throw new Error('DATABASE_URL còn biến tham chiếu chưa được hỗ trợ.');
  let database;
  try { database = new URL(dsn?.replace(/^postgresql\+psycopg:/, 'postgresql:')); }
  catch { throw new Error('Thiếu hoặc sai DATABASE_URL của backend.'); }
  if (!['postgres:', 'postgresql:'].includes(database.protocol)) throw new Error('DATABASE_URL phải là PostgreSQL.');
  const username = decodeURIComponent(database.username);
  const direct = database.hostname === `db.${project}.supabase.co`;
  const pooled = database.hostname.endsWith('.pooler.supabase.com') && username.endsWith(`.${project}`);
  if (!direct && !pooled) throw new Error('DATABASE_URL không xác minh được là database của project đã chọn.');
  if (decodeURIComponent(database.pathname) !== '/postgres') throw new Error('Cần xác minh riêng database khác postgres trước khi sinh types.');
  for (const config of [front, back]) {
    if (config.SUPABASE_PROJECT_ID && config.SUPABASE_PROJECT_ID !== project)
      throw new Error('SUPABASE_PROJECT_ID không khớp URL Supabase.');
  }
  return { project, databaseUrl: database.href };
}

function run(command, args, environment = process.env, message = 'Lệnh sinh schema thất bại.') {
  const result = spawnSync(command, args, { cwd: backend, env: environment, encoding: 'utf8',
    timeout: 120000, maxBuffer: 16 * 1024 * 1024, windowsHide: true });
  // Không in stderr/args: CLI hoặc driver có thể nhắc DSN/token.
  if (result.error || result.status !== 0) throw new Error(message);
  return result.stdout;
}

async function config() {
  return verifyConfig(await readConfig(frontend), await readConfig(backend));
}

async function databaseSnapshot() {
  const { project, databaseUrl } = await config();
  const projects = JSON.parse(run(process.execPath, [cli, 'projects', 'list', '--output', 'json'], process.env,
    'Supabase CLI chưa đăng nhập hoặc không đọc được project. Chạy npm run login:supabase trên máy; không gửi token vào chat.'));
  const list = Array.isArray(projects) ? projects : projects.projects;
  if (!Array.isArray(list) || !list.some(item => item.id === project || item.ref === project))
    throw new Error('Tài khoản CLI không thấy project từ cấu hình.');
  console.log(`Đã xác minh project ${project} và tenant DATABASE_URL.`);
  const metadata = JSON.parse(run(python, ['-m', 'scripts.schema_contract', 'database'],
    { ...process.env, SCHEMA_DATABASE_URL: databaseUrl, PYTHONIOENCODING: 'utf-8' },
    'Không đọc được metadata database. Kiểm tra kết nối PostgreSQL và quyền đọc catalog.'));
  if (metadata.database !== 'postgres') throw new Error('Database thực tế không khớp database đã cấu hình.');
  assertBackendTables(metadata);
  return JSON.stringify({ project_ref: project, ...metadata }, null, 2) + '\n';
}

export function assertBackendTables(metadata) {
  // Các bảng JSONB đang phục vụ trực tiếp hợp đồng mobile của FastAPI.
  const required = {
    app_data_snapshots: { user_id: 'uuid', data: 'jsonb', revision: 'bigint', updated_at: 'timestamp with time zone' },
    app_data_mutations: { user_id: 'uuid', mutation_id: 'uuid', request_hash: 'text', response_json: 'jsonb', created_at: 'timestamp with time zone' },
    user_recipes: { user_id: 'uuid', id: 'uuid', recipe: 'jsonb', source_hash: 'text', created_at: 'timestamp with time zone' },
  };
  for (const [table, columns] of Object.entries(required)) {
    if (!metadata.tables.some(item => item.name === table && item.rls)) throw new Error(`Thiếu bảng/RLS bắt buộc: ${table}.`);
    for (const [name, type] of Object.entries(columns)) {
      if (!metadata.columns.some(item => item.table_name === table && item.name === name && item.type === type && item.not_null))
        throw new Error(`Column không khớp hợp đồng backend: ${table}.${name}.`);
    }
    if (metadata.grants.some(item => item.table_name === table && ['anon', 'authenticated', 'PUBLIC'].includes(item.grantee)))
      throw new Error(`Bảng backend có grant ngoài hợp đồng: ${table}.`);
  }
}

export const normalize = value => value.replace(/\r\n/g, '\n').trimEnd() + '\n';

export async function drift(snapshot) {
  if (!existsSync(snapshotFile) || normalize(await readFile(snapshotFile, 'utf8')) !== normalize(snapshot))
    return [path.relative(path.resolve(frontend, '..'), snapshotFile)];
  return [];
}

async function saveSnapshot() {
  const snapshot = await databaseSnapshot();
  const changed = await drift(snapshot);
  if (changed.length) console.log(`Baseline mới hoặc drift cần review: ${changed.join(', ')}`);
  await writeFile(snapshotFile, snapshot, 'utf8');
  console.log('Đã cập nhật baseline metadata để review. Không chạy migration.');
}

async function checkDatabase() {
  const changed = await drift(await databaseSnapshot());
  if (changed.length) throw new Error(`Schema drift hoặc thiếu baseline: ${changed.join(', ')}. Review trước khi chạy snapshot:database.`);
  console.log('Metadata database khớp baseline đã lưu.');
}

async function generateAPI() {
  // Xuất lại OpenAPI từ source backend, không phụ thuộc backend đang chạy.
  const source = run(python, ['-m', 'scripts.schema_contract', 'api']);
  const { default: openapiTS, astToString } = await import(pathToFileURL(path.join(tooling, 'openapi-typescript/dist/index.mjs')));
  const ast = await openapiTS(JSON.parse(source));
  await mkdir(generated, { recursive: true });
  await writeFile(path.join(generated, 'api.types.ts'),
    '// Được sinh từ FastAPI OpenAPI bằng npm run generate:api:offline; không sửa thủ công.\n' + astToString(ast), 'utf8');
  console.log('Đã sinh API types từ response/request models đang gắn trên route.');
}

async function dispatch(mode) {
  if (mode === 'verify') { const value = await config(); console.log(`Cấu hình cùng project ${value.project}. Chưa kiểm tra quyền CLI/database live.`); }
  else if (mode === 'snapshot') await saveSnapshot();
  else if (mode === 'check') await checkDatabase();
  else if (mode === 'offline') await generateAPI();
  else if (mode === 'all') { await checkDatabase(); await generateAPI(); }
  else throw new Error('Mode phải là verify, snapshot, check, offline hoặc all.');
}

export async function main(mode = process.argv[2]) {
  if (!['snapshot', 'offline', 'all'].includes(mode)) return dispatch(mode);
  const lockFile = path.join(frontend, '.schema-codegen.lock');
  let lock;
  try { lock = await open(lockFile, 'wx'); }
  catch { throw new Error('Codegen đang chạy hoặc còn file khóa .schema-codegen.lock; xác minh tiến trình trước khi xóa khóa cũ.'); }
  try { await dispatch(mode); }
  finally { await lock.close(); await rm(lockFile); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
