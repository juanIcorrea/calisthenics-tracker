self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

let timerId = null

function clearTimer() {
  if (timerId) {
    clearTimeout(timerId)
    timerId = null
  }
}

function scheduleNotification(duration, startTime) {
  clearTimer()
  const remaining = (startTime + duration * 1000) - Date.now()
  if (remaining <= 0) {
    fireNotification()
    return
  }
  timerId = setTimeout(fireNotification, remaining)
}

function fireNotification() {
  timerId = null
  self.registration.showNotification("Workout complete", {
    body: "Time to start your next set!",
    vibrate: [200, 100, 200, 100, 200, 100, 400],
    requireInteraction: true,
    tag: "workout-timer",
    icon: "/icon.svg",
    badge: "/icon.svg",
  })
}

self.addEventListener("message", (event) => {
  if (!event.data || typeof event.data !== "object") return
  const { type } = event.data

  if (type === "SKIP_WAITING") {
    self.skipWaiting()
    return
  }

  if (type === "TIMER_START") {
    const { duration, startTime } = event.data
    if (typeof duration !== "number" || typeof startTime !== "number") return
    scheduleNotification(duration, startTime)
    return
  }

  if (type === "TIMER_STOP") {
    clearTimer()
    return
  }
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      if (clients.length > 0) {
        clients[0].focus()
      } else {
        self.clients.openWindow("/")
      }
    })
  )
})
