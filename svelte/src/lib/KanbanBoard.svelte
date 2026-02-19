<script>
  import KanbanColumn from './KanbanColumn.svelte';
  import { kanbanStore } from '../stores/kanban.js';

  let isAddingColumn = false;
  let newColumnTitle = '';
  let newColumnColor = '#64748b';

  const colorOptions = [
    { value: '#6366f1', label: 'Indigo' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#ec4899', label: 'Pink' },
    { value: '#ef4444', label: 'Red' },
    { value: '#f59e0b', label: 'Amber' },
    { value: '#10b981', label: 'Emerald' },
    { value: '#06b6d4', label: 'Cyan' },
    { value: '#64748b', label: 'Slate' }
  ];

  function toggleAddColumn() {
    isAddingColumn = !isAddingColumn;
    if (!isAddingColumn) {
      newColumnTitle = '';
      newColumnColor = '#64748b';
    }
  }

  function addColumn() {
    if (newColumnTitle.trim()) {
      kanbanStore.addColumn(newColumnTitle.trim(), newColumnColor);
      newColumnTitle = '';
      newColumnColor = '#64748b';
      isAddingColumn = false;
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Enter') {
      addColumn();
    } else if (event.key === 'Escape') {
      toggleAddColumn();
    }
  }
</script>

<div class="kanban-board">
  {#each $kanbanStore.columns as column (column.id)}
    <KanbanColumn {column} />
  {/each}

  <div class="add-column-container">
    {#if isAddingColumn}
      <div class="add-column-form">
        <input
          type="text"
          class="column-title-input"
          bind:value={newColumnTitle}
          on:keydown={handleKeydown}
          placeholder="Column title..."
        />
        <div class="color-picker">
          <span class="color-label">Color:</span>
          <div class="color-options" role="radiogroup" aria-label="Column color">
            {#each colorOptions as option}
              <button
                class="color-option"
                class:selected={newColumnColor === option.value}
                style="background-color: {option.value}"
                on:click={() => newColumnColor = option.value}
                title={option.label}
              ></button>
            {/each}
          </div>
        </div>
        <div class="add-column-actions">
          <button class="btn btn-add" on:click={addColumn}>Add Column</button>
          <button class="btn btn-cancel" on:click={toggleAddColumn}>Cancel</button>
        </div>
      </div>
    {:else}
      <button class="add-column-btn" on:click={toggleAddColumn}>
        <span class="plus-icon">+</span>
        Add Column
      </button>
    {/if}
  </div>
</div>

<style>
  .kanban-board {
    display: flex;
    gap: 20px;
    padding: 20px;
    overflow-x: auto;
    min-height: calc(100vh - 100px);
    align-items: flex-start;
  }

  .add-column-container {
    min-width: 280px;
  }

  .add-column-btn {
    width: 100%;
    padding: 16px;
    background-color: rgba(255, 255, 255, 0.5);
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    color: #64748b;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s ease;
  }

  .add-column-btn:hover {
    background-color: white;
    border-color: #6366f1;
    color: #6366f1;
  }

  .plus-icon {
    font-size: 20px;
    font-weight: 300;
  }

  .add-column-form {
    background: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .column-title-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
  }

  .column-title-input:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }

  .color-picker {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .color-label {
    font-size: 12px;
    color: #64748b;
    font-weight: 500;
  }

  .color-options {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .color-option {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: transform 0.15s ease, border-color 0.15s ease;
  }

  .color-option:hover {
    transform: scale(1.1);
  }

  .color-option.selected {
    border-color: #1e293b;
    transform: scale(1.1);
  }

  .add-column-actions {
    display: flex;
    gap: 8px;
  }

  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }

  .btn-add {
    background-color: #6366f1;
    color: white;
    flex: 1;
  }

  .btn-add:hover {
    background-color: #4f46e5;
  }

  .btn-cancel {
    background-color: #e2e8f0;
    color: #475569;
  }

  .btn-cancel:hover {
    background-color: #cbd5e1;
  }
</style>
