import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import './Radio.css';

/** 尺寸档位，对应 Figma 变体属性 `Size`（sm 圆圈 16 / md 圆圈 20，px）。 */
export type RadioSize = 'sm' | 'md';

/**
 * 单选框 props。
 *
 * 事实来源：Figma 组件集 `Radio`（node `56059:6471`），8 个变体 = `Size` × `Selected` × `State`。
 * Figma 的 `label`（TEXT）映射成 `children`；`Selected` 映射成原生 `checked`；
 * `State=disabled` 映射成原生 `disabled`；`State=default` 是唯一的交互态，由 CSS 实现。
 */
export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'children'> {
  /**
   * 尺寸档位，映射 Figma 属性 `Size`（`sm` / `md`）。
   * 决定圆圈直径（16 / 20）、标签字号与圆圈到文字的间距。默认 `md`（Figma 默认变体）。
   */
  size?: RadioSize;
  /**
   * 标签文字，映射 Figma 的 TEXT 属性 `label`。
   * Figma 的示例内容是 `Label`，这里用 `children` 承接任意节点。
   */
  children?: ReactNode;
}

/**
 * 单选框（含标签）。事实来源：Figma 组件集 `Radio`（node `56059:6471`），
 * 8 个变体 = `Size`(sm/md) × `Selected`(false/true) × `State`(default/disabled)。
 *
 * - `Selected` / `State=disabled` 做成 props，并分别映射到原生 `checked` 与原生 `disabled`；
 * - 同组的互斥交给原生 `name`，**不要**在组件里维护全局状态；
 * - 组件内部**没有** `hover` / `focus` / `pressed` 变体，没有 `error`、`indeterminate`、
 *   `description` 这些 Figma 未定义的 prop，不要凭别的组件集往里加。
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(props, ref) {
  const { size = 'md', className, children, ...rest } = props;

  const rootClass = ['vm-radio', `vm-radio--${size}`, className].filter(Boolean).join(' ');
  // 文字样式类：sm 对应 Figma 的 Caption/Caption，md 对应 Heading/Body/S/Regular
  const labelClass = [
    'vm-radio__label',
    size === 'sm' ? 'vm-type-caption-caption' : 'vm-type-heading-body-s-regular',
  ].join(' ');

  return (
    <label className={rootClass}>
      {/* 真实语义元素：原生 input 承担 checked / disabled / name / 键盘与表单提交 */}
      <input {...rest} ref={ref} type="radio" className="vm-radio__input" />
      {/* 纯装饰的外圈＋内点，两份形状都只由 CSS 画，Figma 里没有任何图标实例 */}
      <span className="vm-radio__mark" aria-hidden="true" />
      <span className={labelClass}>{children}</span>
    </label>
  );
});
