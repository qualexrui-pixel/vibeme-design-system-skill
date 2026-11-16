import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import './Checkbox.css';

/** 尺寸档位，对应 Figma 变体属性 `Size`（sm 方块 16 / md 方块 20，px）。 */
export type CheckboxSize = 'sm' | 'md';

/**
 * 复选框 props。
 *
 * 事实来源：Figma 组件集 `Checkbox`（node `56059:6442`），
 * 12 个变体 = `Size`(sm/md) × `Checked`(false/true/indeterminate) × `State`(default/disabled)。
 * Figma 的 `label`（TEXT）映射成 `children`；`Checked` 映射成 `checked`；
 * `State=disabled` 映射成原生 `disabled`。
 */
export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'children' | 'checked'> {
  /**
   * 尺寸档位，映射 Figma 属性 `Size`（`sm` / `md`）。
   * 决定方块边长（16 / 20）、方块到文字的间距与标签字号。默认 `md`（Figma 默认变体）。
   */
  size?: CheckboxSize;
  /**
   * 勾选态，映射 Figma 属性 `Checked`（`false` / `true` / `indeterminate`）。
   * 传 `'indeterminate'` 时组件会写原生 `input.indeterminate`（半选，读屏报 mixed）。
   * 与原生 `defaultChecked` 一样属于受控用法：给了 `checked` 就必须同时给 `onChange`。
   */
  checked?: boolean | 'indeterminate';
  /**
   * 标签文字，映射 Figma 的 TEXT 属性 `label`（Figma 示例内容为 `Label`）。
   * 组件已用 `<label>` 包裹，点文字即可切换，不要再额外传 `id` + `htmlFor`。
   */
  children?: ReactNode;
}

/**
 * 复选框（含标签）。事实来源：Figma 组件集 `Checkbox`（node `56059:6442`），
 * 12 个变体 = `Size`(sm/md) × `Checked`(false/true/indeterminate) × `State`(default/disabled)。
 *
 * - `Checked` / `State=disabled` 做成 props，并分别映射到原生 `checked` 与原生 `disabled`；
 * - Figma 的 `State` 轴**没有** `hover` / `focus` / `pressed` 变体，所以本组件不发明 hover 视觉，
 *   只保留键盘 `:focus-visible` 光环（可访问性必需）；
 * - 同名复选框用同一个 `name` 提交，互不排斥；组内「全选」交给父级把子项状态聚合成
 *   `checked="indeterminate"`，组件自己不维护全局状态。
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(props, ref) {
  const { size = 'md', checked, className, children, ...rest } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  // 内部 ref 要写 indeterminate，外部 ref 也要生效：用 useImperativeHandle 转出去（与 Input 同一做法）
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  // `indeterminate` 只有 DOM 属性、没有 HTML attribute，必须在挂载/变化时写进去；
  // 写进去之后原生 input 会自动以「混合」状态暴露给辅助技术（不需要手写 aria-checked）。
  useLayoutEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = checked === 'indeterminate';
  }, [checked]);

  const rootClass = ['vm-checkbox', `vm-checkbox--${size}`, className].filter(Boolean).join(' ');
  // 文字样式：sm 走 Figma 的 Caption/Caption，md 走 Heading/Body/S/Regular
  const labelClass = [
    'vm-checkbox__label',
    size === 'sm' ? 'vm-type-caption-caption' : 'vm-type-heading-body-s-regular',
  ].join(' ');

  return (
    <label className={rootClass}>
      {/* 真实语义元素：原生 input 承担 checked / indeterminate / disabled / name / 表单提交 */}
      <input
        {...rest}
        ref={inputRef}
        type="checkbox"
        className="vm-checkbox__input"
        checked={typeof checked === 'boolean' ? checked : undefined}
      />
      {/* 方块是纯装饰（Figma 里的 FIXED Frame），形状与勾/横线全部由 CSS 与内联 SVG 画 */}
      <span className="vm-checkbox__box" aria-hidden="true">
        {/* Figma: Vector（勾），sm 9×6.5，描边 Neutral/Neutral-950 2px；此处等比画成 18×13 的 viewBox */}
        <svg className="vm-checkbox__check" viewBox="0 0 18 13" fill="none" aria-hidden="true">
          <path
            d="M1.5 7.2 6.6 11.5 16.5 1.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </span>
      <span className={labelClass}>{children}</span>
    </label>
  );
});
