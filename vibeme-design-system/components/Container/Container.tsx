import { forwardRef, type HTMLAttributes } from 'react';
import './Container.css';

/** 容器宽度档位，对应 Figma 变体属性 `Type`。 */
export type ContainerType = 'narrow' | 'default' | 'wide' | 'full';

/** 各档的 Figma FIXED 宽（px），实现里落成 `max-width`。 */
const WIDTHS: Record<ContainerType, number> = {
  narrow: 720,
  default: 1200,
  wide: 1440,
  full: 1560,
};

/** 页面容器 props。 */
export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 宽度档位，映射 Figma 变体属性 `Type`（FIXED 宽 narrow 720 / default 1200 / wide 1440 / full 1560）。
   * 注意 Figma 的 `defaultVariant` 是 **`narrow`**，不是名叫 `default` 的那档，所以默认值也是 `narrow`。
   * @default 'narrow'
   */
  type?: ContainerType;
}

/**
 * 页面容器。事实来源：Figma 组件集 `Container`（node `56066:6255`），
 * 4 个变体 = `Type`(narrow / default / wide / full)，宽度 720 / 1200 / 1440 / 1560。
 *
 * - 组件集没有 `State` 轴，且根部**没有填充、描边与圆角**（4 个变体的 fills / strokes / radius 全为空），
 *   所以本组件只做「限宽 ＋ 水平居中 ＋ 内边距」，不写任何交互态样式；
 * - 内边距直接复用 Figma 的绑定变量：上下 `--vm-space-6`（`space/space-6` 24px）、
 *   左右 `--vm-space-8`（`space/space-8` 32px）；
 * - 与 Figma 的唯一偏差：Figma 是 FIXED 宽，这里用 `max-width` ＋ `width: 100%`，窄视口下可收缩。
 *
 * 渲染成中性 `<div>`，不带 role；需要 `<main>` / `<section>` 等语义时请在外层使用真实元素。
 */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { type = 'narrow', className, ...rest },
  ref,
) {
  const rootClass = ['vm-container', `vm-container--${type}`, className ?? ''].filter(Boolean).join(' ');

  return <div {...rest} ref={ref} className={rootClass} data-type={type} />;
});

/** 各档对应的 Figma 固定宽度（供文档/测试引用，避免在别处再写一遍数字）。 */
export const CONTAINER_WIDTHS = WIDTHS;
