// Kanban Board Application
(function() {
    'use strict';

    // State Management
    let tasks = [];
    let editingTaskId = null;

    // DOM Elements
    const modal = document.getElementById('taskModal');
    const taskForm = document.getElementById('taskForm');
    const modalTitle = document.getElementById('modalTitle');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const taskPriorityInput = document.getElementById('taskPriority');
    const taskIdInput = document.getElementById('taskId');
    const taskStatusInput = document.getElementById('taskStatus');
    const addTaskBtns = document.querySelectorAll('.add-task-btn');
    const taskContainers = document.querySelectorAll('.tasks');

    // Initialize
    function init() {
        loadTasks();
        renderAllTasks();
        setupEventListeners();
        setupDragAndDrop();
    }

    // Local Storage
    function loadTasks() {
        const stored = localStorage.getItem('kanban-tasks');
        tasks = stored ? JSON.parse(stored) : getDefaultTasks();
    }

    function saveTasks() {
        localStorage.setItem('kanban-tasks', JSON.stringify(tasks));
    }

    function getDefaultTasks() {
        return [
            {
                id: generateId(),
                title: 'Welcome to Kanban!',
                description: 'Drag and drop tasks between columns to organize your workflow.',
                priority: 'low',
                status: 'todo'
            },
            {
                id: generateId(),
                title: 'Create your first task',
                description: 'Click the "+ Add Task" button to create a new task.',
                priority: 'medium',
                status: 'todo'
            },
            {
                id: generateId(),
                title: 'Learn the features',
                description: 'Edit tasks by clicking the pencil icon, delete with the trash icon.',
                priority: 'high',
                status: 'in-progress'
            }
        ];
    }

    // Utility Functions
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Task CRUD Operations
    function createTask(title, description, priority, status) {
        const task = {
            id: generateId(),
            title: title.trim(),
            description: description.trim(),
            priority,
            status
        };
        tasks.push(task);
        saveTasks();
        return task;
    }

    function updateTask(id, updates) {
        const index = tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updates };
            saveTasks();
            return tasks[index];
        }
        return null;
    }

    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
    }

    function getTasksByStatus(status) {
        return tasks.filter(t => t.status === status);
    }

    // Rendering
    function renderAllTasks() {
        const statuses = ['todo', 'in-progress', 'done'];
        statuses.forEach(status => {
            renderTasksForStatus(status);
        });
        updateAllCounts();
    }

    function renderTasksForStatus(status) {
        const container = document.querySelector(`.tasks[data-status="${status}"]`);
        const statusTasks = getTasksByStatus(status);
        
        container.innerHTML = statusTasks.map(task => createTaskCardHTML(task)).join('');
        
        // Add event listeners to new cards
        container.querySelectorAll('.task-card').forEach(card => {
            setupTaskCardEvents(card);
        });
    }

    function createTaskCardHTML(task) {
        return `
            <div class="task-card priority-${task.priority}" draggable="true" data-id="${task.id}">
                <div class="task-card-header">
                    <span class="task-title">${escapeHtml(task.title)}</span>
                    <div class="task-actions">
                        <button class="edit-btn" title="Edit task">✏️</button>
                        <button class="delete-btn" title="Delete task">🗑️</button>
                    </div>
                </div>
                ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
                <div class="task-meta">
                    <span class="priority-badge ${task.priority}">${task.priority}</span>
                </div>
            </div>
        `;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function updateAllCounts() {
        const statuses = ['todo', 'in-progress', 'done'];
        statuses.forEach(status => {
            const count = getTasksByStatus(status).length;
            const column = document.querySelector(`.column[data-status="${status}"]`);
            column.querySelector('.task-count').textContent = count;
        });
    }

    // Event Listeners
    function setupEventListeners() {
        // Add task buttons
        addTaskBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                openModal(btn.dataset.status);
            });
        });

        // Modal controls
        closeModalBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Form submission
        taskForm.addEventListener('submit', handleFormSubmit);

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    function setupTaskCardEvents(card) {
        const editBtn = card.querySelector('.edit-btn');
        const deleteBtn = card.querySelector('.delete-btn');
        const taskId = card.dataset.id;

        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const task = tasks.find(t => t.id === taskId);
            if (task) openModal(task.status, task);
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this task?')) {
                deleteTask(taskId);
                renderAllTasks();
            }
        });

        // Setup drag events for the card
        setupCardDragEvents(card);
    }

    // Modal Functions
    function openModal(status, task = null) {
        editingTaskId = task ? task.id : null;
        modalTitle.textContent = task ? 'Edit Task' : 'Add New Task';
        
        taskTitleInput.value = task ? task.title : '';
        taskDescriptionInput.value = task ? task.description : '';
        taskPriorityInput.value = task ? task.priority : 'medium';
        taskStatusInput.value = status;
        taskIdInput.value = task ? task.id : '';

        modal.classList.add('active');
        taskTitleInput.focus();
    }

    function closeModal() {
        modal.classList.remove('active');
        taskForm.reset();
        editingTaskId = null;
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        const title = taskTitleInput.value;
        const description = taskDescriptionInput.value;
        const priority = taskPriorityInput.value;
        const status = taskStatusInput.value;

        if (!title.trim()) return;

        if (editingTaskId) {
            updateTask(editingTaskId, { title, description, priority });
        } else {
            createTask(title, description, priority, status);
        }

        closeModal();
        renderAllTasks();
    }

    // Drag and Drop
    function setupDragAndDrop() {
        taskContainers.forEach(container => {
            container.addEventListener('dragover', handleDragOver);
            container.addEventListener('dragleave', handleDragLeave);
            container.addEventListener('drop', handleDrop);
        });
    }

    function setupCardDragEvents(card) {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    }

    function handleDragStart(e) {
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', e.target.dataset.id);
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
        document.querySelectorAll('.tasks').forEach(container => {
            container.classList.remove('drag-over');
        });
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        const container = e.currentTarget;
        container.classList.remove('drag-over');

        const taskId = e.dataTransfer.getData('text/plain');
        const newStatus = container.dataset.status;

        const task = tasks.find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
            updateTask(taskId, { status: newStatus });
            renderAllTasks();
        }
    }

    // Initialize the application
    document.addEventListener('DOMContentLoaded', init);
})();
