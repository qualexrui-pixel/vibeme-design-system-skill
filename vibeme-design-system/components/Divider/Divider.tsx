import { forwardRef, type HTMLAttributes, type Ref } from 'react';
import './Divider.css';

/** 方向，对应 Figma 变体属性 `Orientation`。 */
export type DividerOrientation = 'horizontal' | 'vertical';

/** 线型，对应 Figma 变体属性 `Style`（solid 是 1px 填充，dashed 是 1px 描边 + `dashPattern [4,4]`）。 */
export type DividerStyle = 'solid' | 'dashed';

/**
 * 原生属性集合。**剔除了原生 `style`**：这个名字被 Figma 的 `Style` 变体属性占用了
 * （见 `data/components-index.json` 的 `Style → style` 映射），需要内联样式请用 `className`。
 */
type DividerNativeProps = Omit<HTMLAttributes<HTMLElement>, 'style'>;

/**
 * 分割线。事实来源：Figma 组件集 `Divider`（node `56061:6471`），4 个变体 = `Orientation` × `Style`。
 *
 * - 颜色恒为 `Background/border-default`（`--vm-border-default`，12% 白），线宽 `border/width/thin`（1px）；
 * - 没有 `State` 轴，因此不存在 hover / focus / disabled，组件上不写任何伪类。
 */
export interface DividerProps extends DividerNativeProps {
  /**
   * 方向，映射 Figma 变体属性 `Orientation`。
   * `horizontal` 渲染 `<hr>`（参考 320×1，代码里宽度 100%）；`vertical` 渲染
   * `<div role="separator" aria-orientation="vertical">`（参考 1×64，flex 行里 `align-self: stretch`）。
   * @default 'horizontal'
   */
  orientation?: DividerOrientation;
  /**
   * 线型，映射 Figma 变体属性 `Style`。
   * `solid` = 1px 填充；`dashed` = 1px 描边 + `dashPattern [4,4]`（代码用 4px/4px 的 repeating-linear-gradient 复刻）。
   * 注意：该 prop 占用了 `style` 这个名字，原生 `style` 属性不透传。
   * @default 'solid'
   */
  style?: DividerStyle;
}

/**
 * 分割线。横向是真实语义元素 `<hr>`，纵向用 `role="separator"` + `aria-orientation="vertical"`。
 *
 * 不可聚焦、不可拖动、不响应 hover：不要给它加 `tabIndex` 或交互 prop。
 */
export const Divider = forwardRef<HTMLElement, DividerProps>(function Divider(
  { orientation = 'horizontal', style = 'solid', className, ...rest },
  ref,
) {
  const rootClass = [
    'vm-divider',
    `vm-divider--${orientation}`,
    `vm-divider--${style}`,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  if (orientation === 'vertical') {
    return (
      <div
        {...rest}
        ref={ref as Ref<HTMLDivElement>}
        className={rootClass}
        role="separator"
        aria-orientation="vertical"
        data-orientation={orientation}
        data-style={style}
      />
    );
  }

  return (
    <hr
      {...rest}
      ref={ref as Ref<HTMLHRElement>}
      className={rootClass}
      data-orientation={orientation}
      data-style={style}
    />
  );
});
