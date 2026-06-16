"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useWorkoutStore } from "@/lib/workout-store"
import { ArrowRight, Dumbbell, Zap, TrendingUp, Sparkles, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SelectWorkoutPage() {
  const router = useRouter()
  const { getCurrentWorkoutDay, getWorkoutSchedule } = useWorkoutStore()
  const [selectedExercise, setSelectedExercise] = useState<string>("")
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>("")
  const [suggestedWorkout, setSuggestedWorkout] = useState<any>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const suggested = getCurrentWorkoutDay()

    // Guard: never suggest a rest day; find the next active day if needed
    let activeSuggested = suggested
    if (suggested.exercise === "Descanso" || suggested.workoutType === "Descanso") {
      const schedule = getWorkoutSchedule()
      const lastDayIndex = schedule.findIndex(
        (day) => day.workoutType === suggested.workoutType && day.exercise === suggested.exercise,
      )
      for (let i = 1; i <= schedule.length; i++) {
        const idx = (lastDayIndex + i) % schedule.length
        const day = schedule[idx]
        if (day.exercise !== "Descanso" && day.workoutType !== "Descanso") {
          activeSuggested = day
          break
        }
      }
    }

    setSuggestedWorkout(activeSuggested)
    setSelectedExercise(activeSuggested.exercise)
    setSelectedWorkoutType(activeSuggested.workoutType)
  }, [getCurrentWorkoutDay, getWorkoutSchedule])

  const handleStartWorkout = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      useWorkoutStore.getState().setSelectedWorkout({
        exercise: selectedExercise,
        workoutType: selectedWorkoutType,
      })
      router.push("/workout")
    }, 150)
  }

  const workoutSchedule = getWorkoutSchedule()
  const exercises = Array.from(new Set(workoutSchedule.map((day) => day.exercise))).filter(
    (exercise) => exercise !== "Descanso",
  )
  const workoutTypes = Array.from(new Set(workoutSchedule.map((day) => day.workoutType))).filter(
    (type) => type !== "Descanso",
  )

  const workoutTypeConfig: Record<string, { icon: typeof Dumbbell; desc: string }> = {
    "Max Reps": { icon: Zap, desc: "3 series al máximo, 5 min descanso" },
    "Sub Max": { icon: TrendingUp, desc: "10 series al 50%, 1 min descanso" },
    "Volumen Escalera": { icon: Dumbbell, desc: "Escalera 1→N, 5 ciclos, 30s descanso" },
  }

  return (
    <div className="container px-4 py-6">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Seleccionar Entrenamiento</h1>
        <p className="text-muted-foreground text-base">Elige ejercicio y tipo de sesión</p>
      </div>

      {suggestedWorkout && (
        <div className="mb-8 rounded-2xl border-2 border-accent/40 bg-card p-5 shadow-md ring-1 ring-accent/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="text-xs font-extrabold text-accent uppercase tracking-widest">Sugerido para hoy</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-bold text-lg text-foreground">{suggestedWorkout.exercise}</p>
              <p className="text-sm text-muted-foreground">{suggestedWorkout.workoutType}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 bg-card border-border font-bold hover:bg-muted transition-all active:scale-95"
              onClick={() => {
                setSelectedExercise(suggestedWorkout.exercise)
                setSelectedWorkoutType(suggestedWorkout.workoutType)
              }}
            >
              Usar este
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-10">
        {/* Exercise Selection */}
        <div className="space-y-4">
          <h2 className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest">Ejercicio</h2>
          <div className="grid grid-cols-2 gap-3">
            {exercises.map((exercise) => {
              const isSelected = selectedExercise === exercise
              return (
                <button
                  key={exercise}
                  onClick={() => setSelectedExercise(exercise)}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-6 transition-all duration-200",
                    "active:scale-[0.96] active:shadow-inner",
                    isSelected
                      ? "border-accent bg-accent text-accent-foreground shadow-lg"
                      : "border-border bg-card text-foreground hover:border-accent/50 hover:shadow-md hover:bg-muted/50"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-accent-foreground shadow-sm">
                      <Check className="h-3.5 w-3.5 text-accent" strokeWidth={3} />
                    </div>
                  )}
                  <span className="text-lg font-extrabold">{exercise}</span>
                  {isSelected && (
                    <span className="text-xs font-bold opacity-90">Seleccionado</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Workout Type Selection */}
        <div className="space-y-4">
          <h2 className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest">Tipo de entrenamiento</h2>
          <div className="space-y-3">
            {workoutTypes.map((type) => {
              const config = workoutTypeConfig[type] || { icon: Dumbbell, desc: "" }
              const Icon = config.icon
              const isSelected = selectedWorkoutType === type

              return (
                <button
                  key={type}
                  onClick={() => setSelectedWorkoutType(type)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200",
                    "active:scale-[0.98] active:shadow-inner",
                    isSelected
                      ? "border-accent bg-accent text-accent-foreground shadow-lg"
                      : "border-border bg-card text-foreground hover:border-accent/50 hover:shadow-md hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                    isSelected ? "bg-accent-foreground/20" : "bg-muted"
                  )}>
                    <Icon className={cn("h-6 w-6", isSelected ? "text-accent-foreground" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-base">{type}</p>
                    <p className={cn("text-sm", isSelected ? "text-accent-foreground/80" : "text-muted-foreground")}>
                      {config.desc}
                    </p>
                  </div>
                  {isSelected ? (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-foreground shadow-sm">
                      <Check className="h-4 w-4 text-accent" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="h-7 w-7 shrink-0 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <Button
          size="lg"
          className={cn(
            "w-full h-14 text-base font-extrabold shadow-xl transition-all duration-200",
            "active:scale-95 active:shadow-lg",
            isTransitioning && "opacity-80 scale-95"
          )}
          onClick={handleStartWorkout}
          disabled={!selectedExercise || !selectedWorkoutType || isTransitioning}
        >
          {isTransitioning ? (
            <span className="animate-pulse">Preparando...</span>
          ) : (
            <>
              Comenzar Entrenamiento
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
