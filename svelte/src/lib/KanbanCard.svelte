<script>
  import { createEventDispatcher } from 'svelte';
  import { kanbanStore } from '../stores/kanban.js';

  export let card;
  export let columnColor = '#6366f1';

  const dispatch = createEventDispatcher();

  let isEditing = false;
  let editTitle = '';
  let editDescription = '';
  let editPriority = '';

  const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e'
  };

  function startEdit() {
    editTitle = card.title;
    editDescription = card.description;
    editPriority = card.priority;
    isEditing = true;
  }

  function saveEdit() {
    if (editTitle.trim()) {
      kanbanStore.updateCard(card.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority
      });
    }
    isEditing = false;
  }

  function cancelEdit() {
    isEditing = false;
  }

  function deleteCard() {
    if (confirm('Are you sure you want to delete this card?')) {
      kanbanStore.deleteCard(card.id);
    }
  }

  function handleDragStart(event) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', JSON.stringify({
      cardId: card.id,
      sourceColumnId: card.columnId
    }));
    event.target.classList.add('dragging');
  }

  function handleDragEnd(event) {
    event.target.classList.remove('dragging');
  }

  function handleKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      saveEdit();
    } else if (event.key === 'Escape') {
      cancelEdit();
    }
  }
</script>

<div
  class="kanban-card"
  draggable="true"
  role="listitem"
  on:dragstart={handleDragStart}
  on:dragend={handleDragEnd}
  style="--column-color: {columnColor}"
>
  {#if isEditing}
    <div class="card-edit">
      <input
        type="text"
        class="edit-title"
        bind:value={editTitle}
        on:keydown={handleKeydown}
        placeholder="Card title"
      />
      <textarea
        class="edit-description"
        bind:value={editDescription}
        on:keydown={handleKeydown}
        placeholder="Description (optional)"
        rows="2"
      ></textarea>
      <div class="edit-priority">
        <label for="edit-priority-{card.id}">Priority:</label>
        <select id="edit-priority-{card.id}" bind:value={editPriority}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <div class="edit-actions">
        <button class="btn btn-save" on:click={saveEdit}>Save</button>
        <button class="btn btn-cancel" on:click={cancelEdit}>Cancel</button>
      </div>
    </div>
  {:else}
    <div class="card-content">
      <div class="card-header">
        <span class="priority-badge" style="background-color: {priorityColors[card.priority]}">
          {card.priority}
        </span>
        <div class="card-actions">
          <button class="action-btn edit-btn" on:click={startEdit} title="Edit">
            ✏️
          </button>
          <button class="action-btn delete-btn" on:click={deleteCard} title="Delete">
            🗑️
          </button>
        </div>
      </div>
      <h4 class="card-title">{card.title}</h4>
      {#if card.description}
        <p class="card-description">{card.description}</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .kanban-card {
    background: white;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    cursor: grab;
    border-left: 3px solid var(--column-color);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .kanban-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  .kanban-card:active {
    cursor: grabbing;
  }

  :global(.kanban-card.dragging) {
    opacity: 0.5;
    transform: rotate(3deg);
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .priority-badge {
    font-size: 10px;
    font-weight: 600;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .card-actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .kanban-card:hover .card-actions {
    opacity: 1;
  }

  .action-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    font-size: 12px;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }

  .action-btn:hover {
    background-color: #f1f5f9;
  }

  .card-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.4;
  }

  .card-description {
    margin: 0;
    font-size: 12px;
    color: #64748b;
    line-height: 1.5;
  }

  /* Edit mode styles */
  .card-edit {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .edit-title {
    width: 100%;
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
  }

  .edit-title:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }

  .edit-description {
    width: 100%;
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 12px;
    resize: vertical;
    font-family: inherit;
  }

  .edit-description:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }

  .edit-priority {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }

  .edit-priority label {
    color: #64748b;
  }

  .edit-priority select {
    padding: 4px 8px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 12px;
  }

  .edit-actions {
    display: flex;
    gap: 8px;
  }

  .btn {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }

  .btn-save {
    background-color: #6366f1;
    color: white;
  }

  .btn-save:hover {
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
