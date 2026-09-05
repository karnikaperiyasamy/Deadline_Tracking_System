import request from 'supertest';
import app from '../app';
import assert from 'assert';

async function runHealthCheckTest() {
  console.log('Running API Health Check Verification Test...');
  const res = await request(app).get('/api/health');
  assert.strictEqual(res.status, 200, 'Expected status 200');
  assert.strictEqual(res.body.status, 'ok', 'Expected body.status to be ok');
  assert.strictEqual(res.body.service, 'LifeOS API', 'Expected service name to match');
  console.log('✅ API Health Check PASSED successfully:', res.body);
}

runHealthCheckTest().catch((err) => {
  console.error('❌ Health Check Test Failed:', err);
  process.exit(1);
});
