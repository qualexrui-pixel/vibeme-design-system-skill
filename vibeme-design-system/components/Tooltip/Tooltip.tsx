import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import './Tooltip.css';

/** 方位，对应 Figma 变体属性 `Placement`。 */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

/** 色调，对应 Figma 变体属性 `Tone`。 */
export type TooltipTone = 'dark' | 'brand';

/**
 * 文字提示。事实来源：Figma 组件集 `Tooltip`（node `56063:6778`），
 * 8 个变体 = `Placement`(4) × `Tone`(2)，默认 `Placement=top, Tone=dark`。
 *
 * Figma 里**没有 `State` 轴**（导出的 8 个变体顶层都没有 `fills` / `strokes` / `opacity`），
 * 所以本组件不写任何 `:hover` / `:active` / `:focus-visible` / `[disabled]` 样式，
 * 也不接受 `disabled` / `open` 这类 prop。显隐与进出场动效由调用方决定。
 */
export interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 方位，映射 Figma 变体属性 `Placement`。
   * `top` / `bottom` 是纵向排布（root Auto Layout VERTICAL，气泡 34px 高 + 箭头 5px 高）；
   * `left` / `right` 是横向排布（HORIZONTAL，箭头 5px 宽 + 气泡宽 72px）。
   * @default 'top'
   */
  placement?: TooltipPlacement;
  /**
   * 色调，映射 Figma 变体属性 `Tone`。
   * `dark` = 气泡与箭头 `Neutral/Neutral-600`（`--vm-neutral-600`）+ 文字 `--vm-text-primary`；
   * `brand` = 气泡与箭头 `Brand/Brand`（`--vm-brand`）+ 文字 `--vm-neutral-950`。
   * @default 'dark'
   */
  tone?: TooltipTone;
  /**
   * 提示文案，对应 Figma 文本层 `提示文案`（文字样式 `Caption/Caption`，Poppins 12 Medium / 行高 18）。
   * 保持一句话；要放可交互内容请改用 `Popover`。
   */
  children?: ReactNode;
}

/** 箭头几何：top/bottom 是 8×5，left/right 是 5×8（Figma `Vector` 节点）。 */
const ARROWS: Record<TooltipPlacement, { width: number; height: number; d: string }> = {
  top: { width: 8, height: 5, d: 'M0 0L8 0L4 5Z' }, // 朝下，贴在气泡下方
  bottom: { width: 8, height: 5, d: 'M0 5L8 5L4 0Z' }, // 朝上，贴在气泡上方
  left: { width: 5, height: 8, d: 'M5 0L5 8L0 4Z' }, // 朝左，贴在气泡左侧
  right: { width: 5, height: 8, d: 'M0 0L0 8L5 4Z' }, // 朝右，贴在气泡右侧
};

/**
 * 文字提示气泡。渲染成 `<div role="tooltip">`，不接管焦点。
 *
 * 与触发元素的关系由调用方建立：触发元素写 `aria-describedby="<id>"`，本组件负责带同一个 `id`。
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  { placement = 'top', tone = 'dark', className, children, ...rest },
  ref,
) {
  const rootClass = ['vm-tooltip', `vm-tooltip--${placement}`, `vm-tooltip--${tone}`, className ?? '']
    .filter(Boolean)
    .join(' ');

  const arrow = ARROWS[placement];
  // top / right 箭头在气泡之后；bottom / left 箭头在气泡之前（顺序取自 Figma 子节点顺序）。
  const arrowFirst = placement === 'bottom' || placement === 'left';

  const arrowNode = (
    <svg
      className="vm-tooltip__arrow"
      width={arrow.width}
      height={arrow.height}
      viewBox={`0 0 ${arrow.width} ${arrow.height}`}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {/* Figma: Vector（8×5 / 5×8 的实心三角） */}
      <path d={arrow.d} />
    </svg>
  );

  return (
    <div {...rest} ref={ref} role="tooltip" className={rootClass} data-placement={placement} data-tone={tone}>
      {arrowFirst ? arrowNode : null}
      <span className="vm-tooltip__bubble vm-type-caption-caption">{children}</span>
      {arrowFirst ? null : arrowNode}
    </div>
  );
});
