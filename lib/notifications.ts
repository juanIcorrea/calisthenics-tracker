"use client"

import { useWorkoutStore } from "@/lib/workout-store"

// Recordatorios: lunes, miércoles y viernes a las 16:00 (hora local)
const TRAINING_WEEKDAYS = [1, 3, 5]
const REMINDER_HOUR = 16
const MAX_AHEAD_MS = 8 * 24 * 60 * 60 * 1000

export function notificationsSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  )
}

export function getPermission(): NotificationPermission {
  return notificationsSupported() ? Notification.permission : "denied"
}

// Debe llamarse siempre desde un gesto del usuario (clic)
export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false
  try {
    return (await Notification.requestPermission()) === "granted"
  } catch {
    return false
  }
}

// Devuelve la fecha del próximo hueco de entrenamiento (L/X/V a las 16:00)
function getNextTrainingSlot(from: Date = new Date()): Date | null {
  for (let offset = 0; offset < 8; offset++) {
    const candidate = new Date(from)
    candidate.setDate(candidate.getDate() + offset)
    candidate.setHours(REMINDER_HOUR, 0, 0, 0)
    if (TRAINING_WEEKDAYS.includes(candidate.getDay()) && candidate.getTime() > from.getTime()) {
      return candidate
    }
  }
  return null
}

// Programa el recordatorio diario vía el service worker (solo con permiso concedido)
export async function armDailyReminder(): Promise<void> {
  try {
    if (!notificationsSupported()) return
    if (getPermission() !== "granted") return

    const slot = getNextTrainingSlot()
    if (!slot) return
    const triggerAt = slot.getTime()
    if (triggerAt <= Date.now() || triggerAt > Date.now() + MAX_AHEAD_MS) return

    // La rutina de hoy depende del progreso actual (historial persistido)
    const { dayName, workoutType, exercise } = useWorkoutStore.getState().getCurrentWorkoutDay()

    await navigator.serviceWorker.register("/sw.js")
    const registration = await navigator.serviceWorker.ready
    registration.active?.postMessage({
      type: "DAILY_REMINDER",
      workoutDayName: dayName,
      workoutType,
      exercise,
      triggerAt,
    })
  } catch {
    // Best-effort: si falla el permiso o el SW, no pasa nada
  }
}
