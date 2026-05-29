"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import WorkoutTimer from "@/components/workout-timer"
import { useWorkoutStore } from "@/lib/workout-store"
import { Check } from "lucide-react"

interface VolumeWorkoutProps {
  onComplete: (data: any) => void
}

export default function VolumeWorkout({ onComplete }: VolumeWorkoutProps) {
  const { getLastMaxReps } = useWorkoutStore()
  const [maxReps, setMaxReps] = useState(10)
  const [currentCycle, setCurrentCycle] = useState(1)
  const [currentRep, setCurrentRep] = useState(1)
  const [showTimer, setShowTimer] = useState(false)
  const [completedReps, setCompletedReps] = useState<number[][]>([])
  const totalCycles = 5
  const restTime = 30

  useEffect(() => {
    const lastMax = getLastMaxReps()
    setMaxReps(lastMax > 0 ? lastMax : 10)
    setCompletedReps(Array(totalCycles).fill([]))
  }, [getLastMaxReps])

  const handleCompleteRep = () => {
    const newCompletedReps = [...completedReps]
    if (!newCompletedReps[currentCycle - 1]) {
      newCompletedReps[currentCycle - 1] = []
    }
    newCompletedReps[currentCycle - 1] = [...newCompletedReps[currentCycle - 1], currentRep]
    setCompletedReps(newCompletedReps)

    if (currentRep < maxReps) {
      setCurrentRep(currentRep + 1)
      setShowTimer(true)
    } else {
      if (currentCycle < totalCycles) {
        setCurrentRep(1)
        setCurrentCycle(currentCycle + 1)
        setShowTimer(true)
      } else {
        handleComplete()
      }
    }
  }

  const handleTimerComplete = () => {
    setShowTimer(false)
  }

  const handleComplete = () => {
    const totalReps = completedReps.flat().reduce((a, b) => a + b, 0)

    onComplete({
      cycles: totalCycles,
      maxReps: maxReps,
      completedReps: completedReps,
      totalReps: totalReps,
    })
  }

  const calculateProgress = () => {
    const totalRepsInWorkout = totalCycles * ((maxReps * (maxReps + 1)) / 2)
    const completedRepsCount = completedReps.flat().reduce((a, b) => a + b, 0)
    return (completedRepsCount / totalRepsInWorkout) * 100
  }

  return (
    <div className="space-y-6">
      {showTimer ? (
        <div className="space-y-4">
          <h3 className="text-center text-xl font-semibold">Descanso</h3>
          <WorkoutTimer duration={restTime} onComplete={handleTimerComplete} autoStart={true} />
        </div>
      ) : (
        <>
          <div className="text-center">
            <h3 className="text-xl font-semibold">
              Ciclo {currentCycle} de {totalCycles}
            </h3>
            <p className="text-muted-foreground">
              Repeticiones: {currentRep} de {maxReps}
            </p>
          </div>

          <Progress value={calculateProgress()} className="h-2" />

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <span className="text-7xl font-bold tabular-nums">{currentRep}</span>
                  <p className="text-sm text-muted-foreground">Repeticiones a realizar</p>
                </div>

                <Button size="xl" className="w-full" onClick={handleCompleteRep}>
                  <Check className="mr-2 h-5 w-5" />
                  Completar {currentRep} {currentRep === 1 ? "rep" : "reps"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <h4 className="mb-3 text-sm font-semibold">Progreso del ciclo</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: maxReps }, (_, i) => i + 1).map((rep) => {
                  const isCompleted = completedReps[currentCycle - 1]?.includes(rep)
                  const isCurrent = rep === currentRep

                  return (
                    <div
                      key={rep}
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                        isCompleted
                          ? "bg-primary text-primary-foreground"
                          : isCurrent
                            ? "border-2 border-primary bg-background"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {rep}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {currentCycle > 1 && (
            <Card>
              <CardContent className="pt-4">
                <h4 className="mb-3 text-sm font-semibold">Ciclos completados</h4>
                <div className="space-y-2">
                  {completedReps.slice(0, currentCycle - 1).map((cycle, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Ciclo {index + 1}</span>
                      <span className="font-semibold tabular-nums">
                        {cycle.reduce((a, b) => a + b, 0)} reps
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

