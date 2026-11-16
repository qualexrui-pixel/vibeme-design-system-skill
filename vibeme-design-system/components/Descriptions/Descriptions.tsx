import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import './Descriptions.css';

/** 布局方向，对应 Figma 变体属性 `Layout`。 */
export type DescriptionsLayout = 'horizontal' | 'vertical';

/** 一组「标签-值」，对应 Figma 里一个单元 Frame 中的两个 TEXT 层。 */
export interface DescriptionsItem {
  /** React key；缺省时用数组下标（数据会增删时请显式给）。 */
  key?: string | number;
  /** 标签，对应 Figma 文本层 `项目名称`（样式 `Caption/Caption`，色 `Text/Text-Secondary`）。 */
  label: ReactNode;
  /** 值，对应 Figma 文本层 `VibeMe Web`（样式 `Heading/Body/S/Regular`，色 `Text/Text-Primary`）。 */
  value: ReactNode;
  /**
   * 该单元横跨几列（CSS grid 的 `grid-column`）。
   * Figma 每个单元都只占一格，所以默认 `1`；只有页面层确实要拉通时才给。
   */
  span?: number;
}

/** 描述列表 props。 */
export interface DescriptionsProps extends Omit<HTMLAttributes<HTMLDListElement>, 'children'> {
  /**
   * 布局方向，映射 Figma 变体属性 `Layout`。
   * `horizontal`：标签在左、值在右（单元横排，间距 `--vm-space-3`）；
   * `vertical`：标签在上、值在下（单元竖排，间距 `--vm-space-1`）。
   * 卡片壳（底色 / 描边 / 圆角 / 内边距）两档完全一致。
   * @default 'horizontal'
   */
  layout?: DescriptionsLayout;
  /**
   * 列数，映射 Figma 变体属性 `Columns`（Figma 只给了 `2` / `3` 两个样本）。
   * 代码接收真实数值：`Number.isFinite(columns) ? Math.max(1, Math.floor(columns)) : 1`，
   * NaN / Infinity / 小于 1 一律钳到 1。
   * 列间距固定 `--vm-space-6`（24px）、行间距固定 `--vm-space-4`（16px），不随列数变。
   * @default 2
   */
  columns?: number;
  /**
   * 键值对数据。Figma 组件集没有 TEXT 属性（只有 `Layout` / `Columns` 两条变体轴），
   * 所以标签与值的文案由调用方给，这里用数据数组表达「一行一对」。
   */
  items?: DescriptionsItem[];
  /**
   * 逃生通道：传了 `children` 就**整段替换** `items` 渲染出的单元（想完全自控结构时用）。
   * 常规用法请优先 `items`，两者的内容不要同时给。
   */
  children?: ReactNode;
}

/**
 * 描述列表（标签-值对）。事实来源：Figma 组件集 `Descriptions`（node `56065:7035`），
 * 4 个变体 = `Layout`(horizontal / vertical) × `Columns`(2 / 3)。
 *
 * - 组件集里**没有 `State` 轴**：没有 hover / pressed / focus / disabled / error 变体，
 *   所以本组件不写任何交互态样式，也不提供对应的 prop；
 * - 渲染为真实的 `<dl>` / `<dt>` / `<dd>`，`layout` 与 `columns` 只改排版，不改语义；
 * - 不锁宽（Figma 的 720px 是 FIXED 参考宽，页面里交给容器决定）。
 */
export const Descriptions = forwardRef<HTMLDListElement, DescriptionsProps>(function Descriptions(
  { layout = 'horizontal', columns = 2, items, children, className, style, ...rest },
  ref,
) {
  // 合法范围：≥1 的有限整数；NaN / Infinity / 0 / 负数一律钳到 1
  const cols = Number.isFinite(columns) ? Math.max(1, Math.floor(columns)) : 1;
  const rootClass = ['vm-descriptions', `vm-descriptions--${layout}`, className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <dl
      {...rest}
      ref={ref}
      className={rootClass}
      data-layout={layout}
      style={{ ...style, gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {children ??
        items?.map((item, index) => (
          <div
            className="vm-descriptions__cell"
            key={item.key ?? index}
            style={item.span && item.span > 1 ? { gridColumn: `span ${item.span}` } : undefined}
          >
            {/* Figma: 标签文本层（Caption/Caption，Text/Text-Secondary） */}
            <dt className="vm-descriptions__label vm-type-caption-caption">{item.label}</dt>
            {/* Figma: 值文本层（Heading/Body/S/Regular，Text/Text-Primary） */}
            <dd className="vm-descriptions__value vm-type-heading-body-s-regular">{item.value}</dd>
          </div>
        ))}
    </dl>
  );
});
