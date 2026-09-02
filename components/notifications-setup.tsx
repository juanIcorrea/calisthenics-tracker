"use client"

import { useEffect, useState } from "react"
import { Bell, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { armDailyReminder, getPermission, requestNotificationPermission } from "@/lib/notifications"
import { cn } from "@/lib/utils"

const DISMISS_KEY = "calis-notif-dismissed"

export default function NotificationsSetup() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    setPermission(getPermission())
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") setDismissed(true)
    } catch {
      // localStorage no disponible: no persistir el descarte
    }
  }, [])

  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, "1")
    } catch {
      // Best-effort
    }
  }

  const handleEnable = async () => {
    if (pending) return
    setPending(true)
    const granted = await requestNotificationPermission()
    setPending(false)
    if (granted) {
      setPermission("granted")
      setSuccess(true)
      await armDailyReminder()
      setTimeout(() => setSuccess(false), 2500)
    } else {
      setPermission(getPermission())
    }
  }

  // Sin permiso real concedido o aún sin montar (hidratación segura): nada que mostrar
  if (permission === null || permission === "granted") return null
  if (dismissed) return null

  // Confirmación efímera tras activar
  if (success) {
    return (
      <div
        className={cn(
          "fixed inset-x-4 z-40 mx-auto max-w-md",
          "bottom-[calc(4rem+env(safe-area-inset-bottom)+0.75rem)]"
        )}
      >
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-300 rounded-xl border border-border bg-accent px-4 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Check className="size-5" />
            </span>
            <p className="text-sm font-medium text-foreground">
              Notificaciones activadas
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "fixed inset-x-4 z-40 mx-auto max-w-md",
        "bottom-[calc(4rem+env(safe-area-inset-bottom)+0.75rem)]"
      )}
      role="status"
    >
      <div
        className={cn(
          "animate-in slide-in-from-bottom-4 fade-in duration-300",
          "rounded-xl border border-border bg-accent px-4 py-3 shadow-lg"
        )}
      >
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-foreground/15 text-accent-foreground">
            <Bell className="size-5" />
          </span>
          <div className="min-w-0 flex-1 space-y-2.5">
            {permission === "denied" ? (
              <p className="text-sm text-accent-foreground/90">
                Notificaciones bloqueadas — actívalas desde la configuración del navegador.
              </p>
            ) : (
              <>
                <p className="text-sm text-accent-foreground/90">
                  Actívalas para recibir el aviso de descanso y el recordatorio de entrenamiento.
                </p>
                <Button
                  onClick={handleEnable}
                  disabled={pending}
                  className="h-11 min-w-44 px-5 text-sm"
                >
                  <Bell className="size-4" />
                  {pending ? "Solicitando…" : "Activar notificaciones"}
                </Button>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Descartar"
            className="-mr-1 -mt-1 flex size-11 shrink-0 items-center justify-center rounded-full text-accent-foreground/80 transition-colors hover:bg-accent-foreground/10 hover:text-accent-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
