import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

async function run({
  admin = true,
  error = null,
  token = 'Bearer test',
  method = 'POST',
  body = {},
  updateResult = { id: '11111111-1111-4111-8111-111111111111', status: 'active', plan: 'Gold' },
  updateError = null
} = {}) {
  const env = {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'public',
    SUPABASE_SERVICE_ROLE_KEY: 'service-key'
  };

  let updatedPayload = null;
  const context = vm.createContext({ process: { env } });

  const dependency = new vm.SyntheticModule(['createClient'], function () {
    this.setExport('createClient', (_url, key, options) => {
      if (key === 'public') {
        return {
          rpc: async (name) => {
            assert.equal(name, 'current_platform_admin');
            return { data: admin, error };
          }
        };
      }
      return {
        from: (table) => {
          assert.equal(table, 'tenants');
          return {
            update: (payload) => {
              updatedPayload = payload;
              return {
                eq: (col, val) => {
                  assert.equal(col, 'id');
                  return {
                    select: () => ({
                      maybeSingle: async () => ({ data: updateResult, error: updateError })
                    })
                  };
                }
              };
            }
          };
        }
      };
    });
  }, { context });

  const module = new vm.SourceTextModule(
    await readFile(new URL('../api/admin-manage-clinic.js', import.meta.url), 'utf8'),
    { context }
  );
  await module.link(() => dependency);
  await module.evaluate();

  const response = {
    code: 200,
    setHeader() {},
    status(code) {
      this.code = code;
      return this;
    },
    json(b) {
      this.body = b;
      return this;
    }
  };

  await module.namespace.default(
    { method, headers: { authorization: token }, body },
    response
  );

  return { ...response, updatedPayload };
}

test('admin-manage-clinic rejeita métodos diferentes de POST', async () => {
  const r = await run({ method: 'GET' });
  assert.equal(r.code, 405);
});

test('admin-manage-clinic rejeita requisições sem token', async () => {
  const r = await run({ token: null });
  assert.equal(r.code, 401);
});

test('admin-manage-clinic rejeita usuário que não seja superadmin', async () => {
  const r = await run({ admin: false });
  assert.equal(r.code, 403);
});

test('admin-manage-clinic valida tenantId, status e plan', async () => {
  // tenantId inválido
  const r1 = await run({ body: { tenantId: 'invalido' } });
  assert.equal(r1.code, 400);

  // status inválido
  const r2 = await run({ body: { tenantId: '11111111-1111-4111-8111-111111111111', status: 'inexistente' } });
  assert.equal(r2.code, 400);

  // plan inválido
  const r3 = await run({ body: { tenantId: '11111111-1111-4111-8111-111111111111', plan: 'Invalido' } });
  assert.equal(r3.code, 400);

  // payload vazio
  const r4 = await run({ body: { tenantId: '11111111-1111-4111-8111-111111111111' } });
  assert.equal(r4.code, 400);
});

test('admin-manage-clinic atualiza status, plano, preço e data de renovação com sucesso', async () => {
  const r = await run({
    body: {
      tenantId: '11111111-1111-4111-8111-111111111111',
      status: 'active',
      plan: 'Silver',
      price: 197,
      renewalDate: '2026-12-01'
    }
  });

  assert.equal(r.code, 200);
  assert.equal(r.body.success, true);
  assert.deepEqual(JSON.parse(JSON.stringify(r.updatedPayload)), {
    status: 'active',
    plan: 'Silver',
    price: 197,
    renewal_date: '2026-12-01'
  });
});
