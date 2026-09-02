"use client"

import { useEffect } from "react"
import { armDailyReminder } from "@/lib/notifications"
import { useWorkoutStore } from "@/lib/workout-store"

export default function DailyReminder() {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator)) return

    let cancelled = false

    const scheduleReminder = async () => {
      if (cancelled) return
      await armDailyReminder()
    }

    // Esperar a que el store se rehidrate desde localStorage para leer el día correcto
    let unsubscribe: (() => void) | undefined
    if (useWorkoutStore.persist.hasHydrated()) {
      scheduleReminder()
    } else {
      unsubscribe = useWorkoutStore.persist.onFinishHydration(() => {
        scheduleReminder()
      })
    }

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])

  return null
}
