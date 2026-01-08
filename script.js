// Todo App - Main Functionality Implementation
class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.init();
    }

    // Initialize application
    init() {
        this.loadTodos();
        this.bindEvents();
        this.render();
    }

    // Bind event listeners
    bindEvents() {
        // Form submit event
        document.getElementById('todo-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        // Filter button events
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Batch operation events
        document.getElementById('clear-completed').addEventListener('click', () => {
            this.clearCompleted();
        });

        document.getElementById('clear-all').addEventListener('click', () => {
            this.clearAll();
        });
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Add new todo
    addTodo() {
        const input = document.getElementById('todo-input');
        const text = input.value.trim();

        if (!text) {
            this.showMessage('Please enter a task', 'warning');
            return;
        }

        const todo = {
            id: this.generateId(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo); // Add new task to the top
        input.value = '';
        this.saveTodos();
        this.render();
        this.showMessage('Task added successfully', 'success');
    }

    // Toggle todo completion status
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    // Delete todo
    deleteTodo(id) {
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        if (todoElement) {
            todoElement.classList.add('removing');
            setTimeout(() => {
                this.todos = this.todos.filter(t => t.id !== id);
                this.saveTodos();
                this.render();
            }, 300);
        }
    }

    // Set filter condition
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter button status
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.render();
    }

    // Get filtered todo list
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    // Clear completed tasks
    clearCompleted() {
        const completedCount = this.todos.filter(todo => todo.completed).length;
        if (completedCount === 0) {
            this.showMessage('No completed tasks', 'info');
            return;
        }

        if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveTodos();
            this.render();
            this.showMessage(`Deleted ${completedCount} completed task(s)`, 'success');
        }
    }

    // Clear all tasks
    clearAll() {
        if (this.todos.length === 0) {
            this.showMessage('No tasks to clear', 'info');
            return;
        }

        if (confirm(`Are you sure you want to delete all ${this.todos.length} task(s)?`)) {
            this.todos = [];
            this.saveTodos();
            this.render();
            this.showMessage('All tasks cleared', 'success');
        }
    }

    // Render todo list
    render() {
        const todoList = document.getElementById('todo-list');
        const emptyState = document.getElementById('empty-state');
        const taskCount = document.getElementById('task-count');
        const filteredTodos = this.getFilteredTodos();

        // Update task count
        const totalTasks = this.todos.length;
        const activeTasks = this.todos.filter(todo => !todo.completed).length;
        const completedTasks = this.todos.filter(todo => todo.completed).length;

        let countText = '';
        switch (this.currentFilter) {
            case 'active':
                countText = `${activeTasks} active task(s)`;
                break;
            case 'completed':
                countText = `${completedTasks} completed task(s)`;
                break;
            default:
                countText = `${totalTasks} task(s) (${activeTasks} active, ${completedTasks} completed)`;
        }
        taskCount.textContent = countText;

        // Clear list
        todoList.innerHTML = '';

        // Show empty state or todo list
        if (filteredTodos.length === 0) {
            emptyState.style.display = 'flex';
            todoList.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            todoList.style.display = 'block';

            // Render todo items
            filteredTodos.forEach(todo => {
                const todoElement = this.createTodoElement(todo);
                todoList.appendChild(todoElement);
            });
        }

        // Update batch operation button status
        this.updateBatchButtons();
    }

    // Create todo element
    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.setAttribute('data-id', todo.id);

        const buttonClass = todo.completed ? 'btn-incomplete' : 'btn-complete';
        const buttonText = todo.completed ? 'Incomplete' : 'Complete';

        li.innerHTML = `
            <span class="todo-text">${this.escapeHtml(todo.text)}</span>
            <div class="todo-actions">
                <button class="btn ${buttonClass}" onclick="app.toggleTodo('${todo.id}')">
                    ${buttonText}
                </button>
                <button class="btn btn-delete" onclick="app.deleteTodo('${todo.id}')">
                    Delete
                </button>
            </div>
        `;

        return li;
    }

    // HTML escape to prevent XSS attacks
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Update batch operation button status
    updateBatchButtons() {
        const completedCount = this.todos.filter(todo => todo.completed).length;
        const clearCompletedBtn = document.getElementById('clear-completed');
        const clearAllBtn = document.getElementById('clear-all');

        clearCompletedBtn.disabled = completedCount === 0;
        clearAllBtn.disabled = this.todos.length === 0;

        if (completedCount === 0) {
            clearCompletedBtn.textContent = 'Clear Completed';
        } else {
            clearCompletedBtn.textContent = `Clear Completed (${completedCount})`;
        }

        if (this.todos.length === 0) {
            clearAllBtn.textContent = 'Clear All';
        } else {
            clearAllBtn.textContent = `Clear All (${this.todos.length})`;
        }
    }

    // Save to LocalStorage
    saveTodos() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        } catch (error) {
            console.error('Failed to save data:', error);
            this.showMessage('Failed to save data', 'error');
        }
    }

    // Load from LocalStorage
    loadTodos() {
        try {
            const stored = localStorage.getItem('todos');
            if (stored) {
                this.todos = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            this.todos = [];
        }
    }

    // Show message notification
    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;

        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        messageEl.style.backgroundColor = colors[type] || colors.info;

        // Add to page
        document.body.appendChild(messageEl);

        // Auto remove after 3 seconds
        setTimeout(() => {
            messageEl.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }
}

// Add message animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

    // Initialize application
    const app = new TodoApp();

    // Add some test data to verify scroll effect (for development use)
    if (app.todos.length === 0) {
        const testTodos = [
            'Learn JavaScript ES6+ syntax',
            'Complete todo app development',
            'Optimize CSS styles and responsive design',
            'Implement LocalStorage data persistence',
            'Add task filtering and batch operations',
            'Test app compatibility across browsers',
            'Write project documentation and README',
            'Optimize code performance and user experience',
            'Add keyboard shortcut support',
            'Implement message notifications and animations',
            'Test mobile responsive layout',
            'Optimize scrollbar styles and interactions',
            'Add task search functionality',
            'Implement task priority settings',
            'Add task categories and tags',
            'Implement task export and import',
            'Add task reminders and notifications',
            'Implement multi-user collaboration',
            'Add task statistics and analytics',
            'Optimize database query performance'
        ];
        
        testTodos.forEach((text, index) => {
            const todo = {
                id: `test_${index}`,
                text: text,
                completed: index % 3 === 0, // Every 3rd task is completed
                createdAt: new Date(Date.now() - index * 60000).toISOString()
            };
            app.todos.push(todo);
        });
        
        app.saveTodos();
        app.render();
    }

// Additional initialization after page load
document.addEventListener('DOMContentLoaded', () => {
    // Focus on input field
    document.getElementById('todo-input').focus();
    
    // Add keyboard shortcut support
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to quickly add task
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            app.addTodo();
        }
        
        // Escape to clear input field
        if (e.key === 'Escape') {
            document.getElementById('todo-input').value = '';
            document.getElementById('todo-input').blur();
        }
    });
});
