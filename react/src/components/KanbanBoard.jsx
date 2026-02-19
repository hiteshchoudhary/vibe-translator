import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { useState } from 'react';
import Column from './Column';
import TaskCard from './TaskCard';
import { useKanban } from '../context/KanbanContext';

export default function KanbanBoard() {
  const { columns, tasks, moveTask, reorderTask } = useKanban();
  const [activeTask, setActiveTask] = useState(null);
  const [activeColumnId, setActiveColumnId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const findColumnByTaskId = (taskId) => {
    return Object.values(columns).find((column) =>
      column.taskIds.includes(taskId)
    );
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks[active.id];
    const column = findColumnByTaskId(active.id);
    if (task && column) {
      setActiveTask(task);
      setActiveColumnId(column.id);
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeColumn = findColumnByTaskId(activeId);
    const overColumn = findColumnByTaskId(overId) || columns[overId];

    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) {
      return;
    }

    // Moving to a different column
    const overIndex = overColumn.taskIds.indexOf(overId);
    const newIndex = overIndex >= 0 ? overIndex : overColumn.taskIds.length;

    moveTask(activeId, activeColumn.id, overColumn.id, newIndex);
    setActiveColumnId(overColumn.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      setActiveColumnId(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    const activeColumn = findColumnByTaskId(activeId);
    
    if (!activeColumn) {
      setActiveTask(null);
      setActiveColumnId(null);
      return;
    }

    // Reorder within same column
    if (activeId !== overId && activeColumn.taskIds.includes(overId)) {
      const oldIndex = activeColumn.taskIds.indexOf(activeId);
      const newIndex = activeColumn.taskIds.indexOf(overId);
      reorderTask(activeColumn.id, oldIndex, newIndex);
    }

    setActiveTask(null);
    setActiveColumnId(null);
  };

  const columnOrder = ['todo', 'in-progress', 'done'];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 p-6 overflow-x-auto min-h-screen items-start">
        {columnOrder.map((columnId) => (
          <Column key={columnId} column={columns[columnId]} />
        ))}
      </div>
      
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-90">
            <TaskCard task={activeTask} columnId={activeColumnId} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
