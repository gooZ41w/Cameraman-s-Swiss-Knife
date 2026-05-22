import { type ChangeEvent, useMemo, useState } from 'react'
import { computeFullDof } from '../../domain/dof'
import { computeExposurePlan, ND_PRESETS } from '../../domain/exposure'
import { SENSOR_FORMATS, type SensorFormat } from '../../domain/types'
import { useDofStore } from '../../stores/dofStore'
import { useExposureStore } from '../../stores/exposureStore'
import { useDragSnap } from '../../utils/useDragSnap'

type FeatureKey =
  | 'nd-exposure'
  | 'panning-assist'
  | 'dof'
  | 'magnification-converter'
  | 'parameter-compare'
  | 'photography-notes'

type FeatureItem = {
  key: FeatureKey
  name: string
  status: string
  description: string
  isDeveloping: boolean
}

type CameraIconItem = {
  id: string
  name: string
  url: string
  isPlaceholder?: boolean
}

const features: FeatureItem[] = [
  {
    key: 'nd-exposure',
    name: 'ND曝光计算器',
    status: '>',
    description: '左右滑动切换 ND、基础快门与曝光补偿，用于现场快速得到装滤镜后的快门结果。',
    isDeveloping: false,
  },
  {
    key: 'dof',
    name: '景深计算器',
    status: '>',
    description: '根据焦距、光圈与对焦距离计算近界、远界、全景深和超焦距。',
    isDeveloping: false,
  },
  {
    key: 'panning-assist',
    name: '大光比助手',
    status: '开发中',
    description: '用于高光压制与遮挡控制的辅助工具，作为独立入口保留。',
    isDeveloping: true,
  },
  {
    key: 'magnification-converter',
    name: '放大倍率换算',
    status: '开发中',
    description: '用于近摄与微距场景下的倍率和距离换算。',
    isDeveloping: true,
  },
  {
    key: 'parameter-compare',
    name: '参数斗蛐蛐助手',
    status: '开发中',
    description: '用于镜头参数对比、预算判断与取舍参考。',
    isDeveloping: true,
  },
  {
    key: 'photography-notes',
    name: '摄影小知识',
    status: '开发中',
    description: '用于承载摄影知识、提示与说明内容。',
    isDeveloping: true,
  },
]

const cameraIconUrl = new URL('../icons/camera-placeholder.svg', import.meta.url).href
const defaultCameraIcon: CameraIconItem = {
  id: 'camera-placeholder',
  name: '默认占位图标',
  url: cameraIconUrl,
  isPlaceholder: true,
}

const shutterOptions = [
  { seconds: 30, label: '30″' },
  { seconds: 25, label: '25″' },
  { seconds: 20, label: '20″' },
  { seconds: 15, label: '15″' },
  { seconds: 13, label: '13″' },
  { seconds: 10, label: '10″' },
  { seconds: 8, label: '8″' },
  { seconds: 6, label: '6″' },
  { seconds: 5, label: '5″' },
  { seconds: 4, label: '4″' },
  { seconds: 3, label: '3″' },
  { seconds: 2.5, label: '2.5″' },
  { seconds: 2, label: '2″' },
  { seconds: 1.6, label: '1.6″' },
  { seconds: 1.3, label: '1.3″' },
  { seconds: 1, label: '1″' },
  { seconds: 1 / 1.3, label: '1/1.3s' },
  { seconds: 1 / 1.6, label: '1/1.6s' },
  { seconds: 1 / 2, label: '1/2s' },
  { seconds: 1 / 2.5, label: '1/2.5s' },
  { seconds: 1 / 3, label: '1/3s' },
  { seconds: 1 / 4, label: '1/4s' },
  { seconds: 1 / 5, label: '1/5s' },
  { seconds: 1 / 6, label: '1/6s' },
  { seconds: 1 / 8, label: '1/8s' },
  { seconds: 1 / 10, label: '1/10s' },
  { seconds: 1 / 13, label: '1/13s' },
  { seconds: 1 / 15, label: '1/15s' },
  { seconds: 1 / 20, label: '1/20s' },
  { seconds: 1 / 25, label: '1/25s' },
  { seconds: 1 / 30, label: '1/30s' },
  { seconds: 1 / 40, label: '1/40s' },
  { seconds: 1 / 50, label: '1/50s' },
  { seconds: 1 / 60, label: '1/60s' },
  { seconds: 1 / 80, label: '1/80s' },
  { seconds: 1 / 100, label: '1/100s' },
  { seconds: 1 / 125, label: '1/125s' },
  { seconds: 1 / 160, label: '1/160s' },
  { seconds: 1 / 200, label: '1/200s' },
  { seconds: 1 / 250, label: '1/250s' },
  { seconds: 1 / 320, label: '1/320s' },
  { seconds: 1 / 400, label: '1/400s' },
  { seconds: 1 / 500, label: '1/500s' },
  { seconds: 1 / 640, label: '1/640s' },
  { seconds: 1 / 800, label: '1/800s' },
  { seconds: 1 / 1000, label: '1/1000s' },
  { seconds: 1 / 1250, label: '1/1250s' },
  { seconds: 1 / 1600, label: '1/1600s' },
  { seconds: 1 / 2000, label: '1/2000s' },
  { seconds: 1 / 2500, label: '1/2500s' },
  { seconds: 1 / 3200, label: '1/3200s' },
  { seconds: 1 / 4000, label: '1/4000s' },
  { seconds: 1 / 5000, label: '1/5000s' },
  { seconds: 1 / 6400, label: '1/6400s' },
  { seconds: 1 / 8000, label: '1/8000s' },
]

const compensationOptions = [
  -5.0,
  -4.7,
  -4.5,
  -4.3,
  -4.0,
  -3.7,
  -3.5,
  -3.3,
  -3.0,
  -2.7,
  -2.5,
  -2.3,
  -2.0,
  -1.7,
  -1.5,
  -1.3,
  -1.0,
  -0.7,
  -0.5,
  -0.3,
  0.0,
  0.3,
  0.5,
  0.7,
  1.0,
  1.3,
  1.5,
  1.7,
  2.0,
  2.3,
  2.5,
  2.7,
  3.0,
  3.3,
  3.5,
  3.7,
  4.0,
  4.3,
  4.5,
  4.7,
  5.0,
]
const ndOptions = Object.values(ND_PRESETS)

function wrapIndex(index: number, length: number): number {
  return (index + length) % length
}

function findNearestIndex(values: number[], value: number): number {
  return values.reduce((bestIndex, item, index) => {
    return Math.abs(item - value) < Math.abs(values[bestIndex] - value) ? index : bestIndex
  }, 0)
}

function findNearestStandardShutter(seconds: number) {
  return shutterOptions[findNearestIndex(shutterOptions.map((option) => option.seconds), seconds)]
}

function formatBaseShutter(seconds: number): string {
  const standard = findStandardShutter(seconds)
  if (standard) return standard.label

  if (seconds >= 1) return `${seconds.toFixed(1)}s`
  return `1/${Number((1 / seconds).toFixed(1))}s`
}

function formatCompensation(ev: number): string {
  if (ev === 0) return '0.0EV'
  return `${ev > 0 ? '+' : ''}${ev.toFixed(1)}EV`
}

function formatNdResult(seconds: number): string {
  if (!Number.isFinite(seconds)) return '∞'

  if (seconds > 60) {
    const totalSeconds = Math.round(seconds)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const restSeconds = totalSeconds % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(restSeconds).padStart(2, '0')}`
  }

  return findNearestStandardShutter(seconds).label
}

function findStandardShutter(seconds: number) {
  return shutterOptions.find((option) => Math.abs(option.seconds - seconds) <= Math.max(0.000001, option.seconds * 0.000001))
}

function shouldShowBulbModeHint(seconds: number): boolean {
  return seconds > 60
}

type ExposurePickerProps = {
  title: string
  items: Array<{ value: string; label: string; meta?: string }>
  activeIndex: number
  testId: string
  onPrev: () => void
  onNext: () => void
}

function ExposurePicker({ title, items, activeIndex, testId, onPrev, onNext }: ExposurePickerProps) {
  const [dragging, setDragging] = useState(false)
  const active = items[activeIndex]
  const prev = items[wrapIndex(activeIndex - 1, items.length)]
  const next = items[wrapIndex(activeIndex + 1, items.length)]
  const dragHandlers = useDragSnap(onPrev, onNext, {
    onMove: (dx) => setDragging(Math.abs(dx) > 0),
  })

  return (
    <section className="exposure-picker" aria-label={title}>
      <div className="exposure-picker-title">{title}</div>
      <div className="exposure-picker-line exposure-picker-line-top" aria-hidden="true" />
      <div className={`switch-inline exposure-picker-options ${dragging ? 'dragging' : ''}`} {...dragHandlers}>
        <div className="exposure-picker-side" data-testid={`${testId}-prev`} aria-hidden="true">
          <span>{prev.label}</span>
          {prev.meta ? <small>{prev.meta}</small> : null}
        </div>
        <div className="exposure-picker-current" data-testid={`${testId}-value`}>
          <span>{active.label}</span>
          {active.meta ? <small>{active.meta}</small> : null}
        </div>
        <div className="exposure-picker-side" data-testid={`${testId}-next`} aria-hidden="true">
          <span>{next.label}</span>
          {next.meta ? <small>{next.meta}</small> : null}
        </div>
      </div>
      <div className="exposure-picker-line exposure-picker-line-bottom" aria-hidden="true" />
    </section>
  )
}

function ExposureCalculatorPage({ onBack }: { onBack: () => void }) {
  const shutterSeconds = useExposureStore((state) => state.shutterSeconds)
  const compensationEv = useExposureStore((state) => state.compensationEv)
  const ndPreset = useExposureStore((state) => state.ndPreset)
  const setShutterSeconds = useExposureStore((state) => state.setShutterSeconds)
  const setCompensationEv = useExposureStore((state) => state.setCompensationEv)
  const setNdPreset = useExposureStore((state) => state.setNdPreset)
  const aperture = useExposureStore((state) => state.aperture)
  const iso = useExposureStore((state) => state.iso)

  const ndIndex = Math.max(
    0,
    ndOptions.findIndex((preset) => preset.label === ndPreset),
  )
  const shutterIndex = findNearestIndex(
    shutterOptions.map((option) => option.seconds),
    shutterSeconds,
  )
  const compensationIndex = findNearestIndex(compensationOptions, compensationEv)

  const plan = useMemo(
    () =>
      computeExposurePlan({
        aperture,
        shutterSeconds,
        iso,
        compensationEv,
        ndPreset,
        solveFor: 'shutter',
      }),
    [aperture, compensationEv, iso, ndPreset, shutterSeconds],
  )

  const ndItems = ndOptions.map((preset) => ({
    value: preset.label,
    label: preset.label,
    meta: `${preset.stops} stops`,
  }))
  const shutterItems = shutterOptions.map((seconds) => ({
    value: String(seconds.seconds),
    label: seconds.label,
  }))
  const compensationItems = compensationOptions.map((ev) => ({
    value: String(ev),
    label: formatCompensation(ev),
  }))

  return (
    <main className="app-main exposure-main" data-testid="exposure-page">
      <section className="exposure-page">
        <header className="tool-topbar">
          <button type="button" className="home-back-button" aria-label="返回主页" onClick={onBack}>
            &lt;
          </button>
          <h1 className="tool-topbar-title">ND曝光计算器</h1>
          <div className="tool-topbar-spacer" aria-hidden="true" />
        </header>

        <section className="exposure-picker-stack" aria-label="ND曝光参数">
          <ExposurePicker
            title="滤镜档位"
            items={ndItems}
            activeIndex={ndIndex}
            testId="nd-switch"
            onPrev={() => setNdPreset(ndOptions[wrapIndex(ndIndex - 1, ndOptions.length)].label)}
            onNext={() => setNdPreset(ndOptions[wrapIndex(ndIndex + 1, ndOptions.length)].label)}
          />
          <ExposurePicker
            title="基础快门"
            items={shutterItems}
            activeIndex={shutterIndex}
            testId="base-shutter"
            onPrev={() => setShutterSeconds(shutterOptions[wrapIndex(shutterIndex - 1, shutterOptions.length)].seconds)}
            onNext={() => setShutterSeconds(shutterOptions[wrapIndex(shutterIndex + 1, shutterOptions.length)].seconds)}
          />
          <ExposurePicker
            title="曝光补偿"
            items={compensationItems}
            activeIndex={compensationIndex}
            testId="comp"
            onPrev={() => setCompensationEv(compensationOptions[wrapIndex(compensationIndex - 1, compensationOptions.length)])}
            onNext={() => setCompensationEv(compensationOptions[wrapIndex(compensationIndex + 1, compensationOptions.length)])}
          />
        </section>

        <section className="exposure-result" aria-live="polite">
          <div className="exposure-result-label">装入滤镜后的快门时间</div>
          <div className="exposure-result-value" data-testid="nd-shutter-result">
            {formatNdResult(plan.ndAdjustedShutterSeconds)}
          </div>
          {shouldShowBulbModeHint(plan.ndAdjustedShutterSeconds) ? (
            <div className="exposure-result-hint">请使用相机的B门或T门模式</div>
          ) : null}
        </section>
      </section>
    </main>
  )
}

const sensorFormatOptions = Object.entries(SENSOR_FORMATS)
const sensorFormatLabels: Record<string, string> = {
  full_frame: 'Full Frame',
  aps_c_std: 'APS-C (Sony/Fuji/Nikon)',
  aps_c_canon: 'APS-C (Canon)',
  m43: 'm4/3',
  one_inch: '1 Inch',
}

type DofDialogState =
  | { type: 'none' }
  | { type: 'custom-sensor'; width: string; height: string }
  | { type: 'focal'; value: string }
  | { type: 'aperture'; value: string }
  | { type: 'focus'; value: string }

function formatDofDistance(mm: number): string {
  if (!Number.isFinite(mm)) return '∞'

  if (mm >= 1000) {
    const meters = mm / 1000
    return `${meters >= 10 ? meters.toFixed(1) : meters.toFixed(2)}m`
  }

  return `${Math.round(mm)}mm`
}

function formatFocusDistance(meters: number): string {
  if (meters >= 400) return '∞'
  return `${meters >= 10 ? meters.toFixed(1) : meters.toFixed(2)}m`
}

function formatDofNumber(value: number): string {
  return value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function computeCustomCoc(width: number, height: number): number {
  return Math.sqrt(width * width + height * height) / 1490
}

function DofSummary({ result, focusDistanceM }: { result: ReturnType<typeof computeFullDof>; focusDistanceM: number }) {
  const focusMm = focusDistanceM * 1000
  const frontMm = Math.max(0, focusMm - result.D_n_mm)

  if (!Number.isFinite(result.delta_D_mm)) {
    return (
      <p className="dof-result-summary">
        <span>
          距离<span className="dof-summary-subject">您</span>前方
          <span className="dof-summary-distance">{formatDofDistance(result.D_n_mm)}</span>
          开外皆为清晰范围
        </span>
        <span>
          距离<span className="dof-summary-subject">主体</span>前
          <span className="dof-summary-distance">{formatDofDistance(frontMm)}</span>
          为清晰范围
        </span>
      </p>
    )
  }

  const backMm = Math.max(0, result.D_f_mm - focusMm)
  return (
    <p className="dof-result-summary">
      <span>
        <span className="dof-summary-subject">主体</span>前方
        <span className="dof-summary-distance">{formatDofDistance(frontMm)}</span>
      </span>
      <span>
        至<span className="dof-summary-subject">主体</span>后方
        <span className="dof-summary-distance">{formatDofDistance(backMm)}</span>
        为
      </span>
      <span>清晰范围</span>
    </p>
  )
}

function DofMetricCard({ label, value, testId }: { label: string; value: string; testId: string }) {
  return (
    <div className="dof-metric-card">
      <span>{label}</span>
      <strong data-testid={testId}>{value}</strong>
    </div>
  )
}

function DofCalculatorPage({ onBack }: { onBack: () => void }) {
  const sensorFormat = useDofStore((state) => state.sensorFormat)
  const focalLength = useDofStore((state) => state.focalLength_mm)
  const aperture = useDofStore((state) => state.aperture)
  const focusDistance = useDofStore((state) => state.focusDistance_m)
  const setSensorFormat = useDofStore((state) => state.setSensorFormat)
  const setFocalLength = useDofStore((state) => state.setFocalLength)
  const setAperture = useDofStore((state) => state.setAperture)
  const setFocusDistance = useDofStore((state) => state.setFocusDistance)
  const [dialog, setDialog] = useState<DofDialogState>({ type: 'none' })
  const [detailsOpen, setDetailsOpen] = useState(false)

  const result = useMemo(
    () => computeFullDof(focalLength, aperture, focusDistance * 1000, sensorFormat.coc_mm ?? 0.029),
    [aperture, focalLength, focusDistance, sensorFormat.coc_mm],
  )

  function handleSensorFormatChange(event: ChangeEvent<HTMLSelectElement>) {
    if (event.target.value === 'custom') {
      setDialog({ type: 'custom-sensor', width: '', height: '' })
      return
    }

    const next = SENSOR_FORMATS[event.target.value]
    if (next) setSensorFormat(next as SensorFormat)
  }

  function confirmDialog() {
    if (dialog.type === 'custom-sensor') {
      const width = clampNumber(Number(dialog.width), 1, 200)
      const height = clampNumber(Number(dialog.height), 1, 200)
      setSensorFormat({
        name: `自定义画幅 ${formatDofNumber(width)}x${formatDofNumber(height)}mm`,
        width_mm: width,
        height_mm: height,
        diagonal_mm: Math.sqrt(width * width + height * height),
        coc_mm: computeCustomCoc(width, height),
      })
    }

    if (dialog.type === 'focal') {
      setFocalLength(clampNumber(Number(dialog.value), 1, 6000))
    }

    if (dialog.type === 'aperture') {
      setAperture(clampNumber(Number(dialog.value), 0.95, 32))
    }

    if (dialog.type === 'focus') {
      setFocusDistance(clampNumber(Number(dialog.value), 0.01, 400))
    }

    setDialog({ type: 'none' })
  }

  const selectedSensorKey =
    sensorFormatOptions.find(([, format]) => format.name === sensorFormat.name)?.[0] ?? 'custom'

  return (
    <main className="app-main exposure-main" data-testid="dof-page">
      <section className="dof-page">
        <header className="tool-topbar">
          <button type="button" className="home-back-button" aria-label="返回主页" onClick={onBack}>
            &lt;
          </button>
          <h1 className="tool-topbar-title">景深计算器</h1>
          <div className="tool-topbar-spacer" aria-hidden="true" />
        </header>

        <section className="dof-control-panel" aria-label="景深输入参数">
          <label className="dof-field">
            <span>画幅</span>
            <select
              className="dof-select"
              value={selectedSensorKey}
              onChange={handleSensorFormatChange}
              data-testid="dof-sensor-format-select"
            >
              {sensorFormatOptions.map(([key, format]) => (
                <option key={key} value={key}>
                  {sensorFormatLabels[key] ?? format.name}
                </option>
              ))}
              <option value="custom">自定义画幅</option>
            </select>
          </label>

          <div className="dof-field">
            <span data-testid="dof-focal-length-label">
              焦距（mm）:{' '}
              <button type="button" className="dof-value-button" onClick={() => setDialog({ type: 'focal', value: String(focalLength) })}>
                {Math.round(focalLength)}
              </button>
            </span>
            <input
              data-testid="dof-focal-length-range"
              className="dof-range"
              type="range"
              min={1}
              max={6000}
              step={1}
              value={focalLength}
              onChange={(event) => setFocalLength(Number(event.target.value))}
            />
          </div>

          <div className="dof-field">
            <span data-testid="dof-aperture-label">
              光圈（f-number）:{' '}
              <button type="button" className="dof-value-button" onClick={() => setDialog({ type: 'aperture', value: String(aperture) })}>
                f/{formatDofNumber(aperture)}
              </button>
            </span>
            <input
              data-testid="dof-aperture-range"
              className="dof-range"
              type="range"
              min={0.95}
              max={32}
              step={0.05}
              value={aperture}
              onChange={(event) => setAperture(Number(event.target.value))}
            />
          </div>

          <div className="dof-field">
            <span data-testid="dof-focus-distance-label">
              对焦距离（米）:{' '}
              <button type="button" className="dof-value-button" onClick={() => setDialog({ type: 'focus', value: String(focusDistance) })}>
                {formatFocusDistance(focusDistance)}
              </button>
            </span>
            <input
              data-testid="dof-focus-distance-range"
              className="dof-range"
              type="range"
              min={0.01}
              max={400}
              step={0.01}
              value={focusDistance}
              onChange={(event) => setFocusDistance(Number(event.target.value))}
            />
          </div>
        </section>

        <section className="dof-result-panel" data-testid="dof-result-card" aria-label="景深计算结果">
          <DofSummary result={result} focusDistanceM={focusDistance} />
          <button type="button" className="dof-detail-toggle" onClick={() => setDetailsOpen((open) => !open)}>
            {detailsOpen ? '收起计算值' : '展开计算值'}
          </button>
          <div className={`dof-result-grid ${detailsOpen ? 'is-open' : ''}`}>
            <DofMetricCard label="景深近界" value={formatDofDistance(result.D_n_mm)} testId="dof-near-value" />
            <DofMetricCard label="景深远界" value={formatDofDistance(result.D_f_mm)} testId="dof-far-value" />
            <DofMetricCard label="全景深" value={formatDofDistance(result.delta_D_mm)} testId="dof-total-value" />
            <DofMetricCard label="超焦距" value={formatDofDistance(result.H_mm)} testId="dof-hyperfocal-value" />
          </div>
        </section>

        {dialog.type !== 'none' ? (
          <div className="dof-dialog-backdrop" role="dialog" aria-modal="true">
            <section className="dof-dialog">
              {dialog.type === 'custom-sensor' ? (
                <>
                  <h2>请输入画幅的长度和宽度（mm）</h2>
                  <label>
                    长度
                    <input
                      type="number"
                      inputMode="decimal"
                      value={dialog.width}
                      onChange={(event) => setDialog({ ...dialog, width: event.target.value })}
                    />
                  </label>
                  <label>
                    宽度
                    <input
                      type="number"
                      inputMode="decimal"
                      value={dialog.height}
                      onChange={(event) => setDialog({ ...dialog, height: event.target.value })}
                    />
                  </label>
                </>
              ) : (
                <>
                  <h2>
                    {dialog.type === 'focal' ? '输入焦距（mm）' : null}
                    {dialog.type === 'aperture' ? '输入光圈值' : null}
                    {dialog.type === 'focus' ? '输入对焦距离（米）' : null}
                  </h2>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={dialog.value}
                    onChange={(event) => setDialog({ ...dialog, value: event.target.value })}
                  />
                </>
              )}
              <div className="dof-dialog-actions">
                <button type="button" onClick={() => setDialog({ type: 'none' })}>
                  取消
                </button>
                <button type="button" onClick={confirmDialog}>
                  确认
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  )
}

export function AppShell() {
  const [activeFeature, setActiveFeature] = useState<FeatureKey | 'home' | 'camera-icons'>('home')
  const [cameraIcons, setCameraIcons] = useState<CameraIconItem[]>([defaultCameraIcon])
  const [selectedCameraIconId, setSelectedCameraIconId] = useState(defaultCameraIcon.id)

  const current = features.find((feature) => feature.key === activeFeature) ?? null
  const selectedCameraIcon = cameraIcons.find((icon) => icon.id === selectedCameraIconId) ?? defaultCameraIcon

  function handleCameraIconImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const importedIcon: CameraIconItem = {
      id: `custom-camera-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, '') || '自定义图标',
      url: URL.createObjectURL(file),
    }

    setCameraIcons((icons) => [...icons, importedIcon])
    setSelectedCameraIconId(importedIcon.id)
    event.target.value = ''
  }

  if (activeFeature === 'camera-icons') {
    return (
      <main className="app-main app-main-home" data-testid="page-camera-icons">
        <section className="home-shell camera-icon-page">
          <header className="camera-icon-header">
            <button
              type="button"
              className="home-back-button"
              data-testid="action-back-home"
              aria-label="返回主页"
              onClick={() => setActiveFeature('home')}
            >
              &lt;
            </button>
            <h1 className="camera-icon-title">主页面相机图标</h1>
            <label className="camera-icon-add-button" aria-label="导入自定义相机图标">
              +
              <input
                className="camera-icon-file-input"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml"
                onChange={handleCameraIconImport}
              />
            </label>
          </header>

          <section className="camera-icon-preview" aria-label="当前主页面相机图标">
            <img
              className={`camera-icon-preview-image ${selectedCameraIcon.isPlaceholder ? 'is-placeholder' : ''}`}
              src={selectedCameraIcon.url}
              alt=""
              aria-hidden="true"
            />
            <div className="camera-icon-preview-name">{selectedCameraIcon.name}</div>
          </section>

          <section className="camera-icon-grid" aria-label="相机图标预设">
            {cameraIcons.map((icon) => (
              <button
                key={icon.id}
                type="button"
                className={`camera-icon-option ${icon.id === selectedCameraIconId ? 'is-selected' : ''}`}
                onClick={() => setSelectedCameraIconId(icon.id)}
              >
                <img
                  className={`camera-icon-option-image ${icon.isPlaceholder ? 'is-placeholder' : ''}`}
                  src={icon.url}
                  alt=""
                  aria-hidden="true"
                />
                <span>{icon.name}</span>
              </button>
            ))}
          </section>
        </section>
      </main>
    )
  }

  if (activeFeature === 'nd-exposure') {
    return <ExposureCalculatorPage onBack={() => setActiveFeature('home')} />
  }

  if (activeFeature === 'dof') {
    return <DofCalculatorPage onBack={() => setActiveFeature('home')} />
  }

  if (activeFeature !== 'home' && current) {
    return (
      <main className="app-main app-main-home" data-testid={`page-${current.key}`}>
        <section className="home-shell home-feature-shell">
          <button
            type="button"
            className="home-back-button"
            data-testid="action-back-home"
            aria-label="返回主页"
            onClick={() => setActiveFeature('home')}
          >
            &lt;
          </button>

          <header className="feature-page-header">
            <div className="home-kicker">功能页面</div>
            <h1 className="home-title home-title-feature">{current.name}</h1>
            <p className="home-lead home-lead-feature">{current.description}</p>
          </header>

          <section className="feature-page-panel">
            <div className="feature-placeholder-title">输入控件区</div>
            <div className="feature-placeholder empty-zone">等待下一阶段接入</div>
          </section>

          <section className="feature-page-panel">
            <div className="feature-placeholder-title">输出控件区</div>
            <div className="feature-placeholder empty-zone">等待下一阶段接入</div>
          </section>
        </section>
      </main>
    )
  }

  return (
    <main className="app-main app-main-home" data-testid="home-page">
      <section className="home-scroll-page" aria-label="主页面">
        <section className="home-brand-stage">
          <h1 className="home-title home-title-center">穷哥们的摄影小帮手</h1>
          <div className="home-camera-stage" aria-label="自定义相机图标预览">
            <img
              className={`home-camera-icon ${selectedCameraIcon.isPlaceholder ? 'is-placeholder' : ''}`}
              src={selectedCameraIcon.url}
              alt=""
              aria-hidden="true"
            />
          </div>
        </section>

        <section className="home-feature-drawer" aria-label="功能入口">
          <div className="home-feature-list">
            {features.map((feature) => (
              <button
                key={feature.key}
                type="button"
                data-testid={`home-entry-${feature.key}`}
                className={`home-feature-card ${activeFeature === feature.key ? 'is-active' : ''}`}
                onClick={() => setActiveFeature(feature.key)}
              >
                <div className="home-feature-row">
                  <span className="home-feature-name">{feature.name}</span>
                  <span className={feature.isDeveloping ? 'home-feature-state is-dev' : 'home-feature-state'}>
                    {feature.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
        <button
          type="button"
          className="home-camera-customize-link"
          onClick={() => setActiveFeature('camera-icons')}
        >
          点击切换主页面相机图标
        </button>
      </section>
    </main>
  )
}

