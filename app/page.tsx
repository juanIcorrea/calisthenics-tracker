import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import WorkoutSchedule from "@/components/workout-schedule"
import RecentWorkouts from "@/components/recent-workouts"
import Logo from "@/components/logo"

export default function Home() {
  return (
    <div className="container px-4 py-6 pb-24 md:py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Logo size={48} showText={false} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calisthenics Tracker</h1>
            <p className="text-muted-foreground">Seguimiento de rutina y progreso</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Entrenamiento de Hoy</CardTitle>
              <CardDescription>Tu entrenamiento programado</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkoutSchedule />
              <div className="mt-4">
                <Link href="/workout/select">
                  <Button size="xl" className="w-full">
                    Comenzar Entrenamiento
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Entrenamientos Recientes</CardTitle>
              <CardDescription>Tus últimos resultados</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentWorkouts />
              <div className="mt-4">
                <Link href="/history">
                  <Button variant="outline" size="xl" className="w-full">
                    Ver Historial Completo
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

