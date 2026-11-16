import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Empty } from '../Empty';
import { Skeleton } from '../Skeleton';
import './Table.css';

/** 表格状态，对应 Figma 变体属性 `State`（`default` / `empty` / `loading`）。 */
export type TableState = 'default' | 'empty' | 'loading';

/** 表格 props。透传所有原生属性（`style` / `id` / `aria-*` …）。 */
export interface TableProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 表格状态，映射 Figma 变体属性 `State`。
   * `empty` / `loading` 时**保留表头**（Figma 的两个变体都带 42px 表头行），
   * 占位内容由组件插入到表头下方。
   * @default 'default'
   */
  state?: TableState;
  /**
   * 表格内容。
   * `state="default"`：给 `<colgroup>` + `<thead>` + `<tbody>`（行用 `TableRow`）；
   * `state="empty"` / `"loading"`：只给 `<colgroup>` + `<thead>`，占位内容由组件生成。
   */
  children?: ReactNode;
  /**
   * `state="empty"` 的占位内容，对应 Figma 内嵌的 `Empty` 实例（`Type=empty`）。
   * 不传时渲染 `<Empty type="empty" />`（文案与图标与 Figma 完全一致）。
   */
  emptyContent?: ReactNode;
  /**
   * `state="loading"` 的骨架行数，对应 Figma 加载态里的 3 行 `Skeleton Type=line, Size=md`。
   * Figma 的 3 只是示例值：真实行数请按数据量传；小于 1 或非整数会被钳制为 ≥1 的整数。
   * @default 3
   */
  loadingRows?: number;
}

/**
 * 表格容器。事实来源：Figma 组件集 `Table`（node `56065:6970`），3 个变体 = `State`。
 *
 * - 根节点是带圆角/描边/裁切的卡片容器（720 参考宽、`--vm-bg-card`、`--vm-radius-card`、`clip: true`），
 *   真正的表格语义在内部的 `<table class="vm-table__grid">` 上；
 * - `empty` / `loading` 保留表头，分别在表头下方插入 `Empty` 与骨架行；
 * - 列宽不写死：由调用方用 `<colgroup>` 给出 Figma 的示例列宽 60/240/160/140/120。
 */
export const Table = forwardRef<HTMLDivElement, TableProps>(function Table(
  { state = 'default', children, emptyContent, loadingRows = 3, className, ...rest },
  ref,
) {
  const rootClass = ['vm-table', `vm-table--${state}`, className ?? ''].filter(Boolean).join(' ');
  const rowCount = Math.max(1, Math.trunc(Number.isFinite(loadingRows) ? loadingRows : 3));

  return (
    <div {...rest} ref={ref} className={rootClass} data-state={state}>
      <table className="vm-table__grid">{children}</table>

      {state === 'empty' ? (
        <div className="vm-table__empty">{emptyContent ?? <Empty type="empty" />}</div>
      ) : null}

      {state === 'loading' ? (
        <div className="vm-table__loading" aria-busy="true" aria-live="polite">
          {Array.from({ length: rowCount }, (_, index) => (
            <div className="vm-table__loading-row" key={index}>
              {/* Figma: Skeleton 实例 Type=line, Size=md（200×12，填充 --vm-white-7） */}
              <Skeleton type="line" size="md" />
            </div>
          ))}
          <span className="vm-table__loading-hint">内容加载中</span>
        </div>
      ) : null}
    </div>
  );
});
