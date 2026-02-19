import { KanbanProvider } from './context/KanbanContext';
import KanbanBoard from './components/KanbanBoard';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Kanban Board</h1>
          <p className="text-sm text-gray-500 mt-1">Drag and drop tasks between columns</p>
        </div>
      </header>
      <main>
        <KanbanProvider>
          <KanbanBoard />
        </KanbanProvider>
      </main>
    </div>
  );
}

export default App;
