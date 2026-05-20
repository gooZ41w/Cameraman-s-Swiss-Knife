import React, { useState } from 'react'
import { computeExposurePlan } from '../../domain/exposure'
import { formatShutterDisplay, formatShutterRangeDisplay } from '../formatters/exposureFormat'
import { useExposureStore } from '../../stores/exposureStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { ND_PRESETS } from '../../domain/exposure'
import { useHoldAccelerator } from '../../utils/useHoldAccelerator'
import { useDragSnap } from '../../utils/useDragSnap'

// presentation formatting helpers in ../formatters/exposureFormat

export function ExposureScreen() {
  const aperture = useExposureStore((state) => state.aperture)
  const shutterSeconds = useExposureStore((state) => state.shutterSeconds)
  const iso = useExposureStore((state) => state.iso)
  const compensationEv = useExposureStore((state) => state.compensationEv)
  const ndPreset = useExposureStore((state) => state.ndPreset)
  const customNdFactor = useExposureStore((state) => state.customNdFactor)

  const setAperture = useExposureStore((state) => state.setAperture)
  const setShutterSeconds = useExposureStore((state) => state.setShutterSeconds)
  const setIso = useExposureStore((state) => state.setIso)
  const setCompensationEv = useExposureStore((state) => state.setCompensationEv)
  const setNdPreset = useExposureStore((state) => state.setNdPreset)
  const setCustomNdFactor = useExposureStore((state) => state.setCustomNdFactor)

  const solveFor = 'shutter' as const

  const plan = computeExposurePlan({
    aperture,
    shutterSeconds,
    iso,
    compensationEv,
    ndPreset,
    solveFor,
    customNdFactor,
  })

  const solvedValue = plan.solvedShutterSeconds
  const bulbDisplaySeconds = Math.round(plan.ndAdjustedShutterSeconds)
  const ndDisplayMode = useSettingsStore((s) => s.ndDisplayMode)
  const showNdStops = useSettingsStore((s) => s.showNdStops)
  const ndSelectedStopsLabel = `${Math.round(plan.ndStops)} stop${Math.round(plan.ndStops) === 1 ? '' : 's'}`

  const solvedLabel = '快门'
  const solvedDisplay = formatShutterRangeDisplay(solvedValue, 5, 25)
  // option lists

  const shutterOptions: Array<{ label: string; value: number }> = [
    { label: '30s', value: 30 },
    { label: '25s', value: 25 },
    { label: '20s', value: 20 },
    { label: '15s', value: 15 },
    { label: '13s', value: 13 },
    { label: '10s', value: 10 },
    { label: '8s', value: 8 },
    { label: '6s', value: 6 },
    { label: '5s', value: 5 },
    { label: '4s', value: 4 },
    { label: '3.2s', value: 3.2 },
    { label: '2.5s', value: 2.5 },
    { label: '2s', value: 2 },
    { label: '1.6s', value: 1.6 },
    { label: '1.3s', value: 1.3 },
    { label: '1s', value: 1 },
    { label: '0.8s', value: 0.8 },
    { label: '0.6s', value: 0.6 },
    { label: '0.5s', value: 0.5 },
    { label: '0.4s', value: 0.4 },
    { label: '0.3s', value: 0.3 },
    { label: '1/4s', value: 0.25 },
    { label: '1/5s', value: 0.2 },
    { label: '1/6s', value: 1 / 6 },
    { label: '1/8s', value: 1 / 8 },
    { label: '1/10s', value: 1 / 10 },
    { label: '1/13s', value: 1 / 13 },
    { label: '1/15s', value: 1 / 15 },
    { label: '1/20s', value: 1 / 20 },
    { label: '1/25s', value: 1 / 25 },
    { label: '1/30s', value: 1 / 30 },
    { label: '1/40s', value: 1 / 40 },
    { label: '1/50s', value: 1 / 50 },
    { label: '1/60s', value: 1 / 60 },
    { label: '1/80s', value: 1 / 80 },
    { label: '1/100s', value: 1 / 100 },
    { label: '1/125s', value: 1 / 125 },
    { label: '1/160s', value: 1 / 160 },
    { label: '1/200s', value: 1 / 200 },
    { label: '1/250s', value: 1 / 250 },
    { label: '1/320s', value: 1 / 320 },
    { label: '1/400s', value: 1 / 400 },
    { label: '1/500s', value: 1 / 500 },
    { label: '1/640s', value: 1 / 640 },
    { label: '1/800s', value: 1 / 800 },
    { label: '1/1000s', value: 1 / 1000 },
    { label: '1/1250s', value: 1 / 1250 },
    { label: '1/1600s', value: 1 / 1600 },
    { label: '1/2000s', value: 1 / 2000 },
    { label: '1/2500s', value: 1 / 2500 },
    { label: '1/3200s', value: 1 / 3200 },
    { label: '1/4000s', value: 1 / 4000 },
    { label: '1/5000s', value: 1 / 5000 },
    { label: '1/6400s', value: 1 / 6400 },
    { label: '1/8000s', value: 1 / 8000 },
  ]
  const shutterLabelMap = new Map(shutterOptions.map((option) => [option.value.toFixed(6), option.label]))

  const compensationOptions = [
    -3.0, -2.7, -2.3, -2.0, -1.7, -1.3, -1.0, -0.7, -0.3, 0.0, 0.3, 0.7, 1.0, 1.3, 1.7, 2.0, 2.3, 2.7, 3.0,
  ]

  const ndKeys = Object.keys(ND_PRESETS)
  const [shutterOpen, setShutterOpen] = useState(false)
  const [compOpen, setCompOpen] = useState(false)

  // helper to format nd-adjusted shutter: if >60s show hh:mm:ss
  function formatMaybeHMS(sec: number) {
    if (!isFinite(sec) || sec <= 0) return formatShutterDisplay(sec)
    if (sec > 60) {
      const s = Math.round(sec)
      const hours = Math.floor(s / 3600)
      const minutes = Math.floor((s % 3600) / 60)
      const seconds = s % 60
      const hh = String(hours).padStart(2, '0')
      const mm = String(minutes).padStart(2, '0')
      const ss = String(seconds).padStart(2, '0')
      return `${hh}:${mm}:${ss}`
    }
    return formatShutterDisplay(sec)
  }

  // nd switch helpers
  const currentNdIndex = ndKeys.indexOf(ndPreset)
  const ndPrev = () => {
    const i = currentNdIndex <= 0 ? ndKeys.length - 1 : currentNdIndex - 1
    setNdPreset(ndKeys[i])
  }
  const ndNext = () => {
    const i = currentNdIndex >= ndKeys.length - 1 ? 0 : currentNdIndex + 1
    setNdPreset(ndKeys[i])
  }

  const ndHoldPrev = useHoldAccelerator(ndPrev)
  const ndHoldNext = useHoldAccelerator(ndNext)
  const ndDrag = useDragSnap(ndPrev, ndNext)

  // base shutter switch helpers
  const findShutterIndex = () => shutterOptions.findIndex((o) => Math.abs(o.value - shutterSeconds) < 0.0001)
  const currentShutterLabel = shutterLabelMap.get(shutterSeconds.toFixed(6)) ?? formatShutterDisplay(shutterSeconds)
  const shutterPrev = () => {
    const idx = findShutterIndex()
    const i = idx <= 0 ? shutterOptions.length - 1 : idx - 1
    setShutterSeconds(shutterOptions[i].value)
  }
  const shutterNext = () => {
    const idx = findShutterIndex()
    const i = idx >= shutterOptions.length - 1 ? 0 : idx + 1
    setShutterSeconds(shutterOptions[i].value)
  }

  const shutterHoldPrev = useHoldAccelerator(shutterPrev)
  const shutterHoldNext = useHoldAccelerator(shutterNext)
  const shutterDrag = useDragSnap(shutterPrev, shutterNext)

  // compensation switch helpers
  const findCompIndex = () => compensationOptions.findIndex((v) => Math.abs(v - compensationEv) < 0.001)
  const compPrev = () => {
    const idx = findCompIndex()
    const i = idx <= 0 ? compensationOptions.length - 1 : idx - 1
    setCompensationEv(compensationOptions[i])
  }
  const compNext = () => {
    const idx = findCompIndex()
    const i = idx >= compensationOptions.length - 1 ? 0 : idx + 1
    setCompensationEv(compensationOptions[i])
  }

  const compHoldPrev = useHoldAccelerator(compPrev)
  const compHoldNext = useHoldAccelerator(compNext)
  const compDrag = useDragSnap(compPrev, compNext)

  return (
    <section className="container" data-testid="exposure-page">
      {/* 顶部标题栏 + 设置按钮 */}
      <div className="header-row">
        <h1 className="h1">曝光计算器</h1>
      </div>

      {/* 参数区：ND 选择在顶部以符合线框 */}
      <div className="grid-1">
        <div className="label-block">
          滤镜档位
          <div className="switch-inline switch-inline-stack"
            onPointerDown={ndDrag.onPointerDown}
            onPointerMove={ndDrag.onPointerMove}
            onPointerUp={ndDrag.onPointerUp}
          >
            <div className="swipe-fade swipe-fade-left" aria-hidden />
            <button data-testid="nd-switch-prev" className="btn" onClick={ndPrev} aria-label="prev" onMouseDown={() => ndHoldPrev.start()} onMouseUp={() => ndHoldPrev.stop()} onMouseLeave={() => ndHoldPrev.stop()} onTouchStart={() => ndHoldPrev.start()} onTouchEnd={() => ndHoldPrev.stop()}>◀</button>
            <div className="selector-swipe-hint left" aria-hidden>◀</div>
            <div data-testid="nd-switch-value" className="switch-value switch-value-stack">
              <span className="switch-main-value">{ND_PRESETS[ndPreset]?.label ?? ndPreset}</span>
              {showNdStops && ndPreset !== 'custom' && (
                <span data-testid="nd-selected-stops" className="switch-subvalue">{ndSelectedStopsLabel}</span>
              )}
            </div>
            <div className="selector-swipe-hint right" aria-hidden>▶</div>
            <button data-testid="nd-switch-next" className="btn" onClick={ndNext} aria-label="next" onMouseDown={() => ndHoldNext.start()} onMouseUp={() => ndHoldNext.stop()} onMouseLeave={() => ndHoldNext.stop()} onTouchStart={() => ndHoldNext.start()} onTouchEnd={() => ndHoldNext.stop()}>▶</button>
            <div className="swipe-fade swipe-fade-right" aria-hidden />
          </div>
        </div>

        {/* 光圈选项已删除（按需求） */}

        <div className="label-block">
          <div>快门</div>
          <div className="switch-inline"
            onPointerDown={shutterDrag.onPointerDown}
            onPointerMove={shutterDrag.onPointerMove}
            onPointerUp={shutterDrag.onPointerUp}
          >
            <div className="swipe-fade swipe-fade-left" aria-hidden />
            <button data-testid="base-shutter-prev" className="btn" onClick={shutterPrev} onMouseDown={() => shutterHoldPrev.start()} onMouseUp={() => shutterHoldPrev.stop()} onMouseLeave={() => shutterHoldPrev.stop()} onTouchStart={() => shutterHoldPrev.start()} onTouchEnd={() => shutterHoldPrev.stop()}>◀</button>
            <div className="selector-swipe-hint left" aria-hidden>◀</div>
            <div data-testid="base-shutter-value" className="switch-value">{currentShutterLabel}</div>
            <div className="selector-swipe-hint right" aria-hidden>▶</div>
            <button data-testid="base-shutter-next" className="btn" onClick={shutterNext} onMouseDown={() => shutterHoldNext.start()} onMouseUp={() => shutterHoldNext.stop()} onMouseLeave={() => shutterHoldNext.stop()} onTouchStart={() => shutterHoldNext.start()} onTouchEnd={() => shutterHoldNext.stop()}>▶</button>
            <div className="swipe-fade swipe-fade-right" aria-hidden />
          </div>
        </div>

        {/* ISO 调整组件已删除 */}

        <div className="label-block">
          曝光补偿
          <div className="switch-inline"
            onPointerDown={compDrag.onPointerDown}
            onPointerMove={compDrag.onPointerMove}
            onPointerUp={compDrag.onPointerUp}
          >
            <div className="swipe-fade swipe-fade-left" aria-hidden />
            <button data-testid="comp-prev" className="btn" onClick={compPrev} onMouseDown={() => compHoldPrev.start()} onMouseUp={() => compHoldPrev.stop()} onMouseLeave={() => compHoldPrev.stop()} onTouchStart={() => compHoldPrev.start()} onTouchEnd={() => compHoldPrev.stop()}>◀</button>
            <div className="selector-swipe-hint left" aria-hidden>◀</div>
            <div data-testid="comp-value" className="switch-value">{compensationEv > 0 ? `+${compensationEv} EV` : `${compensationEv} EV`}</div>
            <div className="selector-swipe-hint right" aria-hidden>▶</div>
            <button data-testid="comp-next" className="btn" onClick={compNext} onMouseDown={() => compHoldNext.start()} onMouseUp={() => compHoldNext.stop()} onMouseLeave={() => compHoldNext.stop()} onTouchStart={() => compHoldNext.start()} onTouchEnd={() => compHoldNext.stop()}>▶</button>
            <div className="swipe-fade swipe-fade-right" aria-hidden />
          </div>
        </div>

        {ndPreset === 'custom' && (
          <label className="label-block">
            自定义 ND 因子
            <input
              type="number"
              min={1}
              step={1}
              value={customNdFactor}
              onChange={(event) => setCustomNdFactor(Number(event.target.value))}
              className="select-full mt-8"
            />
          </label>
        )}
      </div>

      {/* 结果区 */}
      <div className="grid-1-sm mb-14">
        {/* ND 调整后快门结果放在上方，EV 卡片移至下方 */}
        <div className="card card-center">
          <h3 className="card-title">装入滤镜后的快门时间</h3>
          <div data-testid="nd-shutter-result" className="large-32" style={{ textAlign: 'center' }}>{formatMaybeHMS(plan.ndAdjustedShutterSeconds)}</div>
        </div>

        <div className="card">
          <h3 className="card-title">当前 EV100 / EVISO</h3>
          <div data-testid="ev-display" className="large-22">{plan.baseEvIso.toFixed(2)}</div>
          <p className="muted-small mt-8">基于当前三参数计算的基础曝光值</p>
        </div>
      </div>
    </section>
  )
}