"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface WorkoutTimerProps {
  duration: number
  onComplete: () => void
  autoStart?: boolean
}

export default function WorkoutTimer({ duration, onComplete, autoStart = false }: WorkoutTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isActive, setIsActive] = useState(autoStart)
  const [progress, setProgress] = useState(100)

  const startTimeRef = useRef<number | null>(null)
  const initialTimeLeftRef = useRef<number>(duration)
  const completedRef = useRef(false)

  const recomputeTimeLeft = () => {
    if (startTimeRef.current == null) return
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const remaining = initialTimeLeftRef.current - elapsed
    if (remaining <= 0) {
      setTimeLeft(0)
      if (!completedRef.current) {
        completedRef.current = true
        setIsActive(false)
        showLocalNotification()
        onComplete()
      }
    } else {
      setTimeLeft(remaining)
    }
  }

  useEffect(() => {
    if (!isActive) {
      startTimeRef.current = null
      sendStopMessage()
      return
    }

    completedRef.current = false
    const startTime = Date.now()
    startTimeRef.current = startTime
    initialTimeLeftRef.current = timeLeft
    sendStartMessage(timeLeft, startTime)

    const tick = () => {
      recomputeTimeLeft()
    }

    const interval = setInterval(tick, 250)

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        recomputeTimeLeft()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      sendStopMessage()
    }
  }, [isActive])

  useEffect(() => {
    setProgress((timeLeft / duration) * 100)
  }, [timeLeft, duration])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator)) return
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {})
    }
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        if (registration.active && !navigator.serviceWorker.controller) {
          registration.active.postMessage({ type: "SKIP_WAITING" })
        }
      })
      .catch(() => {})
  }, [])

  const sendStartMessage = (duration: number, startTime: number) => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
    const send = (sw: ServiceWorker | null) => {
      if (sw) {
        sw.postMessage({ type: "TIMER_START", duration, startTime })
      }
    }
    if (navigator.serviceWorker.controller) {
      send(navigator.serviceWorker.controller)
    } else {
      navigator.serviceWorker.ready
        .then((registration) => send(registration.active))
        .catch(() => {})
    }
  }

  const sendStopMessage = () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
    const send = (sw: ServiceWorker | null) => {
      if (sw) {
        sw.postMessage({ type: "TIMER_STOP" })
      }
    }
    if (navigator.serviceWorker.controller) {
      send(navigator.serviceWorker.controller)
    } else {
      navigator.serviceWorker.ready
        .then((registration) => send(registration.active))
        .catch(() => {})
    }
  }

  const showLocalNotification = () => {
    if (typeof window === "undefined" || !("Notification" in window)) return
    if (Notification.permission !== "granted") return
    try {
      new Notification("Workout complete", { body: "Time to start your next set!" })
    } catch {}
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const toggleTimer = () => {
    if (timeLeft === 0) return
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(duration)
    setProgress(100)
    startTimeRef.current = null
    completedRef.current = false
  }

  const getTimerColor = () => {
    if (timeLeft > duration * 0.5) return "text-emerald-500"
    if (timeLeft > duration * 0.2) return "text-amber-500"
    return "text-red-500"
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center">
        <span className={cn("text-7xl font-extrabold tabular-nums tracking-tight transition-colors duration-300", getTimerColor())}>
          {formatTime(timeLeft)}
        </span>
      </div>

      <Progress value={progress} className={cn("h-3 transition-all duration-300", timeLeft < 10 && "animate-pulse")} />

      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTimer}
          disabled={timeLeft === 0}
          className="h-16 w-16 rounded-2xl border-2 shadow-sm active:scale-90 active:shadow-inner transition-all duration-150"
        >
          {isActive ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={resetTimer}
          disabled={timeLeft === duration && !isActive}
          className="h-16 w-16 rounded-2xl border-2 shadow-sm active:scale-90 active:shadow-inner transition-all duration-150"
        >
          <RotateCcw className="h-7 w-7" />
        </Button>
      </div>
    </div>
  )
}
