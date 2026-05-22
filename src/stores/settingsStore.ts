import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ShutterStep = '1/3' | '1/2' | '1'

type SettingsState = {
  ndDisplayMode: string
  shutterStep: ShutterStep
  showNdStops: boolean
  selectorReducedMotion: boolean
  setNdDisplayMode: (mode: string) => void
  setShutterStep: (step: ShutterStep) => void
  setShowNdStops: (show: boolean) => void
  setSelectorReducedMotion: (reduced: boolean) => void
}

export const useSettingsStore = create(
  persist<SettingsState>(
    (set) => ({
      ndDisplayMode: 'label',
      shutterStep: '1/3',
      showNdStops: true,
      selectorReducedMotion: false,
      setNdDisplayMode: (mode: string) => set({ ndDisplayMode: mode }),
      setShutterStep: (step: ShutterStep) => set({ shutterStep: step }),
      setShowNdStops: (show: boolean) => set({ showNdStops: show }),
      setSelectorReducedMotion: (reduced: boolean) => set({ selectorReducedMotion: reduced }),
    }),
    {
      name: 'exposure_settings',
    }
  )
)

export default useSettingsStore
