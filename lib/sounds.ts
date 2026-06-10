let audioContext: AudioContext | null = null
let stopAlarm: (() => void) | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (audioContext) return audioContext
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    audioContext = new Ctor()
    return audioContext
  } catch {
    return null
  }
}

export function playAlarm(): () => void {
  const ctx = getAudioContext()
  if (!ctx) return () => {}

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {})
  }

  stopAlarm?.()

  let stopped = false
  const pulseDuration = 0.2
  const totalDuration = 3
  const frequency = 800
  const totalPulses = Math.floor(totalDuration / (pulseDuration * 2))

  const oscillators: OscillatorNode[] = []
  const gains: GainNode[] = []

  const startTime = ctx.currentTime

  for (let i = 0; i < totalPulses; i++) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = "square"
    osc.frequency.setValueAtTime(frequency, startTime + i * pulseDuration * 2)

    const onTime = startTime + i * pulseDuration * 2
    const offTime = onTime + pulseDuration

    gain.gain.setValueAtTime(0, onTime)
    gain.gain.linearRampToValueAtTime(0.3, onTime + 0.01)
    gain.gain.setValueAtTime(0.3, offTime - 0.01)
    gain.gain.linearRampToValueAtTime(0, offTime)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(onTime)
    osc.stop(offTime + 0.05)

    oscillators.push(osc)
    gains.push(gain)
  }

  const stop = () => {
    if (stopped) return
    stopped = true
    const now = ctx.currentTime
    oscillators.forEach((osc) => {
      try {
        osc.stop(now)
      } catch {}
    })
    gains.forEach((gain) => {
      try {
        gain.gain.cancelScheduledValues(now)
        gain.gain.setValueAtTime(gain.gain.value, now)
        gain.gain.linearRampToValueAtTime(0, now + 0.02)
      } catch {}
    })
    if (stopAlarm === stop) {
      stopAlarm = null
    }
  }

  stopAlarm = stop

  return stop
}

export function stopAlarmSound() {
  stopAlarm?.()
}
