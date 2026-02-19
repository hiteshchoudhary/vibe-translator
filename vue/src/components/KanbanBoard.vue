<script setup>
import { ref, reactive, watch } from 'vue'
import KanbanColumn from './KanbanColumn.vue'

// Generate unique IDs
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Local storage key
const STORAGE_KEY = 'kanban-board-data'

// Load data from localStorage
function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e)
  }
  return null
}

// Default data
const defaultData = {
  columns: [
    { id: 'col-1', title: 'To Do', color: 'gray' },
    { id: 'col-2', title: 'In Progress', color: 'blue' },
    { id: 'col-3', title: 'Review', color: 'yellow' },
    { id: 'col-4', title: 'Done', color: 'green' }
  ],
  tasks: {
    'col-1': [
      {
        id: 'task-1',
        title: 'Research competitors',
        description: 'Analyze top 5 competitors and document findings',
        priority: 'high',
        tags: ['research'],
        dueDate: 'Feb 25',
        assignee: 'Alice'
      },
      {
        id: 'task-2',
        title: 'Design system setup',
        description: 'Create color palette and typography scale',
        priority: 'medium',
        tags: ['design', 'foundation'],
        assignee: 'Bob'
      },
      {
        id: 'task-3',
        title: 'Write documentation',
        priority: 'low',
        tags: ['docs']
      }
    ],
    'col-2': [
      {
        id: 'task-4',
        title: 'Implement authentication',
        description: 'Add OAuth2 login with Google and GitHub',
        priority: 'high',
        tags: ['backend', 'security'],
        dueDate: 'Feb 22',
        assignee: 'Charlie'
      },
      {
        id: 'task-5',
        title: 'Build dashboard UI',
        priority: 'medium',
        tags: ['frontend'],
        assignee: 'Alice'
      }
    ],
    'col-3': [
      {
        id: 'task-6',
        title: 'API rate limiting',
        description: 'Review implementation and test edge cases',
        priority: 'medium',
        tags: ['backend'],
        assignee: 'David'
      }
    ],
    'col-4': [
      {
        id: 'task-7',
        title: 'Project setup',
        description: 'Initialize repository and CI/CD pipeline',
        priority: 'high',
        tags: ['devops'],
        assignee: 'Charlie'
      },
      {
        id: 'task-8',
        title: 'Database schema design',
        priority: 'high',
        tags: ['backend', 'database'],
        assignee: 'David'
      }
    ]
  }
}

// Initialize state
const savedData = loadFromStorage()
const columns = ref(savedData?.columns || defaultData.columns)
const tasks = reactive(savedData?.tasks || defaultData.tasks)

// Save to localStorage whenever data changes
watch(
  [columns, tasks],
  () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      columns: columns.value,
      tasks: tasks
    }))
  },
  { deep: true }
)

// Column operations
const isAddingColumn = ref(false)
const newColumnTitle = ref('')
const columnColors = ['gray', 'blue', 'yellow', 'green', 'red', 'purple']

function addColumn() {
  if (newColumnTitle.value.trim()) {
    const newId = 'col-' + generateId()
    columns.value.push({
      id: newId,
      title: newColumnTitle.value.trim(),
      color: columnColors[columns.value.length % columnColors.length]
    })
    tasks[newId] = []
    newColumnTitle.value = ''
    isAddingColumn.value = false
  }
}

function deleteColumn(columnId) {
  const index = columns.value.findIndex(c => c.id === columnId)
  if (index !== -1) {
    columns.value.splice(index, 1)
    delete tasks[columnId]
  }
}

function updateColumn(updatedColumn) {
  const index = columns.value.findIndex(c => c.id === updatedColumn.id)
  if (index !== -1) {
    columns.value[index] = updatedColumn
  }
}

// Task operations
function addTask({ columnId, title }) {
  const newTask = {
    id: 'task-' + generateId(),
    title,
    priority: null,
    tags: [],
    description: '',
    dueDate: null,
    assignee: null
  }
  tasks[columnId].push(newTask)
}

function deleteTask(taskId) {
  for (const columnId in tasks) {
    const index = tasks[columnId].findIndex(t => t.id === taskId)
    if (index !== -1) {
      tasks[columnId].splice(index, 1)
      break
    }
  }
}

function updateTask(updatedTask) {
  for (const columnId in tasks) {
    const index = tasks[columnId].findIndex(t => t.id === updatedTask.id)
    if (index !== -1) {
      tasks[columnId][index] = updatedTask
      break
    }
  }
}

function updateColumnTasks(columnId, newTasks) {
  tasks[columnId] = newTasks
}

function resetBoard() {
  columns.value = [...defaultData.columns]
  Object.keys(tasks).forEach(key => delete tasks[key])
  Object.entries(defaultData.tasks).forEach(([key, value]) => {
    tasks[key] = [...value]
  })
}
</script>

<template>
  <div class="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Header -->
    <header class="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">Kanban Board</h1>
              <p class="text-sm text-gray-500">Drag and drop to organize your tasks</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="resetBoard"
              class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Reset Board
            </button>
            <button
              @click="isAddingColumn = true"
              class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Column
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Board -->
    <main class="flex-1 overflow-x-auto overflow-y-hidden p-6">
      <div class="flex gap-4 h-full items-start">
        <!-- Columns -->
        <KanbanColumn
          v-for="column in columns"
          :key="column.id"
          :column="column"
          :tasks="tasks[column.id] || []"
          @update:tasks="updateColumnTasks(column.id, $event)"
          @add-task="addTask"
          @delete-task="deleteTask"
          @update-task="updateTask"
          @delete-column="deleteColumn"
          @update-column="updateColumn"
        />

        <!-- Add Column Form -->
        <div v-if="isAddingColumn" class="w-80 flex-shrink-0">
          <div class="bg-white rounded-xl border-2 border-dashed border-gray-300 p-4">
            <input
              v-model="newColumnTitle"
              @keyup.enter="addColumn"
              @keyup.escape="isAddingColumn = false"
              placeholder="Enter column title..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              autofocus
            />
            <div class="flex gap-2 mt-3">
              <button
                @click="addColumn"
                class="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Column
              </button>
              <button
                @click="isAddingColumn = false"
                class="px-3 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Add Column Button (when not adding) -->
        <button
          v-else
          @click="isAddingColumn = true"
          class="w-80 flex-shrink-0 h-24 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Column
        </button>
      </div>
    </main>
  </div>
</template>
