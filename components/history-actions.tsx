"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Download, Upload } from "lucide-react"
import { useWorkoutStore } from "@/lib/workout-store"

export default function HistoryActions() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { exportWorkouts, importWorkouts } = useWorkoutStore()

  const handleExport = () => {
    const data = exportWorkouts()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `calisthenics-history-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const result = importWorkouts(content)
      alert(result.message)
    }
    reader.readAsText(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="mr-2 h-4 w-4" />
        Exportar
      </Button>
      <Button variant="outline" size="sm" onClick={handleImport}>
        <Upload className="mr-2 h-4 w-4" />
        Importar
      </Button>
    </div>
  )
}
