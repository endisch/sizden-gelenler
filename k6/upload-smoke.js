import http from 'k6/http';
import { check } from 'k6';

const baseUrl = (__ENV.BASE_URL || '').replace(/\/$/, '');
const audio = open(__ENV.MP3_FILE, 'b');

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: { http_req_failed: ['rate<0.01'] }
};

export default function () {
  if (!baseUrl || !__ENV.GOOGLE_ID_TOKEN) {
    throw new Error('Set BASE_URL and GOOGLE_ID_TOKEN for an isolated staging environment.');
  }

  const form = {
    token: __ENV.GOOGLE_ID_TOKEN,
    fullName: 'Staging Load Check',
    social: 'staging-only',
    aiTool: 'Test',
    trackName: `Staging upload ${Date.now()}`,
    note: 'Tek kullanımlık aktarım ve yük testi için hazırlanmış deneme kaydı.',
    consent: 'true',
    mp3: http.file(audio, 'staging-test.mp3', 'audio/mpeg')
  };

  const response = http.post(`${baseUrl}/submit`, form);
  check(response, { 'staging accepts one test submission': (r) => r.status === 200 });
}
