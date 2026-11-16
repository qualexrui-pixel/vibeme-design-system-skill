import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import './Tag.css';

/** 语义色调，对应 Figma 属性 `Tone`（6 档）。 */
export type TagTone = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';

/** 尺寸档位，对应 Figma 属性 `Size`。 */
export type TagSize = 'sm' | 'md';

/** 风格，对应 Figma 属性 `Style`。 */
export type TagStyleProp = 'soft' | 'solid';

/**
 * 标签（Tag）。事实来源：Figma 组件集 `Tag`（node `56061:6404`），
 * 24 个变体 = `Tone`(6) × `Size`(2) × `Style`(2)，默认 `Tone=neutral, Size=sm, Style=soft`。
 *
 * Figma 里 **没有 `State` 轴**，所以这是个纯展示组件：不写任何 `:hover` / `:active`
 * 伪类，也不接受交互相关的 props。需要可点击的标签请用 `Button` 或 `MenuItem`。
 *
 * 注意：Figma 的 `Style` 轴占用了 `style` 这个 prop 名，因此本组件**不透传** React 的
 * 行内 `style`（`HTMLAttributes` 里的 `style` 已被 `Omit`）。
 */
export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'style' | 'children'> {
  /**
   * 语义色调，映射 Figma 属性 `Tone`。
   * `soft` 下只有 `brand` 带色调底（`--vm-brand-950`），其余语义色的 soft 底都是 `--vm-bg-card`。
   * @default 'neutral'
   */
  tone?: TagTone;
  /**
   * 尺寸档位，映射 Figma 属性 `Size`：`sm` 24px 高（`Caption/Label`，10 Medium/14）、
   * `md` 28px 高（`Caption/Caption`，12 Medium/18）。
   * @default 'sm'
   */
  size?: TagSize;
  /**
   * 风格，映射 Figma 属性 `Style`：`soft` = 12% 白描边 + 浅底；`solid` = 实心底色。
   * 两档的描边完全一致（`--vm-border-width-thin` + `--vm-border-default`）。
   * @default 'soft'
   */
  style?: TagStyleProp;
  /**
   * 标签文案，对应 Figma 的 TEXT 属性 `label`。
   * @default 'Tag'
   */
  children?: ReactNode;
}

/**
 * 标签。渲染成 `<span>`，颜色由 `tone` × `style` 决定，尺寸由 `size` 决定。
 * 颜色是唯一区分色调的手段，所以**不要**用空标签表达状态，文案必须写出来。
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { tone = 'neutral', size = 'sm', style = 'soft', className, children = 'Tag', ...rest },
  ref,
) {
  // sm / md 用两套文字样式（Figma: Caption/Label 与 Caption/Caption），不手写 font-size
  const typeClass = size === 'md' ? 'vm-type-caption-caption' : 'vm-type-caption-label';

  const rootClass = [
    'vm-tag',
    typeClass,
    `vm-tag--${tone}`,
    `vm-tag--${size}`,
    `vm-tag--${style}`,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span {...rest} ref={ref} className={rootClass} data-tone={tone} data-style={style}>
      {children}
    </span>
  );
});
