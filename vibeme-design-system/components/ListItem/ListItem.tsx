import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import './ListItem.css';

/**
 * 列表项 props。事实来源：Figma 组件集 `List`（node `56061:6504`），
 * 4 个变体 = `State`（`default` / `hover` / `selected` / `disabled`）。
 *
 * 交互态不做 prop：`State=hover` 由 CSS `:hover` 触发，`State=disabled` 走原生 `disabled`，
 * 只有应用态 `State=selected` 才是 `selected`。标题走 `children`，第二行走 `description`。
 */
export interface ListItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /**
   * 选中态，映射 Figma 变体 `State=selected`（底色换成 `--vm-surface-selected`）。
   * 同时输出 `aria-current="true"`，让读屏能播报当前项。默认 `false`（对应 `State=default`）。
   */
  selected?: boolean;
  /**
   * 左侧头像插槽。Figma 的默认变体里放的是一个 `Size=md` 的 Avatar 实例（40×40，initial 文字 `A`），
   * 这里只提供 40×40 的槽位；圆形底、1px 描边、字色仍由 Avatar 组件按自己的 token 画。
   */
  avatar?: ReactNode;
  /**
   * 第二行辅助说明，对应 Figma 文本层「辅助说明文字」（文字样式 `Caption/Caption`，12/18）。
   * 不传时不渲染该行，标题在行内垂直居中。默认 `undefined`。
   */
  description?: ReactNode;
}

/**
 * 列表项 / 会话行。`Avatar + 标题（+ 辅助说明）+ chevron` 的横向排列，
 * 由 `State` 覆盖 默认 / 悬停 / 选中 / 禁用 四种外观。
 *
 * - 根节点是 `<li>`，**必须**放进 `<ul>` / `<ol>` 里；可点的实体是内部的 `<button type="button">`，
 *   `...rest`（`onClick` / `aria-*` / `disabled` …）与 `ref` 都落在 button 上，`className` 落在 `<li>` 上。
 * - `hover` / `focus-visible` 是伪类，不是 prop；`selected` / `disabled` 才是应用态。
 */
export const ListItem = forwardRef<HTMLButtonElement, ListItemProps>(function ListItem(
  { selected = false, disabled = false, avatar, description, children, className, ...rest },
  ref,
) {
  const rootClass = ['vm-list-item', selected ? 'vm-list-item--selected' : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <li className={rootClass}>
      <button
        {...rest}
        ref={ref}
        type="button"
        className="vm-list-item__action"
        disabled={disabled}
        aria-current={selected ? 'true' : undefined}
      >
        {avatar ? <span className="vm-list-item__avatar">{avatar}</span> : null}
        <span className="vm-list-item__text">
          <span className="vm-list-item__title vm-type-heading-s">{children}</span>
          {description ? (
            <span className="vm-list-item__description vm-type-caption-caption">{description}</span>
          ) : null}
        </span>
        <span className="vm-list-item__chevron" aria-hidden="true">
          {/* Figma: chevron-right_filled（Filled icon 实例，16×16，矢量 7.52×12.12） */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
            <path d="M4.24 1.94 L11.76 8 L4.24 14.06 L4.24 10.4 L8 8 L4.24 5.6 Z" fill="currentColor" />
          </svg>
        </span>
      </button>
    </li>
  );
});
