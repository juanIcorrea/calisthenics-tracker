"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useWorkoutStore } from "@/lib/workout-store"
import Link from "next/link"
import { Edit2 } from "lucide-react"

export default function WorkoutSchedule() {
  const [currentDay, setCurrentDay] = useState("")
  const [workoutType, setWorkoutType] = useState("")
  const [exercise, setExercise] = useState("")
  const { getCurrentWorkoutDay } = useWorkoutStore()

  useEffect(() => {
    const { dayName, workoutType, exercise } = getCurrentWorkoutDay()
    setCurrentDay(dayName)
    setWorkoutType(workoutType)
    setExercise(exercise)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Día</p>
          <p className="text-xl font-bold">{currentDay}</p>
        </div>
        <Badge variant={exercise === "Dominadas" ? "default" : "secondary"} className="text-sm px-3 py-1">
          {exercise}
        </Badge>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Tipo de entrenamiento</p>
        <p className="text-lg font-semibold">{workoutType}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Descripción</p>
        <p className="text-sm">
          {workoutType === "Max Reps" && "3 series al máximo con 5 minutos de descanso"}
          {workoutType === "Sub Max" && "10 series al 50% del máximo con 1 minuto de descanso"}
          {workoutType === "Volumen Escalera" &&
            "Empezar con 1 rep e ir aumentando hasta el máximo. Repetir 5 veces con 30 segundos de descanso"}
        </p>
      </div>
      <Link href="/workout/select">
        <Button variant="outline" size="lg" className="w-full">
          <Edit2 className="mr-2 h-4 w-4" />
          Cambiar Entrenamiento
        </Button>
      </Link>
    </div>
  )
}

