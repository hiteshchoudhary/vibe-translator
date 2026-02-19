<script setup>
import { ref } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete', 'update'])

const isEditing = ref(false)
const editedTitle = ref('')

const priorityColors = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-red-100 text-red-800 border-red-200'
}

const tagColors = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700'
]

function getTagColor(index) {
  return tagColors[index % tagColors.length]
}

function startEditing() {
  editedTitle.value = props.task.title
  isEditing.value = true
}

function saveEdit() {
  if (editedTitle.value.trim()) {
    emit('update', { ...props.task, title: editedTitle.value.trim() })
  }
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}
</script>

<template>
  <div
    class="bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
  >
    <!-- Card Header -->
    <div class="flex items-start justify-between gap-2">
      <div v-if="isEditing" class="flex-1">
        <input
          v-model="editedTitle"
          @keyup.enter="saveEdit"
          @keyup.escape="cancelEdit"
          @blur="saveEdit"
          class="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          autofocus
        />
      </div>
      <h4
        v-else
        @dblclick="startEditing"
        class="text-sm font-medium text-gray-800 flex-1 leading-snug"
      >
        {{ task.title }}
      </h4>
      
      <button
        @click="$emit('delete', task.id)"
        class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1 -m-1"
        title="Delete task"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Description -->
    <p v-if="task.description" class="text-xs text-gray-500 mt-2 line-clamp-2">
      {{ task.description }}
    </p>

    <!-- Tags & Priority -->
    <div class="flex flex-wrap gap-1.5 mt-3">
      <span
        v-if="task.priority"
        :class="[priorityColors[task.priority], 'text-xs px-2 py-0.5 rounded-full font-medium border']"
      >
        {{ task.priority }}
      </span>
      <span
        v-for="(tag, index) in task.tags"
        :key="tag"
        :class="[getTagColor(index), 'text-xs px-2 py-0.5 rounded-full']"
      >
        {{ tag }}
      </span>
    </div>

    <!-- Footer -->
    <div v-if="task.dueDate || task.assignee" class="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
      <span v-if="task.dueDate" class="text-xs text-gray-400 flex items-center gap-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {{ task.dueDate }}
      </span>
      <div
        v-if="task.assignee"
        class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-medium"
        :title="task.assignee"
      >
        {{ task.assignee.charAt(0).toUpperCase() }}
      </div>
    </div>
  </div>
</template>
