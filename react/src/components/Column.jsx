import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import AddTask from './AddTask';
import { useKanban } from '../context/KanbanContext';

const columnColors = {
  todo: 'bg-blue-50 border-blue-200',
  'in-progress': 'bg-yellow-50 border-yellow-200',
  done: 'bg-green-50 border-green-200',
};

const headerColors = {
  todo: 'text-blue-700',
  'in-progress': 'text-yellow-700',
  done: 'text-green-700',
};

export default function Column({ column }) {
  const { tasks } = useKanban();
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  
  const columnTasks = column.taskIds.map((taskId) => tasks[taskId]).filter(Boolean);

  return (
    <div
      className={`flex flex-col w-80 min-w-[320px] rounded-xl border-2 ${columnColors[column.id] || 'bg-gray-50 border-gray-200'} ${
        isOver ? 'ring-2 ring-blue-400 ring-offset-2' : ''
      }`}
    >
      <div className="p-4 border-b border-inherit">
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold ${headerColors[column.id] || 'text-gray-700'}`}>
            {column.title}
          </h3>
          <span className="px-2 py-0.5 text-xs font-medium bg-white rounded-full text-gray-600 shadow-sm">
            {columnTasks.length}
          </span>
        </div>
      </div>
      
      <div
        ref={setNodeRef}
        className="flex-1 p-3 space-y-3 min-h-[200px] overflow-y-auto"
      >
        <SortableContext items={column.taskIds} strategy={verticalListSortingStrategy}>
          {columnTasks.map((task) => (
            <TaskCard key={task.id} task={task} columnId={column.id} />
          ))}
        </SortableContext>
      </div>
      
      <div className="p-3 border-t border-inherit">
        <AddTask columnId={column.id} />
      </div>
    </div>
  );
}
