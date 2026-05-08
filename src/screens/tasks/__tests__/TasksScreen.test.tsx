import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TasksScreen } from '../TasksScreen';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#FFFFFF',
      textPrimary: '#000000',
      textSecondary: '#666666',
      primary: '#007AFF',
      card: '#F5F5F5',
      border: '#CCCCCC',
      success: '#34C759',
    },
    text: {
      h2: {},
      bodySmall: {},
      labelMedium: {},
      bodyMedium: {},
    },
  }),
}));

const mockHaptics = {
  success: jest.fn(),
  light: jest.fn(),
  warning: jest.fn(),
};

jest.mock('../../../hooks/useHaptics', () => ({
  useHaptics: () => mockHaptics,
}));

const mockNavigation = {
  navigate: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

const mockTasks = [
  { id: 'task_1', title: 'Task 1', status: 'pending', priority: 'medium', dueDate: new Date().toISOString(), subtasks: [] },
  { id: 'task_2', title: 'Task 2', status: 'pending', priority: 'high', dueDate: new Date().toISOString(), subtasks: [] },
  { id: 'task_3', title: 'Task 3', status: 'completed', priority: 'low', dueDate: new Date().toISOString(), subtasks: [] },
];

const mockUseAppStore = {
  tasks: mockTasks,
  getTodaysTasks: jest.fn().mockReturnValue(mockTasks),
  getPendingTasks: jest.fn().mockReturnValue(mockTasks),
  getOverdueTasks: jest.fn().mockReturnValue([{ id: 'task_4' }]),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  addTask: jest.fn(),
  completeTask: jest.fn().mockReturnValue(0),
  addXP: jest.fn(),
  recordTaskComplete: jest.fn(),
};

jest.mock('../../../store', () => ({
  useAppStore: (selector: any) =>
    selector ? selector(mockUseAppStore) : mockUseAppStore,
}));

describe('TasksScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppStore.tasks = mockTasks;
  });

  it('renders correctly with tasks', () => {
    const { getByText } = render(<TasksScreen />);
    expect(getByText('Tasks')).toBeTruthy();
    expect(getByText('Task 1')).toBeTruthy();
    expect(getByText('Task 2')).toBeTruthy();
  });

  it('renders empty state when no tasks', () => {
    mockUseAppStore.tasks = [];
    const { getByText } = render(<TasksScreen />);
    expect(getByText('Brain clear!')).toBeTruthy();
  });

  it('changes filter on tab press', () => {
    const { getByText, queryByText } = render(<TasksScreen />);
    
    expect(getByText('Task 1')).toBeTruthy();
    expect(getByText('Task 2')).toBeTruthy();
    expect(queryByText('Task 3')).toBeNull();
    
    fireEvent.press(getByText('Done'));
    
    expect(getByText('Task 3')).toBeTruthy();
    expect(queryByText('Task 1')).toBeNull();
    expect(queryByText('Task 2')).toBeNull();
  });

  it('navigates to AddTask on add button press', () => {
    const { getByLabelText } = render(<TasksScreen />);
    fireEvent.press(getByLabelText('Add new task'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AddTask');
  });

  it('navigates to AddTask on task press', () => {
    const { getByText } = render(<TasksScreen />);
    fireEvent.press(getByText('Task 1'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AddTask', { taskId: 'task_1' });
  });

  it('navigates to AddTask on empty state action', () => {
    mockUseAppStore.tasks = [];
    const { getByText } = render(<TasksScreen />);
    fireEvent.press(getByText('Add a Task'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AddTask');
  });

  it('completes a task with XP and triggers haptics', () => {
    jest.useFakeTimers();
    mockUseAppStore.completeTask.mockReturnValueOnce(50);
    const { getAllByRole } = render(<TasksScreen />);
    const checkboxes = getAllByRole('checkbox');
    fireEvent.press(checkboxes[0]);
    jest.advanceTimersByTime(300);
    expect(mockUseAppStore.completeTask).toHaveBeenCalled();
    expect(mockUseAppStore.addXP).toHaveBeenCalledWith(50);
    expect(mockUseAppStore.recordTaskComplete).toHaveBeenCalled();
    expect(mockHaptics.success).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('captures a quick task via the QuickCapture input', () => {
    const { getByPlaceholderText, getByText } = render(<TasksScreen />);
    const input = getByPlaceholderText(/Capture/i);
    fireEvent.changeText(input, 'Quick task');
    fireEvent(input, 'submitEditing');
    expect(mockUseAppStore.addTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Quick task', priority: 'medium' })
    );
    expect(mockHaptics.light).toHaveBeenCalled();
  });

  it('confirms deletion via long-press alert', () => {
    const { Alert } = require('react-native');
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText } = render(<TasksScreen />);
    fireEvent(getByText('Task 1'), 'longPress');
    expect(alertSpy).toHaveBeenCalled();
    const buttons = alertSpy.mock.calls[0][2];
    const confirm = buttons?.find((b: any) => b.text === 'Delete');
    confirm?.onPress?.();
    expect(mockUseAppStore.deleteTask).toHaveBeenCalledWith('task_1');
    expect(mockHaptics.warning).toHaveBeenCalled();
  });

  it('shows overdue count when overdue tasks exist', () => {
    const { getByText } = render(<TasksScreen />);
    expect(getByText(/overdue/)).toBeTruthy();
  });

  it('renders the today filter', () => {
    const { getAllByText } = render(<TasksScreen />);
    fireEvent.press(getAllByText('Today')[0]);
    expect(mockUseAppStore.getTodaysTasks).toHaveBeenCalled();
  });
});
