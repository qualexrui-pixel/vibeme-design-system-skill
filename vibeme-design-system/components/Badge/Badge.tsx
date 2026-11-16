import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import './Badge.css';

/** 徽标类型，对应 Figma 属性 `Type`：`dot` 无内容的圆点，`count` 带数字的胶囊。 */
export type BadgeType = 'dot' | 'count';

/** 语义色调，对应 Figma 属性 `Tone`（只有 2 档）。 */
export type BadgeTone = 'brand' | 'error';

/** 尺寸档位，对应 Figma 属性 `Size`。 */
export type BadgeSize = 'sm' | 'md';

/**
 * 徽标（Badge）。事实来源：Figma 组件集 `Badge`（node `56061:6417`），
 * 8 个变体 = `Type`(2) × `Tone`(2) × `Size`(2)，默认 `Type=dot, Tone=brand, Size=sm`。
 *
 * Figma 里**没有 `State` 轴**：Badge 是不可交互的标记，代码里没有任何 `:hover` / `:active`。
 * 圆角固定 `--vm-radius-full`（`Radious/radius-full`，999px）：`dot` 因此是正圆，
 * `count` 是两端半圆的胶囊。
 */
export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * 徽标类型，映射 Figma 属性 `Type`。
   * `dot` 是 FIXED 的 6×6（sm）/ 8×8（md）纯色圆点、**没有文本子节点**；
   * `count` 是 HUG 的胶囊，尺寸由数字位数决定。
   * @default 'dot'
   */
  type?: BadgeType;
  /**
   * 语义色调，映射 Figma 属性 `Tone`：`brand` = `--vm-brand` 底 + `--vm-neutral-950` 文字，
   * `error` = `--vm-status-error` 底 + `--vm-white-0` 文字。
   * @default 'brand'
   */
  tone?: BadgeTone;
  /**
   * 尺寸档位，映射 Figma 属性 `Size`：`dot` 改直径（6 / 8px），`count` 改文字样式
   * （`sm` = `Caption/Label` 10 Medium/14，`md` = `Caption/Caption` 12 Medium/18）。
   * @default 'sm'
   */
  size?: BadgeSize;
  /**
   * 数字内容，对应 Figma 的 TEXT 属性 `count`（默认文案 `8`）。只在 `type="count"` 时渲染。
   * Figma 没有「超过 99 显示 99+」的规则，需要截断请在调用方算好再传。
   * @default '8'
   */
  count?: ReactNode;
  /**
   * 数字内容的插槽写法；与 `count` 同时给出时**以 `children` 为准**
   * （规范：TEXT 属性优先用 `children`）。只在 `type="count"` 时渲染。
   */
  children?: ReactNode;
}

/**
 * 徽标。`dot` 不渲染任何文本，屏幕阅读器读不到内容——它必须配合外层元素的
 * `aria-label` 或旁边的可见文字一起用，详见 `references/components/badge.md`。
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { type = 'dot', tone = 'brand', size = 'sm', count, className, children, ...rest },
  ref,
) {
  // sm / md 用两套文字样式（Figma: Caption/Label 与 Caption/Caption），不手写 font-size
  const typeClass = size === 'md' ? 'vm-type-caption-caption' : 'vm-type-caption-label';

  const rootClass = [
    'vm-badge',
    `vm-badge--${type}`,
    `vm-badge--${tone}`,
    `vm-badge--${size}`,
    type === 'count' ? typeClass : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span {...rest} ref={ref} className={rootClass} data-tone={tone} data-type={type}>
      {type === 'count' ? (children ?? count ?? '8') : null}
    </span>
  );
});
