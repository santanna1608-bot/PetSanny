import test from 'node:test';
import assert from 'node:assert/strict';
import { loadServices } from './service-loader.mjs';
const { exports: { hasPlanFeature } } = await loadServices({}, 'src/lib/planAccess.ts');
test('recursos seguem os três planos, com falha fechada para plano desconhecido', () => {
  for (const feature of ['recovery','tutorPortal','careStages']) {
    assert.equal(hasPlanFeature({plan:'Bronze'},feature,'2026-10-11'),false);
    assert.equal(hasPlanFeature({plan:'Silver'},feature,'2026-10-11'),true);
    assert.equal(hasPlanFeature({plan:'Gold'},feature,'2026-10-11'),true);
  }
  for (const feature of ['recoveryMetrics','crm','connections']) {
    assert.equal(hasPlanFeature({plan:'Silver'},feature,'2026-10-11'),false);
    assert.equal(hasPlanFeature({plan:'Gold'},feature,'2026-10-11'),true);
    assert.equal(hasPlanFeature({plan:'unexpected'},feature,'2026-10-11'),false);
  }
});
test('teste gratuito completo termina na data registrada e downgrade usa o novo plano', () => {
  assert.equal(hasPlanFeature({plan:'Bronze',status:'trial',renewalDate:'2026-10-11'},'crm','2026-10-11'),true);
  assert.equal(hasPlanFeature({plan:'Bronze',status:'trial',renewalDate:'2026-10-10'},'crm','2026-10-11'),false);
  assert.equal(hasPlanFeature({plan:'Bronze',status:'active',renewalDate:'2026-12-10'},'crm','2026-10-11'),false);
});
