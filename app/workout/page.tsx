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
import { Dumbbell, CheckCircle2, ArrowLeft } from "lucide-react"
import Link from "next/link"

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
    if (currentWorkout?.workoutType === "Descanso") {
      return
    }

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
    return (
      <div className="container flex h-[60vh] items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-6">
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Link href="/workout/select" className="text-muted-foreground hover:text-foreground transition-colors active:scale-90">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Entrenamiento</h1>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Dumbbell className="h-4 w-4" />
          <p className="text-sm font-semibold">
            {currentWorkout.exercise} · {currentWorkout.workoutType}
          </p>
        </div>
      </div>

      <Card className="shadow-md border-2 border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 ring-1 ring-accent/20">
              <Dumbbell className="h-4 w-4 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">{currentWorkout.workoutType}</CardTitle>
              <CardDescription>
                {currentWorkout.dayName} · {currentWorkout.exercise}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isCompleted ? (
            <div className="space-y-6 py-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 ring-2 ring-accent/20">
                <CheckCircle2 className="h-10 w-10 text-accent" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-foreground">¡Completado!</h3>
                <p className="text-muted-foreground">Gran trabajo. Tu progreso fue guardado.</p>
              </div>
              <Button size="lg" onClick={handleFinish} className="w-full h-14 text-base font-extrabold shadow-xl bg-accent text-accent-foreground hover:bg-accent/90 active:scale-95 transition-all duration-150">
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
