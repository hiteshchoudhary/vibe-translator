<script>
  import KanbanCard from './KanbanCard.svelte';
  import { kanbanStore, cardsByColumn } from '../stores/kanban.js';

  export let column;

  let isAddingCard = false;
  let newCardTitle = '';
  let newCardDescription = '';
  let newCardPriority = 'medium';
  let isDragOver = false;
  let dropIndicatorIndex = -1;
  let cardsContainer;

  $: cards = $cardsByColumn[column.id] || [];

  function toggleAddCard() {
    isAddingCard = !isAddingCard;
    if (!isAddingCard) {
      resetNewCard();
    }
  }

  function resetNewCard() {
    newCardTitle = '';
    newCardDescription = '';
    newCardPriority = 'medium';
  }

  function addCard() {
    if (newCardTitle.trim()) {
      kanbanStore.addCard(column.id, newCardTitle.trim(), newCardDescription.trim(), newCardPriority);
      resetNewCard();
      isAddingCard = false;
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      addCard();
    } else if (event.key === 'Escape') {
      toggleAddCard();
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    isDragOver = true;

    // Calculate drop position based on mouse Y position
    const rect = cardsContainer.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const cardElements = cardsContainer.querySelectorAll('.kanban-card:not(.dragging)');
    
    let newIndex = cards.length;
    for (let i = 0; i < cardElements.length; i++) {
      const cardRect = cardElements[i].getBoundingClientRect();
      const cardMiddle = cardRect.top + cardRect.height / 2 - rect.top;
      if (y < cardMiddle) {
        newIndex = i;
        break;
      }
    }
    dropIndicatorIndex = newIndex;
  }

  function handleDragLeave(event) {
    // Only set isDragOver to false if we're actually leaving the column
    const rect = event.currentTarget.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      isDragOver = false;
      dropIndicatorIndex = -1;
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    isDragOver = false;
    dropIndicatorIndex = -1;

    try {
      const data = JSON.parse(event.dataTransfer.getData('text/plain'));
      const { cardId, sourceColumnId } = data;

      // Calculate the target index
      const rect = cardsContainer.getBoundingClientRect();
      const y = event.clientY - rect.top;
      const cardElements = cardsContainer.querySelectorAll('.kanban-card:not(.dragging)');
      
      let targetIndex = cards.length;
      for (let i = 0; i < cardElements.length; i++) {
        const cardRect = cardElements[i].getBoundingClientRect();
        const cardMiddle = cardRect.top + cardRect.height / 2 - rect.top;
        if (y < cardMiddle) {
          targetIndex = i;
          break;
        }
      }

      kanbanStore.moveCard(cardId, column.id, targetIndex);
    } catch (e) {
      console.error('Error handling drop:', e);
    }
  }
</script>

<div
  class="kanban-column"
  class:drag-over={isDragOver}
  role="list"
  aria-label="{column.title} column"
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
>
  <div class="column-header" style="--column-color: {column.color}">
    <h3 class="column-title">
      <span class="color-indicator"></span>
      {column.title}
    </h3>
    <span class="card-count">{cards.length}</span>
  </div>

  <div class="cards-container" bind:this={cardsContainer}>
    {#each cards as card, index (card.id)}
      {#if dropIndicatorIndex === index && isDragOver}
        <div class="drop-indicator"></div>
      {/if}
      <KanbanCard {card} columnColor={column.color} />
    {/each}
    {#if dropIndicatorIndex === cards.length && isDragOver}
      <div class="drop-indicator"></div>
    {/if}

    {#if isAddingCard}
      <div class="new-card-form">
        <input
          type="text"
          class="new-card-title"
          bind:value={newCardTitle}
          on:keydown={handleKeydown}
          placeholder="Enter card title..."
        />
        <textarea
          class="new-card-description"
          bind:value={newCardDescription}
          on:keydown={handleKeydown}
          placeholder="Description (optional)"
          rows="2"
        ></textarea>
        <div class="new-card-priority">
          <label for="new-card-priority-{column.id}">Priority:</label>
          <select id="new-card-priority-{column.id}" bind:value={newCardPriority}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div class="new-card-actions">
          <button class="btn btn-add" on:click={addCard}>Add Card</button>
          <button class="btn btn-cancel" on:click={toggleAddCard}>Cancel</button>
        </div>
      </div>
    {:else}
      <button class="add-card-btn" on:click={toggleAddCard}>
        <span class="plus-icon">+</span>
        Add a card
      </button>
    {/if}
  </div>
</div>

<style>
  .kanban-column {
    background-color: #f1f5f9;
    border-radius: 12px;
    min-width: 300px;
    max-width: 300px;
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 140px);
    transition: background-color 0.2s ease;
  }

  .kanban-column.drag-over {
    background-color: #e2e8f0;
  }

  .column-header {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .column-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .color-indicator {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    background-color: var(--column-color);
  }

  .card-count {
    background-color: #e2e8f0;
    color: #64748b;
    font-size: 12px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 10px;
  }

  .cards-container {
    flex: 1;
    overflow-y: auto;
    padding: 0 12px 12px;
    min-height: 100px;
  }

  .drop-indicator {
    height: 3px;
    background-color: #6366f1;
    border-radius: 2px;
    margin: 8px 0;
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .add-card-btn {
    width: 100%;
    padding: 10px;
    background: transparent;
    border: 2px dashed #cbd5e1;
    border-radius: 8px;
    color: #64748b;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s ease;
  }

  .add-card-btn:hover {
    background-color: white;
    border-color: #6366f1;
    color: #6366f1;
  }

  .plus-icon {
    font-size: 18px;
    font-weight: 300;
  }

  /* New card form styles */
  .new-card-form {
    background: white;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .new-card-title {
    width: 100%;
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
  }

  .new-card-title:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }

  .new-card-description {
    width: 100%;
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 12px;
    resize: vertical;
    font-family: inherit;
  }

  .new-card-description:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }

  .new-card-priority {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }

  .new-card-priority label {
    color: #64748b;
  }

  .new-card-priority select {
    padding: 4px 8px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 12px;
  }

  .new-card-actions {
    display: flex;
    gap: 8px;
  }

  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }

  .btn-add {
    background-color: #6366f1;
    color: white;
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
