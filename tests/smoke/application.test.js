const test = require('node:test');
const assert = require('node:assert/strict');

const API_URL = process.env.SKILLSWAP_API_URL || 'http://localhost:5002';
const WEB_URL = process.env.SKILLSWAP_WEB_URL || 'http://localhost:5002';

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = text;
  try {
    body = JSON.parse(text);
  } catch {
    // Keep HTML as text for frontend route checks.
  }
  return { response, body };
}

function assertApiSuccess(result) {
  assert.equal(result.response.ok, true, JSON.stringify(result.body));
  assert.equal(result.body.success, true, JSON.stringify(result.body));
}

async function login() {
  const result = await request(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'demo@example.com', password: 'password123' })
  });
  assertApiSuccess(result);
  return result.body.data;
}

function authHeaders(token) {
  return { Authorization: ['Bearer', token].join(' ') };
}

test('API health check reports a healthy Swedish deployment', async () => {
  const result = await request(`${API_URL}/api/health`);
  assert.equal(result.response.ok, true, JSON.stringify(result.body));
  assert.equal(result.body.status, 'OK');
  assert.equal(result.body.timezone, 'Europe/Stockholm');
  assert.equal(typeof result.body.uptime, 'number');
});

test('public discovery endpoints return seeded content', async () => {
  const endpoints = [
    '/api/skills/available',
    '/api/skills/categories',
    '/api/skills/filters',
    '/api/skills/search?skill=TypeScript',
    '/api/users/search?q=TypeScript'
  ];

  for (const endpoint of endpoints) {
    const result = await request(`${API_URL}${endpoint}`);
    assertApiSuccess(result);
    assert.notEqual(result.body.data, undefined, `${endpoint} did not return data`);
  }

  const skills = await request(`${API_URL}/api/skills/available`);
  assert.ok(skills.body.data.length > 0, 'seeded skills are missing');
});

test('authentication protects private resources and supports demo login', async () => {
  const unauthorized = await request(`${API_URL}/api/auth/me`);
  assert.equal(unauthorized.response.status, 401);
  assert.equal(unauthorized.body.success, false);

  const session = await login();
  assert.ok(session.user.id);
  assert.ok(session.token);

  const headers = authHeaders(session.token);
  const me = await request(`${API_URL}/api/auth/me`, { headers });
  assertApiSuccess(me);
  assert.equal(me.body.data.email, 'demo@example.com');

  const refresh = await request(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers
  });
  assertApiSuccess(refresh);
  assert.ok(refresh.body.data.token);
});

test('authenticated dashboard resources return valid data', async () => {
  const session = await login();
  const headers = authHeaders(session.token);
  const endpoints = [
    '/api/exchanges/my-exchanges',
    '/api/exchanges',
    '/api/users/my-transactions',
    '/api/notifications',
    '/api/notifications/unread-count'
  ];

  for (const endpoint of endpoints) {
    const result = await request(`${API_URL}${endpoint}`, { headers });
    assertApiSuccess(result);
    assert.notEqual(result.body.data, undefined, `${endpoint} did not return data`);
  }
});

test('seeded exchange details include message history', async () => {
  const session = await login();
  const headers = authHeaders(session.token);
  const exchanges = await request(`${API_URL}/api/exchanges/my-exchanges`, { headers });
  assertApiSuccess(exchanges);
  assert.ok(exchanges.body.data.length > 0, 'seeded exchange is missing');

  const exchangeId = exchanges.body.data[0].id;
  const details = await request(`${API_URL}/api/exchanges/${exchangeId}`, { headers });
  assertApiSuccess(details);
  assert.equal(details.body.data.id, exchangeId);
  assert.ok(Array.isArray(details.body.data.messages));
});

test('frontend serves every application route', async () => {
  const routes = [
    '/',
    '/login',
    '/register',
    '/search',
    '/dashboard',
    '/profile',
    '/messages',
    '/transactions',
    '/exchange/demo'
  ];

  for (const route of routes) {
    const result = await request(`${WEB_URL}${route}`);
    assert.equal(result.response.status, 200, `${route} returned ${result.response.status}`);
    assert.match(result.response.headers.get('content-type') || '', /text\/html/);
    assert.match(result.body, /<div id="root"><\/div>/);
  }
});
