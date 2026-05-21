import { computeFullDof } from '../../domain/dof'
import { SENSOR_FORMATS } from '../../domain/types'
import { useDofStore } from '../../stores/dofStore'
import { ToleranceBadge } from '../components/ToleranceBadge'
import { DisclaimerFooter } from '../components/DisclaimerFooter'

export function DofScreen() {
  const sensorFormat = useDofStore((state) => state.sensorFormat)
  const focalLength_mm = useDofStore((state) => state.focalLength_mm)
  const aperture = useDofStore((state) => state.aperture)
  const focusDistance_m = useDofStore((state) => state.focusDistance_m)

  const setSensorFormat = useDofStore((state) => state.setSensorFormat)
  const setFocalLength = useDofStore((state) => state.setFocalLength)
  const setAperture = useDofStore((state) => state.setAperture)
  const setFocusDistance = useDofStore((state) => state.setFocusDistance)

  // domain 层要求毫米单位
  const focusDistance_mm = focusDistance_m * 1000
  const result = computeFullDof(focalLength_mm, aperture, focusDistance_mm, sensorFormat.coc_mm!)
  const focusDistanceLabel = focusDistance_m >= 400 ? '∞' : `${focusDistance_m.toFixed(1)} m`
  const apertureLabel = aperture < 1 ? aperture.toFixed(2) : aperture.toFixed(1)

  const formatDistance = (value_mm: number): string => {
    if (!isFinite(value_mm)) {
      return '∞'
    }

    return `${(value_mm / 1000).toFixed(2)} m`
  }

  return (
    <section className="screen-section">
      <h1 className="section-title">景深计算器</h1>
      <div className="section-note">放大倍率换算（开发中）</div>
      <p className="muted-note">
        计算超焦距、景深范围与清晰度边界。所有结果包含 ±5%
        物理容差。<strong className="strong-emphasis">请输入镜头的实际物理焦距，切勿输入等效焦距。</strong>
      </p>

      <div className="grid-1">
        {/* 画幅选择 */}
        <div className="panel-box">
          <label className="label-strong">
            传感器画幅
          </label>
          <select
            data-testid="dof-sensor-select"
            value={sensorFormat.name}
            onChange={(e) => {
              const selected = Object.values(SENSOR_FORMATS).find((fmt) => fmt.name === e.target.value)
              if (selected) setSensorFormat(selected)
            }}
            className="select-full"
          >
            {Object.values(SENSOR_FORMATS).map((fmt) => (
              <option key={fmt.name} value={fmt.name}>
                {fmt.name} (CoC: {fmt.coc_mm}mm)
              </option>
            ))}
          </select>
        </div>

        {/* 焦距输入 */}
          <div className="panel-box">
            <label className="label-strong">
              焦距（毫米）: {focalLength_mm}
            </label>
          <input
            data-testid="dof-focal-length-range"
            type="range"
              min={4}
              max={800}
            step={1}
            value={focalLength_mm}
            onChange={(e) => setFocalLength(Number(e.target.value))}
              className="range-full"
          />
        </div>

        {/* 光圈输入 */}
        <div className="panel-box">
          <label data-testid="dof-aperture-label" className="label-strong">
            光圈（f-number）: f/{apertureLabel}
          </label>
          <input
            data-testid="dof-aperture-range"
            type="range"
            min={0.95}
            max={32}
            step={0.05}
            value={aperture}
            onChange={(e) => setAperture(Number(e.target.value))}
            className="range-full"
          />
        </div>

        {/* 对焦距离输入 */}
        <div className="panel-box">
          <label data-testid="dof-focus-distance-label" className="label-strong">
            对焦距离（米）: {focusDistanceLabel}
          </label>
          <input
            data-testid="dof-focus-distance-range"
            type="range"
            min={0.1}
            max={400}
            step={0.1}
            value={focusDistance_m}
            onChange={(e) => setFocusDistance(Number(e.target.value))}
            className="range-full"
          />
        </div>
      </div>

      {/* 结果展示 */}
      <div data-testid="dof-result-card" className="card dof-result-card">
        <div className="dof-result-row">
          <div className="dof-result-column">
            <h3 className="card-title">景深近界（Dn）</h3>
            <div data-testid="dof-near-value" className="value-20">{formatDistance(result.D_n_mm)}</div>
            <ToleranceBadge
              value={result.D_n_mm / 1000}
              lower={result.tolerance_lower_mm / 1000}
              upper={result.tolerance_upper_mm / 1000}
              unit="m"
              precision={2}
            />
          </div>

          <div className="dof-result-column">
            <h3 className="card-title">景深远界（Df）</h3>
            <div data-testid="dof-far-value" className="value-20">{formatDistance(result.D_f_mm)}</div>
            {isFinite(result.D_f_mm) && (
              <ToleranceBadge
                value={result.D_f_mm / 1000}
                lower={result.tolerance_lower_mm / 1000}
                upper={result.tolerance_upper_mm / 1000}
                unit="m"
                precision={2}
              />
            )}
          </div>
        </div>

        <div className="dof-result-centered">
          <h3 className="card-title">全景深（ΔD）</h3>
          <div data-testid="dof-total-value" className="value-24">{formatDistance(result.delta_D_mm)}</div>
          {isFinite(result.delta_D_mm) && (
            <ToleranceBadge
              value={result.delta_D_mm / 1000}
              lower={result.tolerance_lower_mm / 1000}
              upper={result.tolerance_upper_mm / 1000}
              unit="m"
              precision={2}
            />
          )}
        </div>

        <div className="dof-result-centered dof-hyperfocal">
          <h3 className="card-title">超焦距（H）</h3>
          <div data-testid="dof-hyperfocal-value" className="value-24">{formatDistance(result.H_mm)}</div>
          <p className="small-muted">超过此距离，背景将完全清晰</p>
        </div>
      </div>

      <DisclaimerFooter />
    </section>
  )
}
