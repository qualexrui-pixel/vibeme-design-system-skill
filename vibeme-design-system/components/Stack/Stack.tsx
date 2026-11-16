import { forwardRef, type HTMLAttributes } from 'react';
import './Stack.css';

/** 主轴方向，映射 Figma 变体属性 `Direction`（`vertical` 竖向堆叠 / `horizontal` 横向排列）。 */
export type StackDirection = 'vertical' | 'horizontal';

/** 子项间距档位，映射 Figma 变体属性 `Gap`（`sm` = 8px、`md` = 16px、`lg` = 24px，绑 `space/space-2|4|6`）。 */
export type StackGap = 'sm' | 'md' | 'lg';

/**
 * 堆叠容器 props。除下面两个轴之外，其余原生 `div` 属性（`id` / `style` / `aria-*` / 事件…）
 * 一律透传，不做拦截。
 */
export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 主轴方向，对应 Figma 变体属性 `Direction`。
   * `vertical` 时子项纵向排列、交叉轴靠左（Figma `counterAxisAlignItems=MIN`）；
   * `horizontal` 时子项横向排列、交叉轴居中（Figma `counterAxisAlignItems=CENTER`）。
   * @default 'vertical'
   */
  direction?: StackDirection;
  /**
   * 子项间距，对应 Figma 变体属性 `Gap`：`sm`→`--vm-space-2`(8px)、`md`→`--vm-space-4`(16px)、
   * `lg`→`--vm-space-6`(24px)。只接受这三档，其它数值请直接用原生 `style={{ gap }}`。
   * @default 'sm'
   */
  gap?: StackGap;
}

/**
 * 堆叠容器。事实来源：Figma 组件集 `Stack`（node `56066:6298`），
 * 6 个变体 = `Direction`(vertical/horizontal) × `Gap`(sm/md/lg)。
 *
 * Figma 里那三个带 `White/White-9` 填充、`Background/border-default` 描边的 288×40 方块
 * 是**演示占位内容**，不是 Stack 自己的外观；Stack 本身没有填充、描边、圆角，
 * 只负责排列方式（`flex-direction` / `align-items`）与间距（`gap`）。
 * 因此这里不提供任何外观 prop，内容完全由 `children` 决定。
 */
export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(props, ref) {
  const { direction = 'vertical', gap = 'sm', className, children, ...rest } = props;

  const classes = [
    'vm-stack',
    `vm-stack--${direction}`,
    `vm-stack--gap-${gap}`,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div {...rest} ref={ref} className={classes} data-direction={direction} data-gap={gap}>
      {children}
    </div>
  );
});
