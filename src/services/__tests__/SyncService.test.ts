import { syncService } from '../SyncService';
import { storage } from '../storage';
import { api } from '../api';

jest.mock('../api', () => ({
  api: {
    post: jest.fn().mockResolvedValue({ success: true }),
    put: jest.fn().mockResolvedValue({ success: true }),
    delete: jest.fn().mockResolvedValue({ success: true }),
  },
}));

const QUEUE_KEY = '@neuropilot_sync_queue';

describe('SyncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storage.clearAll();
  });

  it('should queue action', async () => {
    await syncService.queueAction({
      type: 'CREATE_TASK',
      payload: { title: 'Test' },
    });

    expect(storage.set).toHaveBeenCalled();
    // Inspect the FIRST write — queueAction immediately fires processQueue,
    // which (on success) overwrites the queue with [] in a follow-up tick.
    const queueWrites = (storage.set as jest.Mock).mock.calls.filter((c) => c[0] === QUEUE_KEY);
    const initialQueue = JSON.parse(queueWrites[0][1]);
    expect(initialQueue).toHaveLength(1);
    expect(initialQueue[0].type).toBe('CREATE_TASK');
  });

  it('should process queue', async () => {
    storage.set(
      QUEUE_KEY,
      JSON.stringify([
        { id: '1', type: 'CREATE_TASK', payload: { title: 'Test' }, timestamp: Date.now() },
      ])
    );

    await syncService.processQueue();

    expect(api.post).toHaveBeenCalled();
    expect(storage.getString(QUEUE_KEY)).toBe('[]');
  });

  it('should process update action', async () => {
    storage.set(
      QUEUE_KEY,
      JSON.stringify([
        {
          id: '1',
          type: 'UPDATE_TASK',
          payload: { id: 't1', updates: { title: 'Updated' } },
          timestamp: Date.now(),
        },
      ])
    );

    await syncService.processQueue();
    expect(api.put).toHaveBeenCalled();
  });

  it('should process delete action', async () => {
    storage.set(
      QUEUE_KEY,
      JSON.stringify([
        { id: '1', type: 'DELETE_TASK', payload: { id: 't1' }, timestamp: Date.now() },
      ])
    );

    await syncService.processQueue();
    expect(api.delete).toHaveBeenCalled();
  });

  it('should handle sync failure', async () => {
    const mockQueue = [
      { id: '1', type: 'CREATE_TASK', payload: { title: 'Test' }, timestamp: Date.now() },
    ];
    storage.set(QUEUE_KEY, JSON.stringify(mockQueue));
    (api.post as jest.Mock).mockRejectedValue(new Error('Network error'));

    await syncService.processQueue();
    // Failed action should remain in the queue for retry.
    expect(storage.getString(QUEUE_KEY)).toBe(JSON.stringify(mockQueue));
  });

  it('queues to an existing queue and persists the merged result', async () => {
    const existing = [
      { id: 'old', type: 'UPDATE_TASK', payload: { id: 'x', updates: {} }, timestamp: 1 },
    ];
    storage.set(QUEUE_KEY, JSON.stringify(existing));

    await syncService.queueAction({ type: 'CREATE_TASK', payload: { title: 'New' } });

    const persisted = JSON.parse(storage.getString(QUEUE_KEY)!);
    expect(persisted.length).toBeGreaterThanOrEqual(2);
    expect(persisted[0].id).toBe('old');
  });

  it('returns early when the queue is empty', async () => {
    storage.set(QUEUE_KEY, JSON.stringify([]));
    (storage.set as jest.Mock).mockClear();

    await syncService.processQueue();

    expect(api.post).not.toHaveBeenCalled();
    expect(api.put).not.toHaveBeenCalled();
    expect(api.delete).not.toHaveBeenCalled();
    expect(storage.set).not.toHaveBeenCalled();
  });

  it('does nothing when there is no queue stored at all', async () => {
    (storage.set as jest.Mock).mockClear();

    await syncService.processQueue();

    expect(api.post).not.toHaveBeenCalled();
    expect(storage.set).not.toHaveBeenCalled();
  });
});
