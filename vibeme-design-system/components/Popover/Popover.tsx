import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import './Popover.css';

/** 方位，对应 Figma 变体属性 `Placement`。 */
export type PopoverPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

/**
 * 气泡卡片。事实来源：Figma 组件集 `Popover`（node `56063:6819`），
 * 4 个变体 = `Placement`(4)，默认 `Placement=bottom-start`。面板 240px + 箭头 + `Elevation/3`。
 *
 * Figma 里**没有 `State` 轴**（4 个变体顶层都没有 `fills` / `strokes` / `opacity`），
 * 所以面板不写任何 `:hover` / `:active` / `:focus-visible` / `[disabled]` 样式，
 * 也不接受 `open` / `disabled` 这类 prop；显隐由调用方与触发元素自己控制。
 *
 * 面板里的「菜单项二（悬停）」是 Figma 画的**样本行**，它用 `Background/Surface-hover`
 * → `--vm-surface-hover`。那是行组件（`MenuItem`）的状态，不是面板的状态。
 */
export interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 方位，映射 Figma 变体属性 `Placement`。
   * `bottom-*` 箭头行在面板**之前**（箭头朝上）；`top-*` 面板在前、箭头行在后（箭头朝下）。
   * `-start` 箭头距面板左缘 `--vm-space-6`（24px，Figma `hAlign=MIN`），
   * `-end` 箭头距面板右缘 24px（Figma `hAlign=MAX`）。
   * @default 'bottom-start'
   */
  placement?: PopoverPlacement;
  /**
   * 面板内容。对应 Figma 默认变体里那 3 行 `208×32` 的菜单样本 ——
   * 代码里请填 `MenuItem`（或自己的 `<ul role="menu">`），不要重造行。
   * 面板宽固定 240px、内边距 16px，可用宽度是 208px。
   */
  children?: ReactNode;
}

/** 箭头几何：8×5（Figma `Vector` 节点），颜色跟随面板底色 `--vm-bg-panel`。 */
const ARROW = {
  // bottom-*：箭头行在面板上方，箭头朝上
  up: 'M0 5L8 5L4 0Z',
  // top-*：箭头行在面板下方，箭头朝下
  down: 'M0 0L8 0L4 5Z',
} as const;

/**
 * 气泡卡片面板。渲染成 `<div>`（不预设 `role`）—— 面板里放菜单就由内容带
 * `<ul role="menu">`，放富内容就写 `role="dialog"`；`...rest` 可以把 `role` / `aria-*`
 * 直接写在根节点上。
 */
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  { placement = 'bottom-start', className, children, ...rest },
  ref,
) {
  const rootClass = ['vm-popover', `vm-popover--${placement}`, className ?? ''].filter(Boolean).join(' ');

  // bottom-* 箭头在上（朝上）；top-* 箭头在下（朝下）。
  const isBottom = placement.startsWith('bottom');
  const arrowNode = (
    <span className="vm-popover__arrow-row">
      <svg
        className="vm-popover__arrow"
        width={8}
        height={5}
        viewBox="0 0 8 5"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        {/* Figma: Vector（8×5 实心三角） */}
        <path d={isBottom ? ARROW.up : ARROW.down} />
      </svg>
    </span>
  );

  return (
    <div {...rest} ref={ref} className={rootClass} data-placement={placement}>
      {isBottom ? arrowNode : null}
      <div className="vm-popover__panel">{children}</div>
      {isBottom ? null : arrowNode}
    </div>
  );
});
