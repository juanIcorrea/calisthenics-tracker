"use client"

import { useEffect, useState } from "react"
import { useWorkoutStore } from "@/lib/workout-store"
import { formatDate } from "@/lib/utils"

export default function RecentWorkouts() {
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([])
  const { getRecentWorkouts } = useWorkoutStore()

  useEffect(() => {
    setRecentWorkouts(getRecentWorkouts(3))
  }, [])

  if (recentWorkouts.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-center text-muted-foreground">
        <p>Sin entrenamientos registrados</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {recentWorkouts.map((workout, index) => (
        <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
          <div>
            <p className="font-semibold">
              {workout.exercise}
            </p>
            <p className="text-sm text-muted-foreground">{workout.workoutType}</p>
            <p className="text-xs text-muted-foreground">{formatDate(workout.date)}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold tabular-nums">{workout.totalReps}</p>
            <p className="text-xs text-muted-foreground">reps</p>
            <p className="text-xs text-muted-foreground">
              {workout.workoutType === "Max Reps" && `Max: ${workout.maxReps}`}
              {workout.workoutType === "Sub Max" && `${workout.sets} series`}
              {workout.workoutType === "Volumen Escalera" && `${workout.cycles} ciclos`}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

