import { forwardRef, type HTMLAttributes } from 'react';
import './Skeleton.css';

/**
 * 形状档位，对应 Figma 变体属性 `Type`：
 * `line`（文本行）/ `circle`（圆形头像）/ `rect`（矩形块）/ `card`（卡片块）。
 */
export type SkeletonType = 'line' | 'circle' | 'rect' | 'card';

/** 尺寸档位，对应 Figma 变体属性 `Size`（`sm` / `md`）。 */
export type SkeletonSize = 'sm' | 'md';

/**
 * 骨架屏占位块 props。事实来源：Figma 组件集 `Skeleton`（node `56061:6513`），8 个变体 = `Type` × `Size`。
 *
 * 只有两个变体属性 → 两个 prop；`width` / `height` / `style` 等需要覆盖时走原生属性透传。
 */
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 形状档位，映射 Figma 属性 `Type`。默认 `line`（= Figma 的 `defaultVariant` `Type=line, Size=sm`）。
   * 四档只改尺寸与圆角，填充一律是 `--vm-white-7`。
   */
  type?: SkeletonType;
  /** 尺寸档位，映射 Figma 属性 `Size`。默认 `sm`。 */
  size?: SkeletonSize;
}

/**
 * 骨架屏占位。一个纯装饰的填充块：`background-color: var(--vm-white-7)`，
 * 尺寸/圆角由 `type` × `size` 决定（Figma 8 档全部是固定值，见 `Skeleton.css` 顶部对照表）。
 *
 * 默认 `aria-hidden="true"`：占位块本身不承载信息，读屏应该跳过它；
 * 「正在加载」的播报由外层容器负责（`aria-busy="true"` ＋ 视觉隐藏的提示文本）。
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { type = 'line', size = 'sm', className, 'aria-hidden': ariaHidden = true, ...rest },
  ref,
) {
  const rootClass = ['vm-skeleton', `vm-skeleton--${type}`, `vm-skeleton--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return <div {...rest} ref={ref} className={rootClass} aria-hidden={ariaHidden} />;
});
