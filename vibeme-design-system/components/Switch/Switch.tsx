import { forwardRef, type InputHTMLAttributes } from 'react';
import './Switch.css';

/** 尺寸档位，对应 Figma 变体属性 `Size`（sm 轨道 36×20 / md 轨道 44×24，px）。 */
export type SwitchSize = 'sm' | 'md';

/**
 * 开关 props。
 *
 * 事实来源：Figma 组件集 `Switch`（node `56059:6488`），
 * 8 个变体 = `Size`(sm/md) × `Checked`(false/true) × `State`(default/disabled)。
 * Figma 的 `Checked` 映射成原生 `checked`，`State=disabled` 映射成原生 `disabled`。
 *
 * Figma 的 Switch **没有** TEXT 属性（组件里只有「轨道 + 拇指」两个 Frame，没有文字），
 * 所以这里不提供标签插槽：需要可见标签时在外部写 `<label htmlFor>` 配 `id`，
 * 只需要读屏可读时传 `aria-label` / `aria-labelledby`（这两个属性会原样透传）。
 */
export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'role'> {
  /**
   * 尺寸档位，映射 Figma 属性 `Size`（`sm` / `md`）。
   * 决定轨道尺寸（36×20 / 44×24）与拇指直径（12 / 16）。默认 `md`（Figma 默认变体）。
   */
  size?: SwitchSize;
}

/**
 * 开关。事实来源：Figma 组件集 `Switch`（node `56059:6488`），
 * 8 个变体 = `Size`(sm/md) × `Checked`(false/true) × `State`(default/disabled)。
 *
 * - 根节点是 `<label>`，内部是真实的 `<input type="checkbox" role="switch">`：
 *   `Space` 切换、可聚焦、可随表单提交，视觉（轨道 + 拇指）全部由 CSS 画；
 * - Figma 的 `State` 轴**只有** `default` / `disabled`，没有 `hover` / `focus` / `pressed`，
 *   所以本组件不发明 hover 高亮，只保留键盘 `:focus-visible` 光环；
 * - 「点击立刻生效」的语义与 Checkbox 不同：这里不需要提交按钮，勾上就该触发副作用。
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(props, ref) {
  const { size = 'md', className, ...rest } = props;

  const rootClass = ['vm-switch', `vm-switch--${size}`, className].filter(Boolean).join(' ');

  return (
    <label className={rootClass}>
      {/* role="switch" 让读屏念「开关」而不是「复选框」；键盘与表单行为仍由原生 checkbox 提供 */}
      <input {...rest} ref={ref} type="checkbox" role="switch" className="vm-switch__input" />
      {/* 拇指：Figma 里的 `Frame`（md 16×16 / sm 12×12，1:1，圆角 999），纯装饰 */}
      <span className="vm-switch__thumb" aria-hidden="true" />
    </label>
  );
});
