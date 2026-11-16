import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import './Grid.css';

/**
 * 网格容器 props。除 `columns` 之外的原生 `div` 属性（`id` / `style` / `aria-*` / 事件…）
 * 一律透传；传进来的 `style` 会与内部的 `grid-template-columns` 合并，不会互相覆盖。
 */
export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 列数，对应 Figma 变体属性 `Columns`。
   * Figma 只画了 `2` / `3` / `4` 三个变体，但列数是**数值语义**：这里接受任意正整数
   * （`1` 以上都合法），内部按 `Math.floor` 取整、下限钳到 `1`；非数字或 `NaN` 回落到默认值。
   * 列宽恒为等分（Figma 里 `Columns=2` 的两格是 352、`Columns=4` 是 168，
   * 都是 `(720 − (n−1) × 16) / n`），不会按内容宽度收缩。
   * @default 2
   */
  columns?: number;
}

/** 把外部传入的列数归一成 ≥1 的整数，非法值回落到默认 2。 */
function normalizeColumns(columns: number | undefined): number {
  if (typeof columns !== 'number' || !Number.isFinite(columns)) return 2;
  return Math.max(1, Math.floor(columns));
}

/**
 * 网格容器。事实来源：Figma 组件集 `Grid`（node `56066:6344`），
 * 3 个变体 = `Columns`(2 / 3 / 4)；行列间距都绑 `space/space-4`（16px）。
 *
 * 结构事实：Figma 的根节点是 `VERTICAL gap 16`，每一行是 `HORIZONTAL gap 16`，
 * 行内每格 `layoutSizingHorizontal=FILL`（等分宽度）。这在 CSS 里等价于
 * `display: grid` + `grid-template-columns: repeat(n, minmax(0, 1fr))` + `gap: --vm-space-4`，
 * 因此代码用单层 grid 实现，而不是嵌套的 flex 行 —— 层数少了，跨行对齐也天然成立。
 *
 * Figma 里那些 `White/White-9` 填充、`Background/border-default` 描边、`Radious/radius-md`
 * 圆角的格子是**演示内容**（里面只放了一个 `Caption/Label` 的数字），不属于 Grid 本体；
 * Grid 自身没有填充、描边与圆角，外观全部由 `children` 决定。
 */
export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid(props, ref) {
  const { columns, className, style, children, ...rest } = props;
  const count = normalizeColumns(columns);

  const classes = ['vm-grid', className ?? ''].filter(Boolean).join(' ');

  // 列数走内联样式：它是真数值（任意正整数），不是有限的枚举档位，因此不进 CSS 类名。
  // 合并顺序保证调用方传进来的 style 仍可覆盖其它属性。
  const mergedStyle: CSSProperties = {
    gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
    ...style,
  };

  return (
    <div {...rest} ref={ref} className={classes} style={mergedStyle} data-columns={count}>
      {children}
    </div>
  );
});
