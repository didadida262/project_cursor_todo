// 待办事项应用 - 主要功能实现
class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.init();
    }

    // 初始化应用
    init() {
        this.loadTodos();
        this.bindEvents();
        this.render();
    }

    // 绑定事件监听器
    bindEvents() {
        // 表单提交事件
        document.getElementById('todo-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        // 筛选按钮事件
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // 批量操作事件
        document.getElementById('clear-completed').addEventListener('click', () => {
            this.clearCompleted();
        });

        document.getElementById('clear-all').addEventListener('click', () => {
            this.clearAll();
        });
    }

    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 添加新任务
    addTodo() {
        const input = document.getElementById('todo-input');
        const text = input.value.trim();

        if (!text) {
            this.showMessage('请输入任务内容', 'warning');
            return;
        }

        const todo = {
            id: this.generateId(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo); // 新任务添加到顶部
        input.value = '';
        this.saveTodos();
        this.render();
        this.showMessage('任务添加成功', 'success');
    }

    // 切换任务完成状态
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    // 删除任务
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

    // 设置筛选条件
    setFilter(filter) {
        this.currentFilter = filter;
        
        // 更新筛选按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.render();
    }

    // 获取筛选后的任务列表
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

    // 清除已完成的任务
    clearCompleted() {
        const completedCount = this.todos.filter(todo => todo.completed).length;
        if (completedCount === 0) {
            this.showMessage('没有已完成的任务', 'info');
            return;
        }

        if (confirm(`确定要删除 ${completedCount} 个已完成的任务吗？`)) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveTodos();
            this.render();
            this.showMessage(`已删除 ${completedCount} 个已完成的任务`, 'success');
        }
    }

    // 清除所有任务
    clearAll() {
        if (this.todos.length === 0) {
            this.showMessage('没有任务需要清除', 'info');
            return;
        }

        if (confirm(`确定要删除所有 ${this.todos.length} 个任务吗？`)) {
            this.todos = [];
            this.saveTodos();
            this.render();
            this.showMessage('已清除所有任务', 'success');
        }
    }

    // 渲染任务列表
    render() {
        const todoList = document.getElementById('todo-list');
        const emptyState = document.getElementById('empty-state');
        const taskCount = document.getElementById('task-count');
        const filteredTodos = this.getFilteredTodos();

        // 更新任务计数
        const totalTasks = this.todos.length;
        const activeTasks = this.todos.filter(todo => !todo.completed).length;
        const completedTasks = this.todos.filter(todo => todo.completed).length;

        let countText = '';
        switch (this.currentFilter) {
            case 'active':
                countText = `${activeTasks} 个未完成任务`;
                break;
            case 'completed':
                countText = `${completedTasks} 个已完成任务`;
                break;
            default:
                countText = `${totalTasks} 个任务 (${activeTasks} 未完成, ${completedTasks} 已完成)`;
        }
        taskCount.textContent = countText;

        // 清空列表
        todoList.innerHTML = '';

        // 显示空状态或任务列表
        if (filteredTodos.length === 0) {
            emptyState.style.display = 'block';
            todoList.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            todoList.style.display = 'block';

            // 渲染任务项
            filteredTodos.forEach(todo => {
                const todoElement = this.createTodoElement(todo);
                todoList.appendChild(todoElement);
            });
        }

        // 更新批量操作按钮状态
        this.updateBatchButtons();
    }

    // 创建任务元素
    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.setAttribute('data-id', todo.id);

        li.innerHTML = `
            <span class="todo-text">${this.escapeHtml(todo.text)}</span>
            <div class="todo-actions">
                <button class="btn btn-complete" onclick="app.toggleTodo('${todo.id}')">
                    ${todo.completed ? '未完成' : '完成'}
                </button>
                <button class="btn btn-delete" onclick="app.deleteTodo('${todo.id}')">
                    删除
                </button>
            </div>
        `;

        return li;
    }

    // HTML转义，防止XSS攻击
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 更新批量操作按钮状态
    updateBatchButtons() {
        const completedCount = this.todos.filter(todo => todo.completed).length;
        const clearCompletedBtn = document.getElementById('clear-completed');
        const clearAllBtn = document.getElementById('clear-all');

        clearCompletedBtn.disabled = completedCount === 0;
        clearAllBtn.disabled = this.todos.length === 0;

        if (completedCount === 0) {
            clearCompletedBtn.textContent = '清除已完成';
        } else {
            clearCompletedBtn.textContent = `清除已完成 (${completedCount})`;
        }

        if (this.todos.length === 0) {
            clearAllBtn.textContent = '清除全部';
        } else {
            clearAllBtn.textContent = `清除全部 (${this.todos.length})`;
        }
    }

    // 保存到LocalStorage
    saveTodos() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        } catch (error) {
            console.error('保存数据失败:', error);
            this.showMessage('保存数据失败', 'error');
        }
    }

    // 从LocalStorage加载
    loadTodos() {
        try {
            const stored = localStorage.getItem('todos');
            if (stored) {
                this.todos = JSON.parse(stored);
            }
        } catch (error) {
            console.error('加载数据失败:', error);
            this.todos = [];
        }
    }

    // 显示消息提示
    showMessage(message, type = 'info') {
        // 创建消息元素
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

        // 根据类型设置背景色
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        messageEl.style.backgroundColor = colors[type] || colors.info;

        // 添加到页面
        document.body.appendChild(messageEl);

        // 3秒后自动移除
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

// 添加消息动画样式
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

// 初始化应用
const app = new TodoApp();

// 页面加载完成后的额外初始化
document.addEventListener('DOMContentLoaded', () => {
    // 聚焦到输入框
    document.getElementById('todo-input').focus();
    
    // 添加键盘快捷键支持
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter 快速添加任务
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            app.addTodo();
        }
        
        // Escape 清空输入框
        if (e.key === 'Escape') {
            document.getElementById('todo-input').value = '';
            document.getElementById('todo-input').blur();
        }
    });
});
