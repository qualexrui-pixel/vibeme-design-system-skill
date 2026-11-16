import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import './Card.css';

/** 卡片类型，对应 Figma 变体属性 `Type`。 */
export type CardType = 'plain' | 'media' | 'selected';

/**
 * 卡片。事实来源：Figma 组件集 `Card`（node `56061:6466`），6 个变体 = `Type` × `State`。
 *
 * - `Type` → `type`（`plain` / `media` / `selected`）；
 * - `State=hover` 是交互态，由 CSS `:hover` 实现（底色换 `--vm-surface-hover`、描边换 `--vm-white-4`），**不做 prop**；
 * - 无 `disabled` / `focus` / `loading` 变体。
 */
export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * 卡片类型，映射 Figma 变体属性 `Type`。
   * `plain` 纯内容卡片；`media` 顶部多一个 280×140 媒体框（`--vm-bg-panel` + `--vm-radius-md`）；
   * `selected` 描边换成 `--vm-brand` 且加粗到 `--vm-focus-ring-width`（Figma 的绑定变量）。
   * @default 'plain'
   */
  type?: CardType;
  /**
   * 标题，对应 Figma 文本层 `Card title`（`Heading/M`、色 `--vm-text-primary`）。
   * 传字符串时渲染为普通文本；需要标题语义请自行传 `<h3>` 等节点。
   */
  title?: ReactNode;
  /**
   * 媒体内容，对应 `Type=media` 里的 `Frame`（280×140、2:1、`--vm-bg-panel` 底、`--vm-radius-md` 圆角）。
   * 只有 `type="media"` 时会渲染这一层。
   */
  media?: ReactNode;
}

/**
 * 卡片容器。`children` 对应 Figma 的正文文本层（`Heading/Body/S/Regular`、色 `--vm-text-secondary`）。
 *
 * 只固定参考宽 320px（Figma FIXED 宽），高度按内容自然生长；
 * hover 由伪类处理，`selected` 由 `type` 决定——两者都不要额外加 prop。
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { type = 'plain', title, media, className, children, ...rest },
  ref,
) {
  const rootClass = ['vm-card', `vm-card--${type}`, className ?? ''].filter(Boolean).join(' ');

  return (
    <div {...rest} ref={ref} className={rootClass} data-type={type}>
      {type === 'media' ? <div className="vm-card__media">{media}</div> : null}
      {title !== undefined && title !== null ? (
        <div className="vm-card__title">{title}</div>
      ) : null}
      {children !== undefined && children !== null ? (
        <div className="vm-card__body">{children}</div>
      ) : null}
    </div>
  );
});
