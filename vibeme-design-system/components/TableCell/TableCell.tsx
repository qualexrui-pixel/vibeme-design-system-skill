import { forwardRef, type ReactNode, type TdHTMLAttributes } from 'react';
import './TableCell.css';

/** 单元格内容类型，对应 Figma 变体属性 `Type`（`text` / `number` / `status` / `action`）。 */
export type TableCellType = 'text' | 'number' | 'status' | 'action';

/** 单元格 props。透传所有 `<td>` 原生属性（`colSpan` / `rowSpan` / `headers` …）。 */
export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /**
   * 单元格类型，映射 Figma 变体属性 `Type`。
   * Figma 四个变体的尺寸、内边距、填充、描边完全一致，只有文字色不同：
   * `text` / `number` → `--vm-text-primary`；`status` → `--vm-status-success`；
   * `action` → `--vm-text-action`。
   * @default 'text'
   */
  type?: TableCellType;
  /**
   * 单元格内容，对应 Figma 里唯一的 TEXT 层（`文本内容` / `1,234` / `已完成` / `编辑`）。
   * 需要交互时请放真实的 `<button>` / `<a>`，不要放被样式化的 `div`。
   */
  children?: ReactNode;
}

/**
 * 表格单元格。事实来源：Figma 组件集 `TableCell`（node `56065:6816`），4 个变体 = `Type`。
 *
 * - 渲染真实 `<td>`，必须放在 `<tr>` 内（表头请用 `TableRow` 的 `Type=header`）；
 * - Figma 里没有 `State` 轴，因此 **没有** hover / pressed / disabled 这些 prop，
 *   悬停与选中由 `TableRow` 的 CSS 与 `selected` prop 负责；
 * - 内边距 12/16 px 来自 `space/space-3`、`space/space-4`，即 `--vm-space-3` / `--vm-space-4`。
 */
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { type = 'text', className, children, ...rest },
  ref,
) {
  const rootClass = ['vm-table-cell', `vm-table-cell--${type}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <td {...rest} ref={ref} className={rootClass} data-type={type}>
      <span className="vm-table-cell__content vm-type-heading-body-s-regular">{children}</span>
    </td>
  );
});
