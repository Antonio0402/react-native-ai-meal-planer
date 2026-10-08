const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { randomUUID } = require('node:crypto');

// Thực thi source thật với fetch/session/storage giả lập; không gọi mạng thật.
function environment({ mocking, platform = 'web', apiUrl, fetch: fetchImpl, api, fastTimeout = false } = {}) {
  const cache = new Map(), storage = new Map(), calls = [];
  let session = { access_token: 'fixture-token' };
  let activeRunner;
  const react = {
    useState(value) {
      const runner = activeRunner, index = runner.cursor++;
      if (!(index in runner.slots)) runner.slots[index] = typeof value === 'function' ? value() : value;
      return [runner.slots[index], value => {
        const next = typeof value === 'function' ? value(runner.slots[index]) : value;
        if (!Object.is(next, runner.slots[index])) { runner.slots[index] = next; runner.schedule(); }
      }];
    },
    useRef(value) {
      const runner = activeRunner, index = runner.cursor++;
      return runner.slots[index] ?? (runner.slots[index] = { current: value });
    },
    useCallback(fn, deps) {
      const runner = activeRunner, index = runner.cursor++;
      const previous = runner.slots[index];
      if (!previous || deps.some((d, i) => !Object.is(d, previous.deps[i]))) runner.slots[index] = { fn, deps };
      return runner.slots[index].fn;
    },
    useEffect(fn, deps) {
      const runner = activeRunner, index = runner.cursor++;
      const previous = runner.slots[index];
      if (!previous || deps.some((d, i) => !Object.is(d, previous.deps[i]))) {
        runner.effects.push(() => { previous?.cleanup?.(); runner.slots[index] = { deps, cleanup: fn() }; });
      }
    },
  };
  const context = vm.createContext({ console, URL, URLSearchParams, Headers, FormData: platform === 'web' ? FormData : class {
      fields = new Map(); append(key, value) { this.fields.set(key, value); } get(key) { return this.fields.get(key); }
    }, Blob, File, AbortController,
    process: { env: { EXPO_PUBLIC_IS_MOCKING: mocking, EXPO_PUBLIC_API_URL: apiUrl } },
    setTimeout: (fn, ms) => setTimeout(fn, ms === 1800 || ms === 1200 || (fastTimeout && ms === 60000) ? 0 : ms), clearTimeout,
    fetch: async (...args) => { calls.push(args); if (!fetchImpl) throw Error('Unexpected HTTP'); return fetchImpl(...args); },
  });
  function load(filename) {
    filename = path.resolve(filename);
    if (cache.has(filename)) return cache.get(filename).exports;
    if (api && filename.endsWith(path.join('services', 'api.ts'))) return api;
    const module = { exports: {} }; cache.set(filename, module);
    const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const localRequire = name => {
      if (name === 'react') return react;
      if (name === 'react-native') return { Platform: { OS: platform } };
      if (name === 'expo-crypto') return { randomUUID };
      if (name === '@react-native-async-storage/async-storage') return {
        getItem: async key => storage.get(key) ?? null,
        setItem: async (key, value) => { storage.set(key, value); },
        removeItem: async key => { storage.delete(key); },
      };
      if (name === './supabase') return { supabase: { auth: { getSession: async () => ({ data: { session }, error: null }) } } };
      if (name.startsWith('.')) return load(path.resolve(path.dirname(filename), name + '.ts'));
      throw Error('Unexpected dependency: ' + name);
    };
    vm.runInContext('(function(require,module,exports){' + source + '\n})', context, { filename })(localRequire, module, module.exports);
    return module.exports;
  }
  function hook(fn) {
    const runner = {
      slots: [], cursor: 0, effects: [], queued: false, disposed: false,
      render() { this.cursor = 0; activeRunner = this; this.value = fn(); activeRunner = undefined; this.effects.splice(0).forEach(f => f()); },
      schedule() { if (!this.queued && !this.disposed) { this.queued = true; queueMicrotask(() => { this.queued = false; if (!this.disposed) this.render(); }); } },
      dispose() { this.disposed = true; this.slots.forEach(s => s?.cleanup?.()); },
    };
    runner.render(); return runner;
  }
  return { load, storage, calls, hook, noSession: () => { session = null; } };
}
const json = (body, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
const currentWeek = environment().load('src/services/meal-utils.ts').weekStartISO();
const base = () => ({ inventory: [], portions: 2, allergies: [], weekStart: currentWeek, slots: {}, checked: {} });
const ingredient = { id: 'egg-1', name: 'Trứng', quantity: 2, unit: 'quả' };
const settle = async () => { for (let i = 0; i < 15; i++) await new Promise(r => setImmediate(r)); };
const plain = value => JSON.parse(JSON.stringify(value));

for (const flag of [undefined, 'false', '1', 'TRUE']) {
  test('mock chỉ bật với true; cờ ' + String(flag) + ' dùng HTTP', async () => {
    const env = environment({ mocking: flag, fetch: () => json([]) });
    const api = env.load('src/services/api.ts');
    assert.equal(api.IS_MOCKING, false); await api.getRecipes(); assert.equal(env.calls.length, 1);
    assert.equal(env.calls[0][1].headers.get('Authorization'), 'Bearer fixture-token');
  });
}
test('mock không cần mạng; giữ thuật toán gợi ý/tuần/đi chợ', async () => {
  const env = environment({ mocking: 'true' }), api = env.load('src/services/api.ts');
  assert.equal((await api.getRecipes()).length, 9);
  const matches = await api.matchRecipes([ingredient], 2, ['hải sản']);
  assert(matches.every(m => !m.recipe.items.some(i => i.name === 'Tôm')));
  const slots = await api.generatePlan([]); assert.equal(Object.keys(slots).length, 21);
  assert((await api.buildShopping({ weekStart: base().weekStart, slots, portions: 2, version: 1 }, [])).length > 0);
  assert.equal((await api.detectIngredients('file:///fixture.jpg')).length, 3);
  const data = { ...base(), inventory: [ingredient] }; await api.saveAppData('alice', data, 0, 'fixture-key');
  assert.equal((await api.getAppData('alice')).data.portions, 2);
  assert.equal((await api.getAppData('bob')).data.inventory.length, 0);
  assert.equal(env.calls.length, 0);
});
test('POST match gửi kho/khẩu phần/dị ứng thật', async () => {
  const env = environment({ fetch: () => json([]) });
  await env.load('src/services/api.ts').matchRecipes([ingredient], 3, ['sữa']);
  const [url, options] = env.calls[0]; assert.equal(url, 'http://127.0.0.1:8000/recipes/match');
  assert.deepEqual(JSON.parse(options.body), { inventory: [ingredient], portions: 3, allergies: ['sữa'] });
});
test('PUT dữ liệu dùng revision và idempotency, không gửi userId trong body', async () => {
  const env = environment({ fetch: () => json({ data: base(), revision: 4 }) });
  await env.load('src/services/api.ts').saveAppData('alice', base(), 3, 'mutation-1');
  const [, options] = env.calls[0]; assert.equal(options.method, 'PUT');
  assert.equal(options.headers.get('If-Match'), '"3"'); assert.equal(options.headers.get('Idempotency-Key'), 'mutation-1');
  assert.deepEqual(JSON.parse(options.body), base());
});
test('web upload file thật, không đặt multipart Content-Type thủ công', async () => {
  const env = environment({ fetch: () => json([ingredient]) });
  await env.load('src/services/api.ts').detectIngredients('blob:fixture', { file: new File(['photo'], 'photo.png', { type: 'image/png' }), fileName: 'photo.png', mimeType: 'image/png' });
  const [, options] = env.calls[0]; assert.equal(options.body.get('file').name, 'photo.png');
  assert.equal(await options.body.get('file').text(), 'photo'); assert.equal(options.headers.get('Content-Type'), null);
});
test('response sai bị từ chối, không dùng mock khi backend lỗi', async () => {
  const env = environment({ fetch: () => json([{ id: 'bad' }]) });
  await assert.rejects(env.load('src/services/api.ts').getRecipes(), /hợp đồng API/);
  const offline = environment({ fetch: () => { throw Error('offline'); } });
  await assert.rejects(offline.load('src/services/api.ts').getRecipes(), /Không kết nối/);
});
test('không có session hoặc origin chưa tin cậy thì không gửi request', async () => {
  const env = environment(); env.noSession(); await assert.rejects(env.load('src/services/api.ts').getRecipes(), /đăng nhập/); assert.equal(env.calls.length, 0);
  const untrusted = environment({ apiUrl: 'https://untrusted.invalid' });
  await assert.rejects(untrusted.load('src/services/api.ts').getRecipes(), /chưa được phê duyệt/); assert.equal(untrusted.calls.length, 0);
});
test('lỗi nhận diện blurry giữ đúng loại lỗi cho UI', async () => {
  const env = environment({ fetch: () => json({ detail: { code: 'blurry', message: 'private server message' } }, 422) });
  const api = env.load('src/services/api.ts'); await assert.rejects(api.detectIngredients('blob:fixture', { file: new File(['x'], 'photo.jpg') }), e => e instanceof api.DetectError && e.kind === 'blurry' && !e.message.includes('private'));
});
test('lập tuần thiếu bữa và response trạng thái sai đều bị từ chối', async () => {
  const env = environment({ fetch: () => json({ '0-0': 'recipe' }) });
  await assert.rejects(env.load('src/services/api.ts').generatePlan([]), /21 bữa/);
  const schema = env.load('src/services/api-schema.ts');
  assert.equal(schema.appData({ ...base(), portions: Infinity }), false);
  assert.equal(schema.appData({ ...base(), slots: { '7-0': 'recipe' } }), false);
  assert.equal(schema.ingredients([ingredient, ingredient]), false);
});

test('state tải trước khi ghi; PUT tuần tự giữ thay đổi mới và revision', async () => {
  const saves = [], deferred = [];
  const env = environment({ api: { ApiError: class extends Error {}, getAppData: async () => ({ data: base(), revision: 0 }), saveAppData: (...args) => new Promise(resolve => { saves.push(args); deferred.push(resolve); }) } });
  const state = env.load('src/state.ts'), runner = env.hook(() => state.useAppData('alice'));
  await settle(); assert.equal(runner.value.ready, true); assert.equal(saves.length, 0);
  runner.value.setData(d => ({ ...d, inventory: [ingredient] })); await settle(); assert.equal(saves.length, 1);
  runner.value.setData(d => ({ ...d, portions: 3 })); await settle(); assert.equal(saves.length, 1);
  assert.equal(JSON.parse(env.storage.get('freshplan.draft.alice')).pending.portions, 3);
  deferred[0]({ data: saves[0][1], revision: 1 }); await settle(); assert.equal(saves.length, 2); assert.equal(saves[1][2], 1); assert.equal(saves[1][1].portions, 3);
  assert.notEqual(saves[0][3], saves[1][3]); deferred[1]({ data: saves[1][1], revision: 2 }); await settle();
  assert.equal(env.storage.has('freshplan.draft.alice'), false); assert.equal(runner.value.saving, false); runner.dispose();
});
test('state lưu lỗi giữ draft; thử lại cùng payload và khóa rồi lưu thay đổi mới', async () => {
  const saves = []; let fail = true;
  const env = environment({ api: { ApiError: class extends Error {}, getAppData: async () => ({ data: base(), revision: 0 }), saveAppData: async (...args) => { saves.push(args); if (fail) throw Error('offline'); return { data: args[1], revision: args[2] + 1 }; } } });
  const runner = env.hook(() => env.load('src/state.ts').useAppData('alice')); await settle();
  runner.value.setData(d => ({ ...d, inventory: [ingredient] })); await settle(); assert(runner.value.syncError); assert(env.storage.has('freshplan.draft.alice'));
  runner.value.setData(d => ({ ...d, portions: 4 })); await settle(); assert.equal(saves.length, 1);
  fail = false; runner.value.retrySync(); await settle(); assert.equal(saves.length, 3);
  assert.equal(saves[1][3], saves[0][3]); assert.deepEqual(plain(saves[1][1]), plain(saves[0][1])); assert.equal(saves[2][1].portions, 4);
  assert.equal(runner.value.syncError, undefined); runner.dispose();
});
test('state lỗi tải không ghi snapshot trống', async () => {
  let count = 0;
  const env = environment({ api: { ApiError: class extends Error {}, getAppData: async () => { throw Error('offline'); }, saveAppData: async () => { count++; } } });
  const runner = env.hook(() => env.load('src/state.ts').useAppData('alice')); await settle();
  assert.equal(runner.value.ready, false); assert(runner.value.syncError); assert.equal(count, 0); runner.dispose();
});
test('state khôi phục draft cùng revision và chặn draft xung đột', async () => {
  let saves = 0;
  const api = { ApiError: class extends Error {}, getAppData: async () => ({ data: base(), revision: 2 }), saveAppData: async (_id, data) => { saves++; return { data, revision: 3 }; } };
  const env = environment({ api }); env.storage.set('freshplan.draft.alice', JSON.stringify({ data: { ...base(), portions: 3 }, revision: 1, mutationId: 'cached' }));
  const runner = env.hook(() => env.load('src/state.ts').useAppData('alice')); await settle();
  assert.equal(runner.value.conflict, true); assert.equal(runner.value.data.portions, 3); assert.equal(saves, 0);
  await runner.value.discardDraft(); await settle(); assert.equal(runner.value.data.portions, 2); assert.equal(runner.value.conflict, false); assert.equal(saves, 0); runner.dispose();
  const same = environment({ api }); same.storage.set('freshplan.draft.alice', JSON.stringify({ data: { ...base(), portions: 3 }, revision: 2, mutationId: 'cached' }));
  const restored = same.hook(() => same.load('src/state.ts').useAppData('alice')); await settle(); assert.equal(restored.value.data.portions, 3); assert.equal(saves, 1); assert.equal(same.storage.has('freshplan.draft.alice'), false); restored.dispose();
});
test('native upload giữ URI và MIME của ảnh HEIC', async () => {
  const env = environment({ platform: 'ios', fetch: () => json([ingredient]) });
  await env.load('src/services/api.ts').detectIngredients('file:///photo.heic', { fileName: 'photo.heic', mimeType: 'image/heic' });
  const [, options] = env.calls[0];
  assert.deepEqual(plain(options.body.get('file')), { uri: 'file:///photo.heic', name: 'photo.heic', type: 'image/heic' });
  assert.equal(options.headers.get('Content-Type'), null);
});
test('HTTP timeout và hủy request không chuyển sang dữ liệu mock', async () => {
  const hanging = (_url, options) => new Promise((_resolve, reject) => {
    if (options.signal.aborted) return reject(Error('aborted'));
    options.signal.addEventListener('abort', () => reject(Error('aborted')));
  });
  const env = environment({ fastTimeout: true, fetch: hanging });
  await assert.rejects(env.load('src/services/api.ts').getRecipes(), e => e.code === 'timeout');
  const cancelled = environment({ fetch: hanging }), controller = new AbortController(); controller.abort();
  await assert.rejects(cancelled.load('src/services/api.ts').getRecipes([], controller.signal), /aborted/);
});
test('query bỏ qua response cũ khi thay tham số', async () => {
  const env = environment(), deferred = []; let selection = 0;
  const loaders = [0, 1].map(index => () => new Promise(resolve => { deferred[index] = resolve; }));
  const query = env.load('src/hooks/useApiQuery.ts'), runner = env.hook(() => query.useApiQuery(loaders[selection], []));
  assert.equal(runner.value.loading, true); selection = 1; runner.render();
  deferred[0](['old']); await settle(); assert.equal(runner.value.loading, true);
  deferred[1](['new']); await settle(); assert.deepEqual(plain(runner.value.value), ['new']); assert.equal(runner.value.loading, false); runner.dispose();
});
test('khôi phục thay đổi mới sau PUT đã thành công nhưng mất response', async () => {
  const saved = { ...base(), inventory: [ingredient] }, latest = { ...saved, portions: 4 }, calls = [];
  const env = environment({ api: { ApiError: class extends Error {}, getAppData: async () => ({ data: saved, revision: 1 }), saveAppData: async (...args) => { calls.push(args); return { data: args[1], revision: 2 }; } } });
  env.storage.set('freshplan.draft.alice', JSON.stringify({ data: saved, pending: latest, revision: 0, mutationId: 'previous' }));
  const runner = env.hook(() => env.load('src/state.ts').useAppData('alice')); await settle();
  assert.equal(runner.value.data.portions, 4); assert.equal(calls.length, 1); assert.equal(calls[0][2], 1); assert.notEqual(calls[0][3], 'previous'); runner.dispose();
});
