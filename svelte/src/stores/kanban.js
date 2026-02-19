import { writable, derived } from 'svelte/store';

// Generate unique IDs
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Initial board state
const initialState = {
  columns: [
    { id: 'todo', title: 'To Do', color: '#6366f1' },
    { id: 'in-progress', title: 'In Progress', color: '#f59e0b' },
    { id: 'review', title: 'Review', color: '#8b5cf6' },
    { id: 'done', title: 'Done', color: '#10b981' }
  ],
  cards: [
    { id: generateId(), columnId: 'todo', title: 'Set up project structure', description: 'Initialize the repository and configure build tools', priority: 'high' },
    { id: generateId(), columnId: 'todo', title: 'Design database schema', description: 'Create ERD and define relationships', priority: 'medium' },
    { id: generateId(), columnId: 'in-progress', title: 'Implement authentication', description: 'Add login and registration functionality', priority: 'high' },
    { id: generateId(), columnId: 'in-progress', title: 'Create API endpoints', description: 'Build REST API for core features', priority: 'medium' },
    { id: generateId(), columnId: 'review', title: 'Write unit tests', description: 'Add test coverage for critical paths', priority: 'low' },
    { id: generateId(), columnId: 'done', title: 'Project kickoff meeting', description: 'Align team on goals and timeline', priority: 'medium' }
  ]
};

// Create the main store
function createKanbanStore() {
  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    
    // Add a new card to a column
    addCard: (columnId, title, description = '', priority = 'medium') => {
      update(state => ({
        ...state,
        cards: [
          ...state.cards,
          { id: generateId(), columnId, title, description, priority }
        ]
      }));
    },

    // Update an existing card
    updateCard: (cardId, updates) => {
      update(state => ({
        ...state,
        cards: state.cards.map(card =>
          card.id === cardId ? { ...card, ...updates } : card
        )
      }));
    },

    // Delete a card
    deleteCard: (cardId) => {
      update(state => ({
        ...state,
        cards: state.cards.filter(card => card.id !== cardId)
      }));
    },

    // Move a card to a different column (or reorder within same column)
    moveCard: (cardId, targetColumnId, targetIndex) => {
      update(state => {
        const cards = [...state.cards];
        const cardIndex = cards.findIndex(c => c.id === cardId);
        if (cardIndex === -1) return state;

        const [card] = cards.splice(cardIndex, 1);
        card.columnId = targetColumnId;

        // Find cards in target column and insert at correct position
        const targetColumnCards = cards.filter(c => c.columnId === targetColumnId);
        const otherCards = cards.filter(c => c.columnId !== targetColumnId);
        
        targetColumnCards.splice(targetIndex, 0, card);
        
        return {
          ...state,
          cards: [...otherCards, ...targetColumnCards]
        };
      });
    },

    // Add a new column
    addColumn: (title, color = '#64748b') => {
      const id = title.toLowerCase().replace(/\s+/g, '-');
      update(state => ({
        ...state,
        columns: [...state.columns, { id, title, color }]
      }));
    },

    // Update column
    updateColumn: (columnId, updates) => {
      update(state => ({
        ...state,
        columns: state.columns.map(col =>
          col.id === columnId ? { ...col, ...updates } : col
        )
      }));
    },

    // Delete column and its cards
    deleteColumn: (columnId) => {
      update(state => ({
        ...state,
        columns: state.columns.filter(col => col.id !== columnId),
        cards: state.cards.filter(card => card.columnId !== columnId)
      }));
    },

    // Reset to initial state
    reset: () => set(initialState)
  };
}

export const kanbanStore = createKanbanStore();

// Derived store to get cards grouped by column
export const cardsByColumn = derived(kanbanStore, $store => {
  const grouped = {};
  $store.columns.forEach(col => {
    grouped[col.id] = $store.cards.filter(card => card.columnId === col.id);
  });
  return grouped;
});
