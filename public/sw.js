self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("message", (event) => {
  if (!event.data || typeof event.data !== "object") return

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
    return
  }

  if (event.data.type === "TIMER_COMPLETE") {
    event.waitUntil(
      self.registration.showNotification("Workout complete", {
        body: "Time to start your next set!",
        icon: "/icon-192.png",
        tag: "workout-timer",
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200],
      })
    )
  }
})
