<script>
  import KanbanBoard from './lib/KanbanBoard.svelte';
  import { kanbanStore } from './stores/kanban.js';

  function resetBoard() {
    if (confirm('Are you sure you want to reset the board to default state?')) {
      kanbanStore.reset();
    }
  }
</script>

<div class="app">
  <header class="app-header">
    <div class="header-content">
      <div class="logo">
        <span class="logo-icon">📋</span>
        <h1>Kanban Board</h1>
      </div>
      <div class="header-actions">
        <button class="reset-btn" on:click={resetBoard} title="Reset board">
          🔄 Reset
        </button>
      </div>
    </div>
  </header>

  <main class="app-main">
    <KanbanBoard />
  </main>
</div>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .app-header {
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-content {
    max-width: 100%;
    margin: 0 auto;
    padding: 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo-icon {
    font-size: 28px;
  }

  .logo h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }

  .reset-btn {
    padding: 8px 16px;
    background-color: #f1f5f9;
    border: none;
    border-radius: 8px;
    color: #475569;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .reset-btn:hover {
    background-color: #e2e8f0;
    color: #1e293b;
  }

  .app-main {
    flex: 1;
    overflow: hidden;
  }
</style>
