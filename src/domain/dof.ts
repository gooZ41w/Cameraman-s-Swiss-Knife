/**
 * 景深计算模块
 * 所有输入/输出均使用毫米为单位
 */

export interface DofResult {
  /** 超焦距（毫米） */
  H_mm: number
  /** 景深近界（毫米） */
  D_n_mm: number
  /** 景深远界（毫米） */
  D_f_mm: number
  /** 全景深（毫米） */
  delta_D_mm: number
  /** 几何容差下界（±5%） */
  tolerance_lower_mm: number
  /** 几何容差上界（±5%） */
  tolerance_upper_mm: number
}

/**
 * 计算超焦距
 * @param f_mm 物理焦距（毫米）
 * @param N 光圈系数
 * @param c_mm 弥散圆直径（毫米）
 * @returns 超焦距（毫米）
 */
export function computeHyperfocal(f_mm: number, N: number, c_mm: number): number {
  return (f_mm * f_mm) / (N * c_mm) + f_mm
}

/**
 * 计算景深近界
 * @param s_mm 对焦距离（毫米）
 * @param H_mm 超焦距（毫米）
 * @param f_mm 物理焦距（毫米）
 * @returns 景深近界（毫米）
 */
export function computeNearBoundary(s_mm: number, H_mm: number, f_mm: number): number {
  return (s_mm * (H_mm - f_mm)) / (H_mm + s_mm - 2 * f_mm)
}

/**
 * 计算景深远界
 * @param s_mm 对焦距离（毫米）
 * @param H_mm 超焦距（毫米）
 * @param f_mm 物理焦距（毫米）
 * @returns 景深远界（毫米），若为无穷远则返回 Infinity
 */
export function computeFarBoundary(s_mm: number, H_mm: number, f_mm: number): number {
  const denominator = H_mm - s_mm
  if (denominator <= 0) {
    return Infinity
  }
  return (s_mm * (H_mm - f_mm)) / denominator
}

/**
 * 计算全景深
 * @param D_n_mm 景深近界（毫米）
 * @param D_f_mm 景深远界（毫米）
 * @returns 全景深（毫米），若远界为无穷远则返回 Infinity
 */
export function computeDepthOfField(D_n_mm: number, D_f_mm: number): number {
  if (!isFinite(D_f_mm)) {
    return Infinity
  }
  return D_f_mm - D_n_mm
}

/**
 * 计算 ±5% 几何容差边界
 * @param value 中心值（毫米）
 * @returns [下界, 上界]
 */
export function computeTolerance(value: number): [number, number] {
  if (!isFinite(value)) {
    return [value, value]
  }
  const tolerance = value * 0.05
  return [value - tolerance, value + tolerance]
}

/**
 * 完整景深计算（包含容差）
 * @param f_mm 物理焦距（毫米）
 * @param N 光圈系数
 * @param s_mm 对焦距离（毫米）
 * @param c_mm 弥散圆直径（毫米）
 * @returns 完整景深结果含容差
 */
export function computeFullDof(f_mm: number, N: number, s_mm: number, c_mm: number): DofResult {
  const H_mm = computeHyperfocal(f_mm, N, c_mm)
  const D_n_mm = computeNearBoundary(s_mm, H_mm, f_mm)
  const D_f_mm = computeFarBoundary(s_mm, H_mm, f_mm)
  const delta_D_mm = computeDepthOfField(D_n_mm, D_f_mm)

  const [tol_lower, tol_upper] = computeTolerance(delta_D_mm)

  return {
    H_mm,
    D_n_mm,
    D_f_mm,
    delta_D_mm,
    tolerance_lower_mm: tol_lower,
    tolerance_upper_mm: tol_upper,
  }
}
