import { forwardRef, useState, type CSSProperties, type InputHTMLAttributes } from 'react';
import './Slider.css';

/** 把数值钳在 [lo, hi] 内；非有限数（NaN / undefined）取 lo。 */
function clamp(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.min(Math.max(n, lo), hi);
}

/**
 * 滑块 props。
 *
 * 事实来源：Figma 组件集 `Slider`（node `56059:6522`），
 * 9 个变体 = `State`(default/hover/disabled) × `Value`(0/50/100)。
 * `Value` 是**数值语义**的变体，Figma 里的 `0` / `50` / `100` 只是三个示例样本，
 * 代码里要接真实数值：`value`（受控）/ `defaultValue`（非受控）+ `min` / `max` / `step`。
 *
 * Figma 的 Slider **没有** TEXT 属性，也没有 label 层：读屏名字要靠 `aria-label` /
 * `aria-labelledby`，或外部 `<label htmlFor>` 配 `id`。
 */
export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'value' | 'defaultValue'> {
  /**
   * 当前值，映射 Figma 变体属性 `Value`（Figma 里是 `0` / `50` / `100` 三个样本）。
   * 传给原生 `input[type=range]` 的 `value`，属于受控用法：给了 `value` 就要同时给 `onChange`。
   * 越界值会被钳到 `[min, max]`。默认不传（非受控）。
   */
  value?: number;
  /**
   * 非受控初始值，映射 Figma 变体属性 `Value` 的默认档 `Value=0`。
   * 只在非受控时生效，默认等于 `min`。
   */
  defaultValue?: number;
  /** 取值下限，默认 `0`（Figma 的 `Value=0` 是左端）。 */
  min?: number;
  /** 取值上限，默认 `100`（Figma 的 `Value=100` 是右端）。 */
  max?: number;
  /** 步进，默认 `1`；连续取值的场景（音量、亮度）可按需改成 `0.1` 等。 */
  step?: number;
}

/**
 * 滑块。事实来源：Figma 组件集 `Slider`（node `56059:6522`），
 * 9 个变体 = `State`(default/hover/disabled) × `Value`(0/50/100)。
 *
 * - 语义元素是原生 `<input type="range">`：键盘（←/→、Home/End、PageUp/PageDown）、
 *   `role="slider"`、`aria-valuenow/min/max`、表单提交全部由浏览器提供；
 * - Figma 的 `State=hover` 事实是**换前景 token**（进度条 `Brand/Brand` → `Brand/Brand-Hover`），
 *   不是叠加 `--vm-white-7`，与本组件的 hover 实现一一对应；
 * - `State=disabled` 用原生 `disabled`，视觉只加 `--vm-opacity-disabled`（0.38），轨道与拇指不换色；
 * - 轨道 / 进度 / 拇指分别对应 Figma 默认变体里的三个子 Frame，本实现用两个装饰 `<span>`
 *   加原生 thumb 伪元素表达，不用 div 假装控件。
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(props, ref) {
  const {
    value,
    defaultValue,
    min = 0,
    max = 100,
    step = 1,
    className,
    style,
    onChange,
    ...rest
  } = props;

  // 非受控时自己记住当前值，仅为算进度条百分比；受控时以 value 为准
  const [innerValue, setInnerValue] = useState<number>(() => clamp(defaultValue ?? min, min, max));
  const current = clamp(value ?? innerValue, min, max);
  const progress = max > min ? clamp((current - min) / (max - min), 0, 1) * 100 : 0;

  const rootClass = ['vm-slider', className].filter(Boolean).join(' ');
  // 进度百分比只传一个 CSS 变量，颜色的选择留在 CSS（默认 Brand/Brand，hover 换 Brand/Brand-Hover）
  const rootStyle = { ...style, '--slider-progress': `${progress}%` } as CSSProperties;

  return (
    <span className={rootClass} style={rootStyle}>
      {/* Figma: Frame（轨道，320×4，White/White-6）——纯装饰 */}
      <span className="vm-slider__track" aria-hidden="true" />
      {/* Figma: Frame（进度，宽 = Value%，Brand/Brand）——纯装饰，宽度走 --slider-progress */}
      <span className="vm-slider__fill" aria-hidden="true" />
      {/* Figma: Frame（拇指，16×16，White/White-0 + Scrim/scrim-modal 1px 描边）——
          这里交给原生 range 的 thumb 伪元素画，input 本身透明地铺满整条轨道 */}
      <input
        {...rest}
        ref={ref}
        type="range"
        className="vm-slider__input"
        min={min}
        max={max}
        step={step}
        value={value === undefined ? undefined : current}
        defaultValue={value === undefined ? clamp(defaultValue ?? min, min, max) : undefined}
        onChange={(event) => {
          if (value === undefined) setInnerValue(Number(event.currentTarget.value));
          onChange?.(event);
        }}
      />
    </span>
  );
});
