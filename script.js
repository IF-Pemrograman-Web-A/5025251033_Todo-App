
let task_list = document.getElementById("task-list");

function addTask() {
    let taskTitle = document.getElementById("new-task-title").value;
    let taskDetails = document.getElementById("new-task-details").value;
    let taskStatus = "incomplete";

    let task = {
        title: taskTitle,
        details: taskDetails,
        status: taskStatus
    };

    displayTask(task); 
}

function displayTask(task) {
    let taskItem = document.createElement("li");
    taskItem.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.details}</p>
        <p class = "status-p">Status: ${task.status} 
            <input type="checkbox" onchange="updateStatus(this, '${task.title}')">
        </p>
        <p><button onclick="displayPreviewTask('${task.title}', '${task.details}')">View Details</button></p>
    `;
    task_list.appendChild(taskItem);
}

function updateStatus(checkbox, taskTitle) {
    let statusText = checkbox.parentElement;
    if (checkbox.checked) {
        statusText.innerHTML = `Status: completed <input type="checkbox" onchange="updateStatus(this, '${taskTitle}')" checked>`;
        statusText.className = "status-c";
    } else {
        statusText.innerHTML = `Status: incomplete <input type="checkbox" onchange="updateStatus(this, '${taskTitle}')">`;
        statusText.className = "status-p";
    }
}

function displayPreviewTask(taskTitle, taskDetails) {
    let taskTitleDisplayEdit = document.getElementById("task-title");
    let taskDetailsDisplayEdit = document.getElementById("task-details");

    taskTitleDisplayEdit.innerHTML = `Task Details: ${taskTitle}`;
    taskDetailsDisplayEdit.innerHTML = `Details for task: ${taskDetails}`;
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");

    let button = document.getElementById("dark-mode-btn");

    if (document.body.classList.contains("dark-mode")) {
        button.textContent = "Light Mode";
    } else {
        button.textContent = "Dark Mode";
    }
}