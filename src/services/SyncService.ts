import { storage } from './storage';
import { api } from './api';

export interface SyncAction {
  id: string;
  type: 'CREATE_TASK' | 'UPDATE_TASK' | 'DELETE_TASK';
  payload: any;
  timestamp: number;
}

const QUEUE_KEY = '@neuropilot_sync_queue';

const readQueue = (): SyncAction[] => {
  const raw = storage.getString(QUEUE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SyncAction[]) : [];
  } catch {
    return [];
  }
};

const writeQueue = (queue: SyncAction[]): void => {
  storage.set(QUEUE_KEY, JSON.stringify(queue));
};

/**
 * Offline-First Sync Service.
 * Queues actions locally and processes them in the background.
 * This guarantees the UI never hangs waiting for a network request.
 *
 * Storage is backed by MMKV (synchronous), but the public API is kept
 * async so consumers stay agnostic to the underlying storage engine.
 */
class SyncService {
  private isSyncing = false;

  async queueAction(action: Omit<SyncAction, 'id' | 'timestamp'>) {
    const newAction: SyncAction = {
      ...action,
      id: `sync_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      timestamp: Date.now(),
    };

    const queue = readQueue();
    queue.push(newAction);
    writeQueue(queue);

    // Optimistically try to sync right away (in the background)
    this.processQueue();
  }

  async processQueue() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const queue = readQueue();
      if (queue.length === 0) return;

      // NOTE: In a production app, you would verify internet connection via NetInfo here

      const remainingQueue = [...queue];

      for (const action of queue) {
        let success = false;
        try {
          switch (action.type) {
            case 'CREATE_TASK':
              await api.post('/tasks', action.payload);
              success = true;
              break;
            case 'UPDATE_TASK':
              await api.put(`/tasks/${action.payload.id}`, action.payload.updates);
              success = true;
              break;
            case 'DELETE_TASK':
              await api.delete(`/tasks/${action.payload.id}`);
              success = true;
              break;
          }
        } catch (error) {
          console.error(`Sync failed for action ${action.id}`, error);
          // If the network fails, we leave it in the queue to retry later.
        }

        if (success) {
          // Remove from remaining queue since it was successfully sent to the server
          const index = remainingQueue.findIndex((a) => a.id === action.id);
          if (index > -1) remainingQueue.splice(index, 1);
        }
      }

      writeQueue(remainingQueue);
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncService = new SyncService();
