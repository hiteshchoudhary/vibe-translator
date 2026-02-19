import { createContext, useContext, useState } from 'react';

const KanbanContext = createContext(null);

const initialColumns = {
  todo: {
    id: 'todo',
    title: 'To Do',
    taskIds: ['task-1', 'task-2', 'task-3'],
  },
  'in-progress': {
    id: 'in-progress',
    title: 'In Progress',
    taskIds: ['task-4'],
  },
  done: {
    id: 'done',
    title: 'Done',
    taskIds: ['task-5'],
  },
};

const initialTasks = {
  'task-1': { id: 'task-1', title: 'Research project requirements', description: 'Gather all necessary information' },
  'task-2': { id: 'task-2', title: 'Design database schema', description: 'Create ERD diagram' },
  'task-3': { id: 'task-3', title: 'Set up development environment', description: 'Install dependencies and configure tools' },
  'task-4': { id: 'task-4', title: 'Implement authentication', description: 'Add login and signup flows' },
  'task-5': { id: 'task-5', title: 'Project kickoff meeting', description: 'Initial team sync completed' },
};

export function KanbanProvider({ children }) {
  const [columns, setColumns] = useState(initialColumns);
  const [tasks, setTasks] = useState(initialTasks);

  const moveTask = (taskId, sourceColumnId, destinationColumnId, newIndex) => {
    setColumns((prev) => {
      const newColumns = { ...prev };
      
      // Remove from source
      const sourceColumn = { ...newColumns[sourceColumnId] };
      sourceColumn.taskIds = sourceColumn.taskIds.filter((id) => id !== taskId);
      newColumns[sourceColumnId] = sourceColumn;

      // Add to destination
      const destColumn = { ...newColumns[destinationColumnId] };
      const newTaskIds = [...destColumn.taskIds];
      newTaskIds.splice(newIndex, 0, taskId);
      destColumn.taskIds = newTaskIds;
      newColumns[destinationColumnId] = destColumn;

      return newColumns;
    });
  };

  const reorderTask = (columnId, startIndex, endIndex) => {
    setColumns((prev) => {
      const column = { ...prev[columnId] };
      const newTaskIds = [...column.taskIds];
      const [removed] = newTaskIds.splice(startIndex, 1);
      newTaskIds.splice(endIndex, 0, removed);
      column.taskIds = newTaskIds;
      return { ...prev, [columnId]: column };
    });
  };

  const addTask = (columnId, title, description) => {
    const taskId = `task-${Date.now()}`;
    const newTask = { id: taskId, title, description };
    
    setTasks((prev) => ({ ...prev, [taskId]: newTask }));
    setColumns((prev) => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        taskIds: [...prev[columnId].taskIds, taskId],
      },
    }));
  };

  const deleteTask = (taskId, columnId) => {
    setTasks((prev) => {
      const newTasks = { ...prev };
      delete newTasks[taskId];
      return newTasks;
    });
    setColumns((prev) => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        taskIds: prev[columnId].taskIds.filter((id) => id !== taskId),
      },
    }));
  };

  const updateTask = (taskId, title, description) => {
    setTasks((prev) => ({
      ...prev,
      [taskId]: { ...prev[taskId], title, description },
    }));
  };

  return (
    <KanbanContext.Provider
      value={{
        columns,
        tasks,
        moveTask,
        reorderTask,
        addTask,
        deleteTask,
        updateTask,
      }}
    >
      {children}
    </KanbanContext.Provider>
  );
}

export function useKanban() {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
}
