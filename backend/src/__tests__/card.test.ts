import request from 'supertest';
import app from '../index';
import * as cardGenerator from '../services/cardGenerator';

jest.mock('../services/cardGenerator');
const mockGenerateCardData = cardGenerator.generateCardData as jest.MockedFunction<typeof cardGenerator.generateCardData>;

const validPayload = {
  username: 'testuser',
  avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
  name: 'Test User',
  topLanguages: [{ name: 'TypeScript', percentage: 80, color: '#3178c6' }],
  personalityScores: { creator: 70, collaborator: 60, communicator: 50, maintainer: 80, explorer: 90 },
};

describe('POST /api/card/generate', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when body is empty', async () => {
    const res = await request(app).post('/api/card/generate').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when avatarUrl does not start with https://', async () => {
    const payload = { ...validPayload, avatarUrl: 'http://evil.com/img.png' };
    const res = await request(app).post('/api/card/generate').send(payload);
    expect(res.status).toBe(400);
  });

  it('returns 400 when avatarUrl is a javascript: URI', async () => {
    const payload = { ...validPayload, avatarUrl: 'javascript:alert(1)' };
    const res = await request(app).post('/api/card/generate').send(payload);
    expect(res.status).toBe(400);
  });

  it('returns 400 when topLanguages is not an array', async () => {
    const payload = { ...validPayload, topLanguages: 'invalid' };
    const res = await request(app).post('/api/card/generate').send(payload);
    expect(res.status).toBe(400);
  });

  it('returns 400 when personalityScores is missing', async () => {
    const { personalityScores: _, ...payload } = validPayload;
    const res = await request(app).post('/api/card/generate').send(payload);
    expect(res.status).toBe(400);
  });

  it('returns SVG with valid payload', async () => {
    mockGenerateCardData.mockResolvedValueOnce('<svg>test</svg>');
    const res = await request(app)
      .post('/api/card/generate')
      .send(validPayload)
      .buffer(true)
      .parse((res, callback) => {
        let data = '';
        res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
        res.on('end', () => callback(null, data));
      });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/image\/svg\+xml/);
    expect(res.body).toBe('<svg>test</svg>');
  });

  it('returns 500 when card generation throws', async () => {
    mockGenerateCardData.mockRejectedValueOnce(new Error('render error'));
    const res = await request(app).post('/api/card/generate').send(validPayload);
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});
