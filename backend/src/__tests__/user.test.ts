import request from 'supertest';
import app from '../index';
import * as githubApi from '../services/githubApi';

// Mock GitHub API to avoid real network calls in tests
jest.mock('../services/githubApi');
const mockGetAggregatedData = githubApi.getAggregatedData as jest.MockedFunction<typeof githubApi.getAggregatedData>;

describe('GET /api/user/:username', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rejects usernames with spaces (400)', async () => {
    const res = await request(app).get('/api/user/foo%20bar');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('rejects usernames with special characters (400)', async () => {
    const res = await request(app).get('/api/user/foo<script>');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('accepts valid alphanumeric usernames', async () => {
    mockGetAggregatedData.mockResolvedValueOnce({ user: { login: 'validuser' } } as never);
    const res = await request(app).get('/api/user/validuser');
    expect(res.status).toBe(200);
    expect(mockGetAggregatedData).toHaveBeenCalledWith('validuser');
  });

  it('accepts usernames with hyphens', async () => {
    mockGetAggregatedData.mockResolvedValueOnce({ user: { login: 'valid-user' } } as never);
    const res = await request(app).get('/api/user/valid-user');
    expect(res.status).toBe(200);
  });

  it('propagates errors from getAggregatedData (500)', async () => {
    mockGetAggregatedData.mockRejectedValueOnce(new Error('GitHub API error'));
    const res = await request(app).get('/api/user/someuser');
    expect(res.status).toBe(500);
  });
});
