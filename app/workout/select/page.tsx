"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWorkoutStore } from "@/lib/workout-store"
import { ArrowRight, Dumbbell, Zap, TrendingUp } from "lucide-react"

export default function SelectWorkoutPage() {
  const router = useRouter()
  const { getCurrentWorkoutDay, getWorkoutSchedule } = useWorkoutStore()
  const [selectedExercise, setSelectedExercise] = useState<string>("")
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>("")
  const [suggestedWorkout, setSuggestedWorkout] = useState<any>(null)

  useEffect(() => {
    const suggested = getCurrentWorkoutDay()
    setSuggestedWorkout(suggested)
    setSelectedExercise(suggested.exercise)
    setSelectedWorkoutType(suggested.workoutType)
  }, [getCurrentWorkoutDay])

  const handleStartWorkout = () => {
    useWorkoutStore.getState().setSelectedWorkout({
      exercise: selectedExercise,
      workoutType: selectedWorkoutType,
    })
    router.push("/workout")
  }

  const workoutSchedule = getWorkoutSchedule()
  const exercises = Array.from(new Set(workoutSchedule.map((day) => day.exercise))).filter(
    (exercise) => exercise !== "Descanso",
  )
  const workoutTypes = Array.from(new Set(workoutSchedule.map((day) => day.workoutType))).filter(
    (type) => type !== "Descanso",
  )

  const workoutTypeIcons: Record<string, typeof Dumbbell> = {
    "Max Reps": Zap,
    "Sub Max": TrendingUp,
    "Volumen Escalera": Dumbbell,
  }

  const workoutTypeDescriptions: Record<string, string> = {
    "Max Reps": "3 series al máximo, 5 min descanso",
    "Sub Max": "10 series al 50%, 1 min descanso",
    "Volumen Escalera": "Escalera 1-N, 5 ciclos, 30s descanso",
  }

  return (
    <div className="container px-4 py-6">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Seleccionar Entrenamiento</h1>
        <p className="text-muted-foreground">Elige ejercicio y tipo</p>
      </div>

      {suggestedWorkout && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Entrenamiento sugerido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{suggestedWorkout.exercise}</p>
                <p className="text-sm text-muted-foreground">{suggestedWorkout.workoutType}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedExercise(suggestedWorkout.exercise)
                  setSelectedWorkoutType(suggestedWorkout.workoutType)
                }}
              >
                Usar este
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Ejercicio</h2>
          <div className="grid grid-cols-2 gap-3">
            {exercises.map((exercise) => (
              <Button
                key={exercise}
                variant={selectedExercise === exercise ? "default" : "outline"}
                size="xl"
                onClick={() => setSelectedExercise(exercise)}
                className="text-base"
              >
                {exercise}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Tipo de entrenamiento</h2>
          <div className="space-y-3">
            {workoutTypes.map((type) => {
              const Icon = workoutTypeIcons[type] || Dumbbell
              return (
                <Button
                  key={type}
                  variant={selectedWorkoutType === type ? "default" : "outline"}
                  size="xl"
                  onClick={() => setSelectedWorkoutType(type)}
                  className="w-full justify-start"
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <p className="text-base font-semibold">{type}</p>
                    <p className="text-xs font-normal opacity-80">{workoutTypeDescriptions[type]}</p>
                  </div>
                </Button>
              )
            })}
          </div>
        </div>

        <Button
          size="xl"
          className="w-full"
          onClick={handleStartWorkout}
          disabled={!selectedExercise || !selectedWorkoutType}
        >
          Comenzar Entrenamiento
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

