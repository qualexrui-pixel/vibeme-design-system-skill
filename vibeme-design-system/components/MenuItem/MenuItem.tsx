import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import './MenuItem.css';

/**
 * 菜单项 props。事实来源：Figma 组件集 `MenuItem`（node `56064:6789`），
 * 4 个变体 = `State`（`default` / `hover` / `selected` / `disabled`）。
 *
 * 交互态**不做 prop**：`State=hover` 由 CSS `:hover` 触发，`State=disabled` 走原生 `disabled`；
 * 只有应用态 `State=selected` 才是 `selected`。文本走 `children`（对应 Figma 的 TEXT 属性 `label`）。
 */
export interface MenuItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /**
   * 选中态，映射 Figma 变体 `State=selected`：底色换成 `--vm-surface-selected`
   * （`Background/Surface-selected` #2A2A2A），文字与图标换成 `--vm-brand`（`Brand/Brand` #FFCC90），
   * 并在行尾补一个 14×14 的 `circle-check-filled` 对勾（Figma 只在 selected 变体里有这个实例）。
   * 同时输出 `aria-current="true"`。默认 `false`（对应 `State=default`）。
   */
  selected?: boolean;
  /**
   * 行首 16×16 图标插槽。Figma 每个变体的第一个子节点都是一个 `folder-line` 图标实例
   * （`Line icon` 16×16，矢量 12.74×12.33），但组件集里**没有** INSTANCE_SWAP 属性 ——
   * 示例图标是写死的，所以代码里开成插槽：不传时不渲染图标，宽度由标签自己撑开。
   */
  icon?: ReactNode;
}

/**
 * 菜单项。`图标 + 文本（+ 选中对勾）` 的横向行，由 `State` 覆盖 默认 / 悬停 / 选中 / 禁用 四种外观。
 *
 * - 根节点是 `<li role="none">`，**应当**放进 `role="menu"` 的容器（如 Dropdown 的面板）里；
 *   可点的实体是内部的 `<button role="menuitem">`，`...rest`（`onClick` / `disabled` / `aria-*` …）
 *   与 `ref` 都落在 button 上，`className` 落在 `<li>` 上（与 ListItem 一致）。
 * - `hover` / `active` / `focus-visible` 都是伪类，不是 prop。
 */
export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(function MenuItem(
  { selected = false, icon, children, className, ...rest },
  ref,
) {
  const rootClass = ['vm-menu-item', selected ? 'vm-menu-item--selected' : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <li className={rootClass}>
      <button
        {...rest}
        ref={ref}
        type="button"
        role="menuitem"
        className="vm-menu-item__action"
        aria-current={selected ? 'true' : undefined}
      >
        {icon ? (
          <span className="vm-menu-item__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {/* Figma: TEXT「菜单项」—— Heading/Body/S/Regular（Poppins Regular 14/20） */}
        <span className="vm-menu-item__label vm-type-heading-body-s-regular">{children}</span>
        {selected ? (
          <span className="vm-menu-item__check" aria-hidden="true">
            {/* Figma: circle-check-filled（Filled icon 实例 14×14，矢量 12.25×12.25）。
                此处为等义几何示意，建议从 Figma 取原始矢量。 */}
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              />
            </svg>
          </span>
        ) : null}
      </button>
    </li>
  );
});
