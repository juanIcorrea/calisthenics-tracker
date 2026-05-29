"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Timer, Play, Pause, RotateCcw } from "lucide-react"

interface WorkoutTimerProps {
  duration: number
  onComplete: () => void
  autoStart?: boolean
}

export default function WorkoutTimer({ duration, onComplete, autoStart = false }: WorkoutTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isActive, setIsActive] = useState(autoStart)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval as NodeJS.Timeout)
            setIsActive(false)
            onComplete()
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, onComplete])

  useEffect(() => {
    setProgress((timeLeft / duration) * 100)
  }, [timeLeft, duration])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(duration)
    setProgress(100)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-3">
        <Timer className="h-6 w-6 text-muted-foreground" />
        <span className="text-5xl font-bold tabular-nums">{formatTime(timeLeft)}</span>
      </div>

      <Progress value={progress} className="h-3" />

      <div className="flex justify-center gap-3">
        <Button
          variant="outline"
          size="icon-xl"
          onClick={toggleTimer}
          disabled={timeLeft === 0}
          className="rounded-full"
        >
          {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>
        <Button
          variant="outline"
          size="icon-xl"
          onClick={resetTimer}
          disabled={timeLeft === duration && !isActive}
          className="rounded-full"
        >
          <RotateCcw className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}

