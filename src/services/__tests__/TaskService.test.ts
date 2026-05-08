import { taskService } from '../TaskService';

jest.mock('../SyncService', () => ({
  syncService: {
    queueAction: jest.fn(),
  },
}));

describe('TaskService', () => {
  it('should create a task with default values', () => {
    const task = taskService.createTask({
      title: 'Test Task',
      priority: 'medium',
      tags: [],
    });

    expect(task.title).toBe('Test Task');
    expect(task.priority).toBe('medium');
    expect(task.status).toBe('pending');
    expect(task.id).toBeDefined();
  });

  it('should generate subtask IDs', () => {
    const id = taskService.generateSubtaskId();
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
  });

  it('should update a task', () => {
    taskService.updateTask('123', { title: 'Updated Title' });
    const { syncService } = require('../SyncService');
    expect(syncService.queueAction).toHaveBeenCalledWith({
      type: 'UPDATE_TASK',
      payload: { id: '123', updates: { title: 'Updated Title' } },
    });
  });

  it('should delete a task', () => {
    taskService.deleteTask('123');
    const { syncService } = require('../SyncService');
    expect(syncService.queueAction).toHaveBeenCalledWith({
      type: 'DELETE_TASK',
      payload: { id: '123' },
    });
  });

});
