import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import './Header.css';

/**
 * 顶栏内容形态，映射 Figma 变体属性 `Type`：
 * - `simple`：品牌 + 右侧操作区（Figma 里是「登录」「注册」两个 Button 实例）；
 * - `with-nav`：品牌 + 中间导航链接 + 右侧操作区；
 * - `with-search`：品牌 + 中间 `Search`（Figma 里 `wSizing=FILL`，会撑满中间剩余宽度）+ 右侧操作区。
 */
export type HeaderType = 'simple' | 'with-nav' | 'with-search';

/**
 * 顶栏 props。除 `type` / `brand` / `actions` / `children` 之外的原生属性
 * （`id` / `style` / `aria-*` / 事件…）一律透传到根 `<header>`。
 */
export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  /**
   * 内容形态，对应 Figma 变体属性 `Type`。
   * 只影响中间区的伸展方式：`with-search` 时中间区与右侧弹性空档平分剩余宽度
   * （Figma `Type=with-search` 的 `Search` 是 `FILL`、同时还有一个 `FILL` 空档）；
   * `simple` / `with-nav` 的中间区按内容宽。
   * @default 'simple'
   */
  type?: HeaderType;
  /**
   * 左侧品牌区内容，对应 Figma 里那个 16px `Heading/M` 的 `TEXT` 节点
   * （内容 `VibeMe`，色 `Text/Text-Primary`）。传 `ReactNode` 可换成 `<img>` logo。
   * @default 'VibeMe'
   */
  brand?: ReactNode;
  /**
   * 右侧操作区，对应 Figma 里的 `Button` 实例组（`Type=simple` 是 secondary「登录」＋ primary「注册」，
   * `Type=with-search` 只有 primary「搜索」）。按「内嵌关系直接用子组件」的约定，
   * 这里请自行传入 `<Button>`，组件不替你写死按钮文案。
   */
  actions?: ReactNode;
}

/**
 * 页面顶栏。事实来源：Figma 组件集 `Header`（node `56066:6374`），
 * 3 个变体 = `Type`(simple / with-nav / with-search)。
 *
 * 容器事实（三个变体完全一致）：`HORIZONTAL gap 24`、`padding 0/32/0/32`、
 * `FIXED 1200×64`、填充 `Background/bg-app`、描边只在底部 1px `Background/border-default`。
 * 变体之间的差别**只在于中间放了什么**，所以代码里 `type` 只切换中间区的伸展规则，
 * 其余样式由同一个 `.vm-header` 承担。
 *
 * 布局顺序（与 Figma 图层一一对应）：
 * `brand` → 中间区（`children`）→ 弹性空档（Figma 里那个 `FILL` 的 1px `Frame`）→ `actions`。
 * 空档是真实元素而不是 `margin-left: auto`，这样中间区与空档可以像 Figma 一样同时 `FILL`、
 * 平分剩余宽度（`with-search` 实测：Search 492.5 ＋ 空档 458.5）。
 */
export const Header = forwardRef<HTMLElement, HeaderProps>(function Header(props, ref) {
  const { type = 'simple', brand = 'VibeMe', actions, className, children, ...rest } = props;

  const classes = ['vm-header', `vm-header--${type}`, className ?? ''].filter(Boolean).join(' ');

  return (
    <header {...rest} ref={ref} className={classes} data-type={type}>
      <span className="vm-header__brand vm-type-heading-m">{brand}</span>
      {children ? <div className="vm-header__center">{children}</div> : null}
      {/* Figma: 名为 `Frame` 的 1px 弹性空档（FILL），只负责把 actions 推到最右 */}
      <div className="vm-header__spacer" aria-hidden="true" />
      {actions ? <div className="vm-header__actions">{actions}</div> : null}
    </header>
  );
});
