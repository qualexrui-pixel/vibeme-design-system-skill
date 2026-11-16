import { forwardRef, type ButtonHTMLAttributes } from 'react';
import './Tabs.css';

/** 标签页样式，对应 Figma 变体属性 `Type`（`line` 下划线 / `pill` 胶囊）。 */
export type TabsType = 'line' | 'pill';

/**
 * 标签页项 props。事实来源：Figma 组件集 `Tabs`（node `56064:6651`），
 * 8 个变体 = `Type`(line / pill) × `State`(default / hover / selected / disabled)。
 *
 * 原生 `type`（submit / reset / button）已从 props 中剔除：这个 `type` 是 Figma 的样式轴，
 * 组件内部固定渲染 `type="button"`，标签页永远不会触发所在表单提交。
 */
export interface TabsProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /**
   * 样式类型，映射 Figma 变体属性 `Type`。
   * `line` 是下划线式（选中时底部 2px 品牌色指示条），`pill` 是胶囊式（选中时换底色）。默认 `line`。
   */
  type?: TabsType;
  /**
   * 选中态，映射 Figma 变体 `State=selected`；会同步输出到 `aria-selected`
   * （`role="tab"` 要求该属性始终存在，所以 `false` 也会写出来）。默认 `false`。
   */
  selected?: boolean;
}

/**
 * 标签页项（单个 tab）。对应 Figma 的一条 `Tabs` 变体，需要放进 `role="tablist"` 容器里成组使用。
 *
 * - `Type=line`：无底色，文字 `--vm-text-secondary`（`Text/Text-Secondary`）；选中时文字换成
 *   `--vm-brand`（`Brand/Brand`）并在底部画一条 2px 品牌色指示条；
 * - `Type=pill`：圆角 `--vm-radius-full`，hover 底色 `--vm-surface-hover`（`Background/Surface-hover`），
 *   选中底色 `--vm-surface-selected`（`Background/Surface-selected`）＋ 品牌色文字；
 * - `hover` 是前景/描边换 token 的手法（**没有**白色叠加层），由 CSS `:hover` 触发，不是 prop；
 * - `disabled` 走原生属性，只加 `opacity: var(--vm-opacity-disabled)`。
 */
export const Tabs = forwardRef<HTMLButtonElement, TabsProps>(function Tabs(
  { type = 'line', selected = false, disabled, className, children, ...rest },
  ref,
) {
  const rootClass = [
    'vm-tabs',
    `vm-tabs--${type}`,
    selected ? 'vm-tabs--selected' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      role="tab"
      className={rootClass}
      aria-selected={selected}
      disabled={disabled}
    >
      {/* Figma: TEXT「标签页」—— Heading/S（Poppins SemiBold 14/20） */}
      <span className="vm-tabs__label vm-type-heading-s">{children}</span>
    </button>
  );
});
