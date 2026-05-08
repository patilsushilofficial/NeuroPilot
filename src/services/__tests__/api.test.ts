import { api } from '../api';

describe('api', () => {
  it('should post data', async () => {
    const response = await api.post('/test', { data: 'test' });
    expect(response).toEqual({ success: true, data: { data: 'test' } });
  });

  it('should put data', async () => {
    const response = await api.put('/test', { data: 'test' });
    expect(response).toEqual({ success: true, data: { data: 'test' } });
  });

  it('should delete data', async () => {
    const response = await api.delete('/test');
    expect(response).toEqual({ success: true });
  });
});
