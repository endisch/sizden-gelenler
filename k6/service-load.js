import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = (__ENV.BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

export const options = {
  stages: [
    { duration: '30s', target: 5 },
    { duration: '60s', target: 15 },
    { duration: '60s', target: 30 },
    { duration: '30s', target: 0 }
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
    http_req_duration: ['p(95)<1000']
  }
};

export default function () {
  const health = http.get(`${baseUrl}/healthz`);
  check(health, { 'health responds 200': (r) => r.status === 200 });

  const ready = http.get(`${baseUrl}/readyz`);
  check(ready, { 'service is ready': (r) => r.status === 200 });

  const config = http.get(`${baseUrl}/config`);
  check(config, {
    'config responds 200': (r) => r.status === 200,
    'server advertises upload cap': (r) => r.json('maxUploadMb') <= 10
  });

  const page = http.get(`${baseUrl}/`);
  check(page, { 'home page responds 200': (r) => r.status === 200 });
  sleep(0.5);
}
