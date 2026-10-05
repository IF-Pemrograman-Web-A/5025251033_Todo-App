let db;

Notification.requestPermission().then(function(permission) {
    console.log("Notification permission:", permission);
});

let capturedImageBlob = null;

let video = document.getElementById("camera");

let canvas = document.getElementById("photo-canvas");

document.getElementById("take-photo").addEventListener("click", function() {
    let context = canvas.getContext("2d");

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(function(blob){
       capturedImageBlob = blob;
    });
});

document.getElementById("openCam").addEventListener("click", 
    async function() {
        let stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });

        video.srcObject = stream;
});


let request = indexedDB.open("taskDB", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    
    db.createObjectStore("tasks", 
        { keyPath: "id" }
    );
}


request.onsuccess = function(event) {
    db = event.target.result;
    console.log("Database opened successfully");

    loadTasks();
}


request.onerror = function(event) {
    console.error("Database error: " + event.target.errorCode);
};

let task_list = document.getElementById("task-list");

if (localStorage.getItem("darkmode") === "true") {
    document.body.classList.add("dark-mode");
}

function addTask() {
    let taskTitle = document.getElementById("new-task-title").value;
    let taskDetails = document.getElementById("new-task-details").value;
    let taskStatus = "incomplete";
    let taskDate = document.getElementById("new-task-date").value;
    let taskTime = document.getElementById("new-task-time").value;

    let task = {
        id: Date.now(), 
        title: taskTitle,
        details: taskDetails,
        status: taskStatus,
        image: capturedImageBlob,
        date: taskDate,
        time: taskTime
    };

    saveTask(task);
    displayTask(task); 

    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: "scheduleNotification",
            task: task
        });
    }
}

function saveTask(task){
    let transaction = db.transaction(["tasks"], "readwrite");
    let objectStore = transaction.objectStore("tasks");

    objectStore.add(task);
}

function loadTasks() {
    let transaction = db.transaction(["tasks"], "readonly");
    let objectStore = transaction.objectStore("tasks");

    let request = objectStore.getAll();

    request.onsuccess = function(event) {
        let tasks = event.target.result;
        tasks.forEach(task => {
            displayTask(task);
        });
    }
}



function displayTask(task) {
    let taskItem = document.createElement("li");
    taskItem.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.details}</p>
        <p>Deadline: ${task.date} ${task.time}</p>
        <p class = "status-p">Status: ${task.status} 
            <input type="checkbox" onchange="updateStatus(this, '${task.id}')" ${task.status === "completed" ? "checked" : ""}>
        </p>
        <p><button onclick="displayPreviewTask('${task.id}')">View Details</button>
            <button onclick="deleteTask('${task.id}')">Delete</button>
        </p>
    `;
    task_list.appendChild(taskItem);
}

function deleteTask(taskId) {
    let transaction = db.transaction(["tasks"], "readwrite");
    let objectStore = transaction.objectStore("tasks");

    objectStore.delete(Number(taskId));
    displayTask();
}

function updateStatus(checkbox, taskId) {
    let statusText = checkbox.parentElement;
    let objectStore = db.transaction(["tasks"], "readwrite").objectStore("tasks");
    
    let request = objectStore.get(Number(taskId));

    request.onsuccess = function(event) {
        let task = event.target.result;

        if (checkbox.checked) {
            statusText.innerHTML = `Status: completed <input type="checkbox" onchange="updateStatus(this, '${taskId}')" checked>`;
            statusText.className = "status-c";

            task.status = "completed";
            objectStore.put(task);
        } else {
            statusText.innerHTML = `Status: incomplete <input type="checkbox" onchange="updateStatus(this, '${taskId}')">`;
            statusText.className = "status-p";
            task.status = "incomplete";
            objectStore.put(task);
        }
    }
}

function displayPreviewTask(taskID) {
    let request = db.transaction(["tasks"], "readonly").objectStore("tasks").get(Number(taskID));

    request.onsuccess = function(event) {
        let task = event.target.result;
        let taskTitleDisplayEdit = document.getElementById("task-title");
        let taskDetailsDisplayEdit = document.getElementById("task-details");

        taskTitleDisplayEdit.innerHTML = `Task Details: ${task.title}`;
        taskDetailsDisplayEdit.innerHTML = `Details for task: ${task.details} <br> 
        <p><img src="${task.image ? URL.createObjectURL(task.image) : ''}" alt="Task Image" width="200"></p>`;
    }
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");

    let button = document.getElementById("dark-mode-btn");

    if (document.body.classList.contains("dark-mode")) {
        button.textContent = "Light Mode";
        localStorage.setItem("darkmode", "true");
    } else {
        button.textContent = "Dark Mode";
        localStorage.setItem("darkmode", "false");
    }

    
}
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("serviceworker.js")
        .then(function(registration) {
            console.log("Service Worker registered");
        })
        .catch(function(error) {
            console.error("Service Worker registration failed:", error);
        });
}