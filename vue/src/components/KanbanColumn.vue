<script setup>
import { ref, computed } from 'vue'
import draggable from 'vuedraggable'
import KanbanCard from './KanbanCard.vue'

const props = defineProps({
  column: {
    type: Object,
    required: true
  },
  tasks: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:tasks', 'add-task', 'delete-task', 'update-task', 'delete-column', 'update-column'])

const isAddingTask = ref(false)
const newTaskTitle = ref('')
const isEditingTitle = ref(false)
const editedTitle = ref('')

const localTasks = computed({
  get: () => props.tasks,
  set: (value) => emit('update:tasks', value)
})

const columnColors = {
  gray: 'bg-gray-100 border-gray-300',
  blue: 'bg-blue-50 border-blue-300',
  yellow: 'bg-yellow-50 border-yellow-300',
  green: 'bg-green-50 border-green-300',
  red: 'bg-red-50 border-red-300',
  purple: 'bg-purple-50 border-purple-300'
}

const headerColors = {
  gray: 'text-gray-700',
  blue: 'text-blue-700',
  yellow: 'text-yellow-700',
  green: 'text-green-700',
  red: 'text-red-700',
  purple: 'text-purple-700'
}

const countBadgeColors = {
  gray: 'bg-gray-200 text-gray-600',
  blue: 'bg-blue-200 text-blue-700',
  yellow: 'bg-yellow-200 text-yellow-700',
  green: 'bg-green-200 text-green-700',
  red: 'bg-red-200 text-red-700',
  purple: 'bg-purple-200 text-purple-700'
}

function startAddingTask() {
  isAddingTask.value = true
  newTaskTitle.value = ''
}

function addTask() {
  if (newTaskTitle.value.trim()) {
    emit('add-task', {
      columnId: props.column.id,
      title: newTaskTitle.value.trim()
    })
    newTaskTitle.value = ''
  }
  isAddingTask.value = false
}

function cancelAddTask() {
  isAddingTask.value = false
  newTaskTitle.value = ''
}

function startEditingTitle() {
  editedTitle.value = props.column.title
  isEditingTitle.value = true
}

function saveTitle() {
  if (editedTitle.value.trim() && editedTitle.value !== props.column.title) {
    emit('update-column', { ...props.column, title: editedTitle.value.trim() })
  }
  isEditingTitle.value = false
}
</script>

<template>
  <div
    :class="[
      columnColors[column.color] || columnColors.gray,
      'flex flex-col w-80 flex-shrink-0 rounded-xl border-2 max-h-full'
    ]"
  >
    <!-- Column Header -->
    <div class="p-3 border-b border-gray-200/50">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <input
            v-if="isEditingTitle"
            v-model="editedTitle"
            @keyup.enter="saveTitle"
            @keyup.escape="isEditingTitle = false"
            @blur="saveTitle"
            class="font-semibold text-sm bg-white px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            autofocus
          />
          <h3
            v-else
            @dblclick="startEditingTitle"
            :class="[headerColors[column.color] || headerColors.gray, 'font-semibold text-sm truncate cursor-pointer']"
          >
            {{ column.title }}
          </h3>
          <span
            :class="[
              countBadgeColors[column.color] || countBadgeColors.gray,
              'text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0'
            ]"
          >
            {{ tasks.length }}
          </span>
        </div>
        <div class="flex items-center gap-1">
          <button
            @click="startAddingTask"
            class="p-1.5 hover:bg-white/50 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
            title="Add task"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            @click="$emit('delete-column', column.id)"
            class="p-1.5 hover:bg-white/50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
            title="Delete column"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Task List -->
    <div class="flex-1 overflow-y-auto p-2 custom-scrollbar min-h-[100px]">
      <draggable
        v-model="localTasks"
        group="tasks"
        item-key="id"
        :animation="200"
        ghost-class="ghost-card"
        drag-class="drag-card"
        class="space-y-2 min-h-full"
      >
        <template #item="{ element }">
          <KanbanCard
            :task="element"
            @delete="$emit('delete-task', $event)"
            @update="$emit('update-task', $event)"
          />
        </template>
      </draggable>

      <!-- Add Task Form -->
      <div v-if="isAddingTask" class="mt-2">
        <textarea
          v-model="newTaskTitle"
          @keydown.enter.prevent="addTask"
          @keydown.escape="cancelAddTask"
          placeholder="Enter task title..."
          class="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows="2"
          autofocus
        ></textarea>
        <div class="flex gap-2 mt-2">
          <button
            @click="addTask"
            class="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
          <button
            @click="cancelAddTask"
            class="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Add Task Button (when not adding) -->
    <div v-if="!isAddingTask" class="p-2 border-t border-gray-200/50">
      <button
        @click="startAddingTask"
        class="w-full py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg transition-colors flex items-center justify-center gap-1"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add a task
      </button>
    </div>
  </div>
</template>
