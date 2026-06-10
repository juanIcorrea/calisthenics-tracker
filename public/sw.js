self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.TIMER_DATA = null
self.TIMER_INTERVAL = null

function clearTimer() {
  if (self.TIMER_INTERVAL) {
    clearInterval(self.TIMER_INTERVAL)
    self.TIMER_INTERVAL = null
  }
  self.TIMER_DATA = null
}

function startTimer(duration, startTime) {
  clearTimer()
  self.TIMER_DATA = { duration, startTime }

  self.TIMER_INTERVAL = setInterval(function check() {
    const elapsed = Date.now() - self.TIMER_DATA.startTime
    if (elapsed >= self.TIMER_DATA.duration * 1000) {
      self.registration.showNotification("Workout complete", {
        body: "Time to start your next set!",
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true,
        tag: "workout-timer",
        icon: "/icon-192.png",
      })
      clearInterval(self.TIMER_INTERVAL)
      self.TIMER_DATA = null
    }
  }, 1000)
}

self.addEventListener("message", (event) => {
  if (!event.data || typeof event.data !== "object") return

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
    return
  }

  if (event.data.type === "TIMER_START") {
    const { duration, startTime } = event.data
    if (typeof duration !== "number" || typeof startTime !== "number") return
    event.waitUntil(
      (async () => {
        startTimer(duration, startTime)
      })()
    )
    return
  }

  if (event.data.type === "TIMER_STOP") {
    event.waitUntil(
      (async () => {
        clearTimer()
      })()
    )
    return
  }
})
