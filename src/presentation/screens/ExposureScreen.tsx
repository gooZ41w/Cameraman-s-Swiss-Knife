import React, { useState } from 'react'
import { computeExposurePlan } from '../../domain/exposure'
import { formatShutterDisplay, formatShutterRangeDisplay } from '../formatters/exposureFormat'
import { useExposureStore } from '../../stores/exposureStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { ND_PRESETS } from '../../domain/exposure'
import { useHoldAccelerator } from '../../utils/useHoldAccelerator'
import { useDragSnap } from '../../utils/useDragSnap'
import theme, { selectorTranslateFactor, selectorScaleMaxShrink, selectorScaleDivisor, selectorBlurMax, selectorBlurDivisor, selectorReducedMotion, } from '../theme'

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
  const [ndOffset, setNdOffset] = useState(0)
  const [ndReleasing, setNdReleasing] = useState(false)
  const [ndDragging, setNdDragging] = useState(false)
  const ndDrag = useDragSnap(ndPrev, ndNext, { onMove: (dx) => setNdOffset(dx) })

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
  const [shutterOffset, setShutterOffset] = useState(0)
  const [shutterReleasing, setShutterReleasing] = useState(false)
  const [shutterDragging, setShutterDragging] = useState(false)
  const shutterDrag = useDragSnap(shutterPrev, shutterNext, { onMove: (dx) => setShutterOffset(dx) })

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
  const [compOffset, setCompOffset] = useState(0)
  const [compReleasing, setCompReleasing] = useState(false)
  const [compDragging, setCompDragging] = useState(false)

  const sideStyle = (offset: number, invert = false) => {
    const sign = invert ? -1 : 1
    const computed = typeof window !== 'undefined' ? getComputedStyle(document.documentElement) : null
    const translateFactor = typeof selectorTranslateFactor !== 'undefined' && selectorTranslateFactor !== null
      ? parseFloat(String(selectorTranslateFactor))
      : computed ? parseFloat(computed.getPropertyValue('--selector-translate-factor') || '0.2') : 0.2
    const scaleMaxShrink = typeof selectorScaleMaxShrink !== 'undefined' && selectorScaleMaxShrink !== null
      ? parseFloat(String(selectorScaleMaxShrink))
      : computed ? parseFloat(computed.getPropertyValue('--selector-scale-max-shrink') || '0.03') : 0.03
    const scaleDiv = typeof selectorScaleDivisor !== 'undefined' && selectorScaleDivisor !== null
      ? parseFloat(String(selectorScaleDivisor))
      : computed ? parseFloat(computed.getPropertyValue('--selector-scale-divisor') || '800') : 800
    const blurMax = typeof selectorBlurMax !== 'undefined' && selectorBlurMax !== null
      ? parseFloat(String(selectorBlurMax))
      : computed ? parseFloat(computed.getPropertyValue('--selector-blur-max') || '1') : 1
    const blurDiv = typeof selectorBlurDivisor !== 'undefined' && selectorBlurDivisor !== null
      ? parseFloat(String(selectorBlurDivisor))
      : computed ? parseFloat(computed.getPropertyValue('--selector-blur-divisor') || '200') : 200
    const reduced = (typeof selectorReducedMotion !== 'undefined' && selectorReducedMotion !== null
      ? String(selectorReducedMotion).trim() === '1'
      : computed ? computed.getPropertyValue('--selector-reduced-motion').trim() === '1' : false)
    if (reduced) {
      return { transform: 'none', opacity: 1, filter: 'none' }
    }

    const tx = offset * translateFactor * sign
    const opacity = Math.max(0.35, 1 - Math.min(Math.abs(offset) / 120, 0.65))
    const scale = 1 - Math.min(Math.abs(offset) / scaleDiv, scaleMaxShrink)
    const blurPx = Math.min(Math.abs(offset) / blurDiv, blurMax)
    return { transform: `translateX(${tx}px) scale(${scale})`, opacity, filter: `blur(${blurPx}px)` }
  }
  const compDrag = useDragSnap(compPrev, compNext, { onMove: (dx) => setCompOffset(dx) })

  return (
    <section className="container" data-testid="exposure-page">
      {/* 顶部标题栏 + 设置按钮 */}
      <div className="header-row">
        <h1 className="h1">ND曝光计算器</h1>
        <div className="section-note">摇拍助手（开发中）</div>
      </div>

      {/* 参数区：ND 选择在顶部以符合线框 */}
      <div className="grid-1">
        <div className="label-block">
          滤镜档位
          <div className={`switch-inline switch-inline-stack${ndDragging ? ' dragging' : ''}`}
            onPointerDown={(e) => { ndDrag.onPointerDown(e); setNdDragging(true) }}
            onPointerMove={ndDrag.onPointerMove}
            onPointerUp={(e) => {
              ndDrag.onPointerUp(e)
              setNdReleasing(true)
              setNdOffset(0)
              setNdDragging(false)
              window.setTimeout(() => setNdReleasing(false), 280)
            }}
          >
            <div className="swipe-fade swipe-fade-left" aria-hidden />
            <button data-testid="nd-switch-prev" className={`btn ${ndReleasing ? 'releasing' : ''}`} onClick={ndPrev} aria-label="prev" onPointerDown={() => ndHoldPrev.start()} onPointerUp={() => ndHoldPrev.stop()} onPointerLeave={() => ndHoldPrev.stop()} style={sideStyle(ndOffset, true)}>◀</button>
            <div className="selector-swipe-hint left" aria-hidden>◀</div>
            <div data-testid="nd-switch-value" className={`switch-value switch-value-stack ${ndReleasing ? 'releasing' : ''}`} style={{ transform: `translateX(${ndOffset}px)` }}>
              <span className="switch-main-value">{ND_PRESETS[ndPreset]?.label ?? ndPreset}</span>
              {showNdStops && ndPreset !== 'custom' && (
                <span data-testid="nd-selected-stops" className="switch-subvalue">{ndSelectedStopsLabel}</span>
              )}
            </div>
            <div className="selector-swipe-hint right" aria-hidden>▶</div>
            <button data-testid="nd-switch-next" className={`btn ${ndReleasing ? 'releasing' : ''}`} onClick={ndNext} aria-label="next" onPointerDown={() => ndHoldNext.start()} onPointerUp={() => ndHoldNext.stop()} onPointerLeave={() => ndHoldNext.stop()} style={sideStyle(ndOffset, false)}>▶</button>
            <div className="swipe-fade swipe-fade-right" aria-hidden />
          </div>
        </div>

        {/* 光圈选项已删除（按需求） */}

        <div className="label-block">
          <div>快门</div>
          <div className={`switch-inline${shutterDragging ? ' dragging' : ''}`}
            onPointerDown={(e) => { shutterDrag.onPointerDown(e); setShutterDragging(true) }}
            onPointerMove={shutterDrag.onPointerMove}
            onPointerUp={(e) => {
              shutterDrag.onPointerUp(e)
              setShutterReleasing(true)
              setShutterOffset(0)
              setShutterDragging(false)
              window.setTimeout(() => setShutterReleasing(false), 280)
            }}
          >
            <div className="swipe-fade swipe-fade-left" aria-hidden />
            <button data-testid="base-shutter-prev" className={`btn ${shutterReleasing ? 'releasing' : ''}`} onClick={shutterPrev} onPointerDown={() => shutterHoldPrev.start()} onPointerUp={() => shutterHoldPrev.stop()} onPointerLeave={() => shutterHoldPrev.stop()} style={sideStyle(shutterOffset, true)}>◀</button>
            <div className="selector-swipe-hint left" aria-hidden>◀</div>
            <div data-testid="base-shutter-value" className={`switch-value ${shutterReleasing ? 'releasing' : ''}`} style={{ transform: `translateX(${shutterOffset}px)` }}>{currentShutterLabel}</div>
            <div className="selector-swipe-hint right" aria-hidden>▶</div>
            <button data-testid="base-shutter-next" className={`btn ${shutterReleasing ? 'releasing' : ''}`} onClick={shutterNext} onPointerDown={() => shutterHoldNext.start()} onPointerUp={() => shutterHoldNext.stop()} onPointerLeave={() => shutterHoldNext.stop()} style={sideStyle(shutterOffset, false)}>▶</button>
            <div className="swipe-fade swipe-fade-right" aria-hidden />
          </div>
        </div>

        {/* ISO 调整组件已删除 */}

        <div className="label-block">
          曝光补偿
          <div className={`switch-inline${compDragging ? ' dragging' : ''}`}
            onPointerDown={(e) => { compDrag.onPointerDown(e); setCompDragging(true) }}
            onPointerMove={compDrag.onPointerMove}
            onPointerUp={(e) => {
              compDrag.onPointerUp(e)
              setCompReleasing(true)
              setCompOffset(0)
              setCompDragging(false)
              window.setTimeout(() => setCompReleasing(false), 280)
            }}
          >
            <div className="swipe-fade swipe-fade-left" aria-hidden />
            <button data-testid="comp-prev" className={`btn ${compReleasing ? 'releasing' : ''}`} onClick={compPrev} onMouseDown={() => compHoldPrev.start()} onMouseUp={() => compHoldPrev.stop()} onMouseLeave={() => compHoldPrev.stop()} onTouchStart={() => compHoldPrev.start()} onTouchEnd={() => compHoldPrev.stop()} style={sideStyle(compOffset, true)}>◀</button>
            <div className="selector-swipe-hint left" aria-hidden>◀</div>
            <div data-testid="comp-value" className={`switch-value ${compReleasing ? 'releasing' : ''}`} style={{ transform: `translateX(${compOffset}px)` }}>{compensationEv > 0 ? `+${compensationEv} EV` : `${compensationEv} EV`}</div>
            <div className="selector-swipe-hint right" aria-hidden>▶</div>
            <button data-testid="comp-next" className={`btn ${compReleasing ? 'releasing' : ''}`} onClick={compNext} onMouseDown={() => compHoldNext.start()} onMouseUp={() => compHoldNext.stop()} onMouseLeave={() => compHoldNext.stop()} onTouchStart={() => compHoldNext.start()} onTouchEnd={() => compHoldNext.stop()} style={sideStyle(compOffset, false)}>▶</button>
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

        {/* EV100/EVISO display removed per UX update */}
      </div>
    </section>
  )
}