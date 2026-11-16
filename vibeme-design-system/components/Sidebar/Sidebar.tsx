import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import './Sidebar.css';

/**
 * 侧边导航 props。事实来源：Figma 组件集 `Sidebar`（node `56064:6840`），
 * 2 个变体 = `State`（`expanded` 240×320 / `collapsed` 64×320）。
 *
 * `State` 只有展开/折叠两档，没有 hover/pressed 之类的交互态，所以做成布尔 prop `collapsed`。
 * 标题走 `title`（Figma 的 TEXT 层「VibeMe」），导航行用 `SidebarItem` 放进 `children`。
 */
export interface SidebarProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /**
   * 折叠态，映射 Figma 变体 `State=collapsed`（宽 64、只留 32×32 的图标方块）。
   * 默认 `false`，即 Figma 的默认变体 `State=expanded`（宽 240、图标 ＋ 文字）。
   */
  collapsed?: boolean;
  /**
   * 展开态的标题文字，对应 Figma 的第一个子节点 TEXT「VibeMe」
   * （文字样式 `Heading/M`，Poppins SemiBold 16/24 → `.vm-type-heading-m`，`Text/Text-Primary`）。
   */
  title?: ReactNode;
  /**
   * 折叠态的品牌首字母方块内容。Figma 的 `State=collapsed` 变体把标题换成了一个 32×32、
   * 圆角 6px 的方块，里面是品牌色的「V」（`Brand/Brand` #FFCC90，`Heading/M`）。
   * 不传时：`title` 是字符串就取首字符，否则直接复用 `title`。默认 `undefined`。
   */
  monogram?: ReactNode;
}

/**
 * 侧边导航容器。`标题（或折叠时的首字母方块）＋ 导航行` 的纵向排列，
 * 由 `State` 覆盖 展开 / 折叠 两种布局。
 *
 * - 根节点是 `<nav>`，`...rest`（`aria-label` / `onClick` / …）与 `ref` 落在它身上；
 *   导航行是内部的 `<ul>` ＋ `SidebarItem`（`<li>` ＋ `<button>`）。
 * - 宽度：展开 240px（Figma FIXED 240）、折叠 64px（Figma FIXED 64），高度只给 `min-height: 320px`，
 *   实际高度交给外层容器（侧栏通常撑满视口）。
 */
export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { collapsed = false, title, monogram, children, className, ...rest },
  ref,
) {
  const rootClass = ['vm-sidebar', collapsed ? 'vm-sidebar--collapsed' : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  const monogramText =
    monogram ?? (typeof title === 'string' ? title.slice(0, 1) : title);

  return (
    <nav {...rest} ref={ref} className={rootClass} data-collapsed={collapsed || undefined}>
      <div className="vm-sidebar__header">
        {collapsed ? (
          /* Figma: State=collapsed 的 FRAME 32×32（圆角 6px）＋ TEXT「V」，品牌色 */
          <span className="vm-sidebar__monogram vm-type-heading-m">{monogramText}</span>
        ) : (
          /* Figma: TEXT「VibeMe」—— Heading/M（Poppins SemiBold 16/24） */
          <span className="vm-sidebar__title vm-type-heading-m">{title}</span>
        )}
      </div>
      <ul className="vm-sidebar__list">{children}</ul>
    </nav>
  );
});

/**
 * 侧边导航的一行。Figma 里它是 `Sidebar` 内部的普通 Frame（`208×36`，展开态），
 * **不是**独立组件集，所以没有自己的 slug，作为 `Sidebar` 的同文件子导出实现。
 *
 * - 根节点是 `<li>`，可点实体是 `<button type="button">`；`...rest` / `ref` 落在 button 上。
 * - `selected` 对应 Figma 里那一行被换成 `Background/Surface-selected` ＋ `Brand/Brand` 的状态；
 *   未选中行是 `Text/Text-Secondary`（64% 白）。hover 用伪类，不是 prop。
 */
export interface SidebarItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /**
   * 选中态：Figma 的 `State=expanded` / `State=collapsed` 里第一行都是选中行
   * （填充 `Background/Surface-selected`，图标与文字 `Brand/Brand`）。默认 `false`。
   * 同时输出 `aria-current="true"`。
   */
  selected?: boolean;
  /**
   * 行首 16×16 图标槽位，对应 Figma 行内的 `Line icon` 实例
   * （示例是 `folder-line` / `search-line` / `user-line`）。折叠态只显示它。
   */
  icon?: ReactNode;
}

/**
 * 侧边导航行。与 `MenuItem` 的区别：未选中时文字/图标是 `Text/Text-Secondary`（64% 白）
 * 而不是 `Text/Text-Primary`，行宽也随侧栏（展开 208 / 折叠 32）而不是固定值。
 */
export const SidebarItem = forwardRef<HTMLButtonElement, SidebarItemProps>(function SidebarItem(
  { selected = false, icon, children, className, ...rest },
  ref,
) {
  const rootClass = ['vm-sidebar__item-wrap', selected ? 'vm-sidebar__item-wrap--selected' : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <li className={rootClass}>
      <button
        {...rest}
        ref={ref}
        type="button"
        className="vm-sidebar__item"
        aria-current={selected ? 'true' : undefined}
      >
        {icon ? (
          <span className="vm-sidebar__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {/* Figma: TEXT「首页 / 发现 / 我的」—— Heading/Body/S/Regular（Poppins Regular 14/20） */}
        <span className="vm-sidebar__label vm-type-heading-body-s-regular">{children}</span>
      </button>
    </li>
  );
});
