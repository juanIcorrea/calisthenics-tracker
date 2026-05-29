"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWorkoutStore } from "@/lib/workout-store"
import { formatDate } from "@/lib/utils"
import { BarChart, Calendar } from "lucide-react"
import HistoryActions from "@/components/history-actions"

export default function HistoryPage() {
  const [workouts, setWorkouts] = useState<any[]>([])
  const { getAllWorkouts } = useWorkoutStore()

  useEffect(() => {
    setWorkouts(getAllWorkouts())
  }, [getAllWorkouts])

  const groupByDate = (workouts: any[]) => {
    const grouped: Record<string, any[]> = {}

    workouts.forEach((workout) => {
      const date = formatDate(workout.date)
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(workout)
    })

    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
      .map(([date, workouts]) => ({ date, workouts }))
  }

  const groupByExercise = (workouts: any[]) => {
    const pullUps = workouts.filter((w) => w.exercise === "Dominadas")
    const dips = workouts.filter((w) => w.exercise === "Fondos")

    return [
      { name: "Dominadas", workouts: pullUps },
      { name: "Fondos", workouts: dips },
    ]
  }

  const dateGroups = groupByDate(workouts)
  const exerciseGroups = groupByExercise(workouts)

  if (workouts.length === 0) {
    return (
      <div className="container flex h-[70vh] items-center justify-center px-4 py-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Sin entrenamientos</h2>
          <p className="text-muted-foreground">Completa tu primer entrenamiento para ver tu historial</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-6 pb-24">
      <div className="mb-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Historial</h1>
            <p className="text-muted-foreground">Tu progreso y entrenamientos anteriores</p>
          </div>
          <HistoryActions />
        </div>
      </div>

      <Tabs defaultValue="by-date">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="by-date" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Por Fecha
          </TabsTrigger>
          <TabsTrigger value="by-exercise" className="flex items-center">
            <BarChart className="mr-2 h-4 w-4" />
            Por Ejercicio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="by-date" className="mt-4 space-y-6">
          {dateGroups.map((group, index) => (
            <div key={index} className="space-y-3">
              <h3 className="font-semibold">{group.date}</h3>
              {group.workouts.map((workout, wIndex) => (
                <Card key={wIndex}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{workout.exercise}</CardTitle>
                    <CardDescription>{workout.workoutType}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total de repeticiones</span>
                        <span className="font-bold tabular-nums">{workout.totalReps}</span>
                      </div>

                      {workout.workoutType === "Max Reps" && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Repetición máxima</span>
                          <span className="font-bold tabular-nums">{workout.maxReps}</span>
                        </div>
                      )}

                      {workout.workoutType === "Sub Max" && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Objetivo por serie</span>
                          <span className="font-bold tabular-nums">{workout.targetReps}</span>
                        </div>
                      )}

                      {workout.workoutType === "Volumen Escalera" && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ciclos completados</span>
                          <span className="font-bold tabular-nums">{workout.cycles}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="by-exercise" className="mt-4 space-y-6">
          {exerciseGroups.map((group, index) => (
            <div key={index} className="space-y-3">
              <h3 className="font-semibold">{group.name}</h3>
              {group.workouts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin entrenamientos registrados</p>
              ) : (
                group.workouts.map((workout, wIndex) => (
                  <Card key={wIndex}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{workout.workoutType}</CardTitle>
                      <CardDescription>{formatDate(workout.date)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total de repeticiones</span>
                          <span className="font-bold tabular-nums">{workout.totalReps}</span>
                        </div>

                        {workout.workoutType === "Max Reps" && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Repetición máxima</span>
                            <span className="font-bold tabular-nums">{workout.maxReps}</span>
                          </div>
                        )}

                        {workout.workoutType === "Sub Max" && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Objetivo por serie</span>
                            <span className="font-bold tabular-nums">{workout.targetReps}</span>
                          </div>
                        )}

                        {workout.workoutType === "Volumen Escalera" && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Ciclos completados</span>
                            <span className="font-bold tabular-nums">{workout.cycles}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

