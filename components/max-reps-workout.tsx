"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import WorkoutTimer from "@/components/workout-timer"
import { Plus, Minus } from "lucide-react"

interface MaxRepsWorkoutProps {
  onComplete: (data: any) => void
}

const QUICK_REPS = [5, 10, 15, 20]

export default function MaxRepsWorkout({ onComplete }: MaxRepsWorkoutProps) {
  const [currentSet, setCurrentSet] = useState(1)
  const [reps, setReps] = useState<number[]>([0, 0, 0])
  const [showTimer, setShowTimer] = useState(false)
  const totalSets = 3
  const restTime = 300

  const handleRepChange = (value: number) => {
    const newReps = [...reps]
    newReps[currentSet - 1] = Math.max(0, value)
    setReps(newReps)
  }

  const handleNextSet = () => {
    if (currentSet < totalSets) {
      setShowTimer(true)
    } else {
      handleComplete()
    }
  }

  const handleTimerComplete = () => {
    setShowTimer(false)
    setCurrentSet(currentSet + 1)
  }

  const handleComplete = () => {
    onComplete({
      sets: totalSets,
      reps: reps,
      maxReps: Math.max(...reps),
      totalReps: reps.reduce((a, b) => a + b, 0),
    })
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
              Serie {currentSet} de {totalSets}
            </h3>
            <p className="text-muted-foreground">Máximo de repeticiones posible</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon-xl"
                      onClick={() => handleRepChange(reps[currentSet - 1] - 1)}
                      className="rounded-full"
                    >
                      <Minus className="h-6 w-6" />
                    </Button>
                    <span className="min-w-[80px] text-center text-6xl font-bold tabular-nums">
                      {reps[currentSet - 1]}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-xl"
                      onClick={() => handleRepChange(reps[currentSet - 1] + 1)}
                      className="rounded-full"
                    >
                      <Plus className="h-6 w-6" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Repeticiones</p>
                </div>

                <div className="space-y-2">
                  <p className="text-center text-xs font-medium text-muted-foreground">Selección rápida</p>
                  <div className="grid grid-cols-4 gap-2">
                    {QUICK_REPS.map((quickRep) => (
                      <Button
                        key={quickRep}
                        variant={reps[currentSet - 1] === quickRep ? "default" : "outline"}
                        size="lg"
                        onClick={() => handleRepChange(quickRep)}
                        className="text-lg font-semibold"
                      >
                        {quickRep}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button size="xl" className="w-full" onClick={handleNextSet}>
                  {currentSet < totalSets ? "Siguiente Serie" : "Completar Entrenamiento"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {currentSet > 1 && (
            <Card>
              <CardContent className="pt-4">
                <h4 className="mb-3 text-sm font-semibold">Series anteriores</h4>
                <div className="space-y-2">
                  {reps.slice(0, currentSet - 1).map((rep, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Serie {index + 1}</span>
                      <span className="font-semibold tabular-nums">{rep} reps</span>
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

