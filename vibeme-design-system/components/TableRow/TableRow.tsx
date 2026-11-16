import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import './TableRow.css';

/** 行类型，对应 Figma 变体属性 `Type`（`header` 表头 / `body` 数据行）。 */
export type TableRowType = 'header' | 'body';

/** 表格行 props。透传所有 `<tr>` 原生属性。 */
export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /**
   * 行类型，映射 Figma 变体属性 `Type`。
   * `header`：底色 `--vm-bg-panel`，行内文字覆盖为 Caption/Caption + `--vm-text-secondary`（Figma 默认变体）；
   * `body`：默认无填充，`:hover` 换成 `--vm-surface-hover`。
   * @default 'header'
   */
  type?: TableRowType;
  /**
   * 选中态，映射 Figma 变体 `State=selected`（底色换成 `--vm-surface-selected`），
   * 同时输出 `aria-selected="true"`。
   * 交互态 `State=hover` **不是 prop**，由 CSS `:hover` 触发。
   * @default false
   */
  selected?: boolean;
  /**
   * 行内单元格，通常是 `TableCell`（表头行也可以直接写 `<th scope="col">`，
   * 本组件会把它的文字规格覆盖成 Caption/Caption）。
   */
  children?: ReactNode;
}

/**
 * 表格行。事实来源：Figma 组件集 `TableRow`（node `56065:6886`），
 * 6 个变体 = `Type`(header / body) × `State`(default / hover / selected)。
 *
 * - 渲染真实 `<tr>`，父级必须是 `<thead>` / `<tbody>`；
 * - 分隔线是行自身的 `border-bottom`（Figma 里行描边只有 `strokeBottomWeight=1`），
 *   所以外层 `<table>` 需要 `border-collapse: collapse`（`Table` 组件已设）；
 * - 列宽 60/240/160/140/120 是 Figma 的示例列宽，由调用方用 `<colgroup>` 控制，组件不写死。
 */
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { type = 'header', selected = false, className, children, ...rest },
  ref,
) {
  const rootClass = [
    'vm-table-row',
    `vm-table-row--${type}`,
    selected ? 'vm-table-row--selected' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <tr {...rest} ref={ref} className={rootClass} aria-selected={selected || undefined}>
      {children}
    </tr>
  );
});
