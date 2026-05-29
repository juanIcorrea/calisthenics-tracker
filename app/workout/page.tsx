"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useWorkoutStore } from "@/lib/workout-store"
import MaxRepsWorkout from "@/components/max-reps-workout"
import SubMaxWorkout from "@/components/sub-max-workout"
import VolumeWorkout from "@/components/volume-workout"

export default function WorkoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { getCurrentWorkoutDay, completeWorkout } = useWorkoutStore()
  const [currentWorkout, setCurrentWorkout] = useState<any>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    const { selectedWorkout } = useWorkoutStore.getState()

    if (selectedWorkout) {
      const matchingDay = useWorkoutStore
        .getState()
        .getWorkoutSchedule()
        .find((day) => day.exercise === selectedWorkout.exercise && day.workoutType === selectedWorkout.workoutType)

      if (matchingDay) {
        setCurrentWorkout(matchingDay)
      } else {
        setCurrentWorkout(getCurrentWorkoutDay())
      }
    } else {
      setCurrentWorkout(getCurrentWorkoutDay())
    }
  }, [getCurrentWorkoutDay])

  const handleComplete = (workoutData: any) => {
    completeWorkout({
      ...workoutData,
      date: new Date().toISOString(),
      exercise: currentWorkout.exercise,
      workoutType: currentWorkout.workoutType,
    })

    setIsCompleted(true)
    toast({
      title: "¡Entrenamiento completado!",
      description: "Tu progreso ha sido guardado",
    })
  }

  const handleFinish = () => {
    useWorkoutStore.getState().setSelectedWorkout({ exercise: "", workoutType: "" })
    router.push("/")
  }

  if (!currentWorkout) {
    return <div className="container p-4">Cargando...</div>
  }

  return (
    <div className="container px-4 py-6 pb-24">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Entrenamiento</h1>
        <p className="text-muted-foreground">
          {currentWorkout.exercise} - {currentWorkout.workoutType}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{currentWorkout.workoutType}</CardTitle>
          <CardDescription>
            {currentWorkout.dayName} - {currentWorkout.exercise}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCompleted ? (
            <div className="space-y-6 text-center">
              <h3 className="text-2xl font-bold">¡Completado!</h3>
              <Button size="xl" onClick={handleFinish} className="w-full">
                Volver al Inicio
              </Button>
            </div>
          ) : (
            <>
              {currentWorkout.workoutType === "Max Reps" && <MaxRepsWorkout onComplete={handleComplete} />}
              {currentWorkout.workoutType === "Sub Max" && <SubMaxWorkout onComplete={handleComplete} />}
              {currentWorkout.workoutType === "Volumen Escalera" && <VolumeWorkout onComplete={handleComplete} />}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

