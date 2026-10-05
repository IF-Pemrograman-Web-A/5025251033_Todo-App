self.addEventListener("install", function(event) {
    console.log("Service Worker installed");
});

self.addEventListener("activate", function(event) {
    console.log("Service Worker activated");
});

self.addEventListener("message", function(event) {
    if (event.data.type === "scheduleNotification") {
        let task = event.data.task;

        let notificationTime = new Date(
            task.date + "T" + task.time
        ).getTime();

        let currentTime = Date.now();
        let delay = notificationTime - currentTime;

        if (delay > 0) {
            setTimeout(function() {
                self.registration.showNotification("Todo Reminder", {
                    body: task.title,
                    icon: "assets/icon.png"
                });
            }, delay);
        }
    }
});