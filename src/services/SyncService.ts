import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

export interface SyncAction {
  id: string;
  type: 'CREATE_TASK' | 'UPDATE_TASK' | 'DELETE_TASK';
  payload: any;
  timestamp: number;
}

const QUEUE_KEY = '@neuropilot_sync_queue';

/**
 * Offline-First Sync Service.
 * Queues actions locally and processes them in the background.
 * This guarantees the UI never hangs waiting for a network request.
 */
class SyncService {
  private isSyncing = false;

  async queueAction(action: Omit<SyncAction, 'id' | 'timestamp'>) {
    const newAction: SyncAction = {
      ...action,
      id: `sync_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      timestamp: Date.now(),
    };

    const currentQueueStr = await AsyncStorage.getItem(QUEUE_KEY);
    const queue: SyncAction[] = currentQueueStr ? JSON.parse(currentQueueStr) : [];
    
    queue.push(newAction);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

    // Optimistically try to sync right away (in the background)
    this.processQueue();
  }

  async processQueue() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const currentQueueStr = await AsyncStorage.getItem(QUEUE_KEY);
      if (!currentQueueStr) return;

      const queue: SyncAction[] = JSON.parse(currentQueueStr);
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
          const index = remainingQueue.findIndex(a => a.id === action.id);
          if (index > -1) remainingQueue.splice(index, 1);
        }
      }

      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncService = new SyncService();
