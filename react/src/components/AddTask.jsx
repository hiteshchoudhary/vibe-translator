import { useState } from 'react';
import { useKanban } from '../context/KanbanContext';

export default function AddTask({ columnId }) {
  const { addTask } = useKanban();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      addTask(columnId, title.trim(), description.trim());
      setTitle('');
      setDescription('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-full py-2 px-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-2 py-1 text-sm font-medium border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Task title"
        autoFocus
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder="Description (optional)"
        rows={2}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
        >
          Add
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
