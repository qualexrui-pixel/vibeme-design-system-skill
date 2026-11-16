import { forwardRef, type HTMLAttributes } from 'react';
import './Progress.css';

/** `value` 的合法区间：Figma 只有 25/50/75/100 四个样本，真实数值按 0–100 百分比解释。 */
const MIN = 0;
const MAX = 100;

function clamp(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return MIN;
  return Math.min(MAX, Math.max(MIN, value));
}

/**
 * 线性进度条 props。事实来源：Figma 组件集 `Progress`（node `56063:6832`），
 * 4 个变体只有一个属性轴 `Value`（25 / 50 / 75 / 100）。
 */
export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 进度值（百分比），映射 Figma 变体属性 `Value`。
   * Figma 只画了 `25` / `50` / `75` / `100` 四个样本档，这里接受 0–100 的**任意实数**：
   * 小于 0 钳到 0，大于 100 钳到 100，`NaN` / 非有限数按 0 处理。
   * 默认 `25`（与 Figma 的默认变体 `Value=25` 一致）。
   */
  value?: number;
}

/**
 * 线性进度条。轨道 `--vm-white-6`（`White/White-6` 12% 白）＋ 品牌色进度段 `--vm-brand`（`Brand/Brand` #FFCC90），
 * 两端圆角 `--vm-radius-full`（`Radious/radius-full` 999px），高度固定 6px、宽度跟随容器（Figma 参考宽 320）。
 *
 * 纯展示组件：Figma 的 4 个变体只区分 `Value`，没有 hover / pressed / disabled 等状态变体，
 * 因此这里也没有任何交互 prop —— 状态只由 `value` 表达。
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value = 25, className, style, ...rest },
  ref,
) {
  const percent = clamp(value);
  const rootClass = ['vm-progress', className ?? ''].filter(Boolean).join(' ');

  return (
    <div
      {...rest}
      ref={ref}
      className={rootClass}
      style={style}
      role="progressbar"
      aria-valuemin={MIN}
      aria-valuemax={MAX}
      aria-valuenow={percent}
    >
      {/* Figma: Frame（进度段）—— 宽 = 轨道宽 × value%，Value=25 时实测 80 / 320 */}
      <div className="vm-progress__fill" style={{ width: `${percent}%` }} />
    </div>
  );
});
