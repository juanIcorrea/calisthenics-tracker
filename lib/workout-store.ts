"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface WorkoutDay {
  dayName: string
  workoutType: string
  exercise: string
}

interface Workout {
  date: string
  exercise: string
  workoutType: string
  totalReps: number
  [key: string]: any
}

interface WorkoutStore {
  workouts: Workout[]
  lastWorkoutDate: string | null
  selectedWorkout: { exercise: string; workoutType: string } | null
  getCurrentWorkoutDay: () => WorkoutDay
  getLastMaxReps: () => number
  completeWorkout: (workout: Workout) => void
  getRecentWorkouts: (count: number) => Workout[]
  getAllWorkouts: () => Workout[]
  getWorkoutSchedule: () => WorkoutDay[]
  setSelectedWorkout: (workout: { exercise: string; workoutType: string }) => void
  exportWorkouts: () => string
  importWorkouts: (jsonString: string) => { success: boolean; message: string }
  clearWorkouts: () => void
}

// Define the workout schedule
const workoutSchedule: WorkoutDay[] = [
  { dayName: "Día 1", workoutType: "Max Reps", exercise: "Dominadas" },
  { dayName: "Día 2", workoutType: "Max Reps", exercise: "Fondos" },
  { dayName: "Día 3", workoutType: "Descanso", exercise: "Descanso" },
  { dayName: "Día 4", workoutType: "Sub Max", exercise: "Dominadas" },
  { dayName: "Día 5", workoutType: "Sub Max", exercise: "Fondos" },
  { dayName: "Día 6", workoutType: "Descanso", exercise: "Descanso" },
  { dayName: "Día 7", workoutType: "Descanso", exercise: "Descanso" },
  { dayName: "Día 8", workoutType: "Volumen Escalera", exercise: "Dominadas" },
  { dayName: "Día 9", workoutType: "Volumen Escalera", exercise: "Fondos" },
  { dayName: "Día 10", workoutType: "Descanso", exercise: "Descanso" },
  // The cycle repeats
]

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      workouts: [],
      lastWorkoutDate: null,
      selectedWorkout: null,

      getCurrentWorkoutDay: () => {
        const { lastWorkoutDate, workouts } = get()

        // If no workouts yet, start with day 1
        if (!lastWorkoutDate || workouts.length === 0) {
          return workoutSchedule[0]
        }

        // Find the index of the last workout day
        const lastWorkout = workouts[workouts.length - 1]
        const lastDayIndex = workoutSchedule.findIndex(
          (day) => day.workoutType === lastWorkout.workoutType && day.exercise === lastWorkout.exercise,
        )

        // If not found or was the last in the schedule, start from beginning
        if (lastDayIndex === -1 || lastDayIndex === workoutSchedule.length - 1) {
          return workoutSchedule[0]
        }

        // Return the next day in the schedule
        return workoutSchedule[lastDayIndex + 1]
      },

      getLastMaxReps: () => {
        const { workouts } = get()
        const currentDay = get().getCurrentWorkoutDay()

        // Find the last Max Reps workout for the current exercise
        const lastMaxRepsWorkout = [...workouts]
          .reverse()
          .find((w) => w.workoutType === "Max Reps" && w.exercise === currentDay.exercise)

        return lastMaxRepsWorkout?.maxReps || 0
      },

      completeWorkout: (workout) => {
        set((state) => ({
          workouts: [...state.workouts, workout],
          lastWorkoutDate: workout.date,
        }))
      },

      getRecentWorkouts: (count) => {
        const { workouts } = get()
        return [...workouts]
          .filter((w) => w.workoutType !== "Descanso")
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, count)
      },

      getAllWorkouts: () => {
        const { workouts } = get()
        return [...workouts]
          .filter((w) => w.workoutType !== "Descanso")
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      },

      getWorkoutSchedule: () => {
        return workoutSchedule
      },

      setSelectedWorkout: (workout) => {
        set({ selectedWorkout: workout })
      },

      exportWorkouts: () => {
        const { workouts } = get()
        const exportData = {
          version: "1.0",
          exportedAt: new Date().toISOString(),
          workouts: workouts,
        }
        return JSON.stringify(exportData, null, 2)
      },

      importWorkouts: (jsonString: string) => {
        try {
          const data = JSON.parse(jsonString)

          if (!data.workouts || !Array.isArray(data.workouts)) {
            return { success: false, message: "Formato de archivo inválido" }
          }

          const importedWorkouts = data.workouts.filter((w: any) =>
            w.date && w.exercise && w.workoutType && typeof w.totalReps === "number"
          )

          if (importedWorkouts.length === 0) {
            return { success: false, message: "No se encontraron entrenamientos válidos" }
          }

          const { workouts } = get()
          const existingDates = new Set(workouts.map(w => w.date))
          const newWorkouts = importedWorkouts.filter((w: Workout) => !existingDates.has(w.date))

          if (newWorkouts.length === 0) {
            return { success: false, message: "Todos los entrenamientos ya existen" }
          }

          set({
            workouts: [...workouts, ...newWorkouts],
            lastWorkoutDate: newWorkouts[newWorkouts.length - 1]?.date || null,
          })

          return {
            success: true,
            message: `${newWorkouts.length} entrenamiento${newWorkouts.length === 1 ? '' : 's'} importado${newWorkouts.length === 1 ? '' : 's'}`,
          }
        } catch {
          return { success: false, message: "Error al leer el archivo" }
        }
      },

      clearWorkouts: () => {
        set({ workouts: [], lastWorkoutDate: null })
      },
    }),
    {
      name: "calisthenics-workout-storage",
    },
  ),
)

