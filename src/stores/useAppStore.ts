import { create } from 'zustand'

type AppState = {
  temperature: number
  setTemperature: (temperature: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  temperature: 6500,
  setTemperature: (temperature) => set({ temperature }),
}))
