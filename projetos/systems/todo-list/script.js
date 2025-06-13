document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');

    // Load tasks from local storage
    loadTasks();

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') {
            alert('Please enter a task.');
            return;
        }
        createTaskElement(taskText, false); // false for not completed initially
        taskInput.value = '';
        saveTasks();
    }

    function createTaskElement(text, isCompleted) {
        const li = document.createElement('li');
        if (isCompleted) {
            li.classList.add('completed');
        }

        const taskSpan = document.createElement('span');
        taskSpan.textContent = text;
        li.appendChild(taskSpan);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('task-actions');

        const completeButton = document.createElement('button');
        completeButton.textContent = isCompleted ? 'Undo' : 'Complete';
        completeButton.classList.add('complete-btn');
        completeButton.addEventListener('click', () => {
            li.classList.toggle('completed');
            completeButton.textContent = li.classList.contains('completed') ? 'Undo' : 'Complete';
            saveTasks();
        });

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
            taskList.removeChild(li);
            saveTasks();
        });

        actionsDiv.appendChild(completeButton);
        actionsDiv.appendChild(removeButton);
        li.appendChild(actionsDiv);
        taskList.appendChild(li);
    }

    function saveTasks() {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(li => {
            tasks.push({
                text: li.querySelector('span').textContent,
                completed: li.classList.contains('completed')
            });
        });
        localStorage.setItem('todos', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('todos'));
        if (tasks) {
            tasks.forEach(task => {
                createTaskElement(task.text, task.completed);
            });
        }
    }
});
