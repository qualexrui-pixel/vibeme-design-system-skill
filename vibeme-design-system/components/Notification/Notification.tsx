import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import './Notification.css';

/** 状态类型，对应 Figma 变体属性 `Type`（info / success / warning / error）。 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/** 版式，对应 Figma 变体属性 `Layout`（banner 横向 480 宽 / card 纵向 320 宽）。 */
export type NotificationLayout = 'banner' | 'card';

/**
 * Figma `Filled icon` 里四个状态图标的原始矢量（`circle-info-filled` / `circle-check-filled` /
 * `circle-alert-filled` / `circle-cross-filled`，17.5×17.5 图形，装在 20×20 的图标盒里）。
 * 取自 Figma `download_assets`，`fill` 统一改成 `currentColor` 以便跟随状态色变量。
 */
const STATUS_ICON_PATH: Record<NotificationType, string> = {
  info:
    'M8.75 0C13.5825 0 17.5 3.91751 17.5 8.75C17.5 13.5825 13.5825 17.5 8.75 17.5C3.91751 17.5 0 13.5825 0 8.75C0 3.91751 3.91751 0 8.75 0ZM8.95833 7.08333C8.4981 7.08333 8.125 7.45643 8.125 7.91667V12.9167C8.125 13.3769 8.4981 13.75 8.95833 13.75C9.41857 13.75 9.79167 13.3769 9.79167 12.9167V7.91667C9.79167 7.45643 9.41857 7.08333 8.95833 7.08333ZM8.95833 3.75C8.26798 3.75 7.70833 4.30964 7.70833 5C7.70833 5.69036 8.26798 6.25 8.95833 6.25C9.64869 6.25 10.2083 5.69036 10.2083 5C10.2083 4.30964 9.64869 3.75 8.95833 3.75Z',
  success:
    'M8.75 0C13.5825 0 17.5 3.91751 17.5 8.75C17.5 13.5825 13.5825 17.5 8.75 17.5C3.91751 17.5 0 13.5825 0 8.75C0 3.91751 3.91751 0 8.75 0ZM13.5209 5.45085C13.1955 5.12553 12.6679 5.12552 12.3425 5.45085L7.25667 10.5359L5.15747 8.43709C4.83205 8.11177 4.3045 8.11176 3.97909 8.43709C3.65371 8.7625 3.65375 9.29005 3.97909 9.61548L6.66748 12.3043C6.82375 12.4606 7.03608 12.548 7.25708 12.548C7.47801 12.548 7.69004 12.4605 7.84627 12.3043L13.5209 6.62923C13.8463 6.30379 13.8463 5.77626 13.5209 5.45085Z',
  warning:
    'M8.75 0C13.5825 0 17.5 3.91751 17.5 8.75C17.5 13.5825 13.5825 17.5 8.75 17.5C3.91751 17.5 0 13.5825 0 8.75C0 3.91751 3.91751 0 8.75 0ZM8.95833 11.25C8.26798 11.25 7.70833 11.8096 7.70833 12.5C7.70833 13.1904 8.26798 13.75 8.95833 13.75C9.64869 13.75 10.2083 13.1904 10.2083 12.5C10.2083 11.8096 9.64869 11.25 8.95833 11.25ZM8.95833 3.75C8.4981 3.75 8.125 4.1231 8.125 4.58333V9.58333C8.125 10.0436 8.4981 10.4167 8.95833 10.4167C9.41857 10.4167 9.79167 10.0436 9.79167 9.58333V4.58333C9.79167 4.1231 9.41857 3.75 8.95833 3.75Z',
  error:
    'M8.75 0C13.5825 0 17.5 3.91751 17.5 8.75C17.5 13.5825 13.5825 17.5 8.75 17.5C3.91751 17.5 0 13.5825 0 8.75C0 3.91751 3.91751 0 8.75 0ZM6.09985 4.92025C5.77447 4.59495 5.24689 4.59502 4.92147 4.92025C4.59603 5.24568 4.59603 5.7736 4.92147 6.09904L7.57406 8.75203L4.92147 11.405C4.59603 11.7305 4.59603 12.2584 4.92147 12.5838C5.2469 12.9091 5.77446 12.9092 6.09985 12.5838L8.75285 9.93042L11.403 12.581C11.7284 12.9064 12.2564 12.9064 12.5818 12.581C12.9072 12.2555 12.9072 11.7276 12.5818 11.4022L9.93164 8.75203L12.5818 6.10189C12.9071 5.7765 12.907 5.24893 12.5818 4.9235C12.2563 4.59807 11.7284 4.59807 11.403 4.9235L8.75285 7.57324L6.09985 4.92025Z',
};

/** Figma `cross_filled` 的原始矢量（10.4876×10.4853 图形，装在 16×16 的图标盒里）。 */
const CLOSE_ICON_PATH =
  'M10.1924 0.292893C10.5829 0.683418 10.5829 1.31658 10.1924 1.70711L6.658 5.24149L10.1947 8.77817C10.5852 9.1687 10.5852 9.80186 10.1947 10.1924C9.80416 10.5829 9.17099 10.5829 8.78048 10.1924L5.24379 6.6557L1.70711 10.1924C1.31658 10.5829 0.683417 10.5829 0.292893 10.1924C-0.0976312 9.80186 -0.0976308 9.1687 0.292893 8.77817L3.82958 5.24149L0.295195 1.70711C-0.0953193 1.31659 -0.0953003 0.68342 0.295195 0.292893C0.685719 -0.097631 1.31888 -0.0976307 1.70941 0.292893L5.24379 3.82728L8.77817 0.292893C9.1687 -0.0976311 9.80186 -0.0976311 10.1924 0.292893Z';

export interface NotificationProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * 状态类型，映射 Figma 变体属性 `Type`。
   * 同时决定图标颜色与 banner 的 2px 描边色（`--vm-status-*`）。默认 `info`。
   */
  type?: NotificationType;
  /**
   * 版式，映射 Figma 变体属性 `Layout`。
   * `banner` = 480 宽横向条（`Background/bg-panel` + 2px 状态色描边 + 标题/描述 + 关闭按钮）；
   * `card` = 320 宽纵向卡（`Background/bg-card` + 1px `Background/border-default` + `Elevation/2`，只有图标 + 一行文字）。默认 `banner`。
   */
  layout?: NotificationLayout;
  /**
   * 标题，对应 Figma banner 变体里的标题文本层（文字样式 `Heading/S`，`Text/Text-Primary`）。
   * `card` 变体在 Figma 里只有一行文字、没有独立标题层，因此 card 不渲染标题。
   */
  title?: ReactNode;
  /**
   * 正文/说明内容：banner 是描述文本（`Caption/Caption`，`Text/Text-Secondary`），
   * card 是那唯一一行文字（`Heading/Body/S/Regular`，`Text/Text-Secondary`）。
   */
  children?: ReactNode;
  /**
   * 关闭回调，对应 Figma banner 变体尾部的 `cross_filled` 图标按钮。
   * **仅 `layout="banner"` 生效**——Figma 的 card 变体结构里没有关闭图标，所以 card 不渲染它。
   */
  onClose?: () => void;
  /** 关闭按钮的无障碍名称（Figma 里没有文案，默认「关闭」）。 */
  closeLabel?: string;
}

/**
 * 通知条 / 通知卡。事实来源：Figma 组件集 `Notification`（node `56063:6645`），
 * 8 个变体 = `Type`(info/success/warning/error) × `Layout`(banner/card)。
 *
 * Figma 没有 `State` 轴：notification 没有 hover / pressed / disabled 变体，
 * 所以这里也没有对应的 prop，唯一的交互元素是 banner 尾部的关闭按钮。
 */
export const Notification = forwardRef<HTMLDivElement, NotificationProps>(function Notification(
  props,
  ref,
) {
  const {
    type = 'info',
    layout = 'banner',
    title,
    children,
    onClose,
    closeLabel = '关闭',
    className,
    ...rest
  } = props;

  const rootClass = [
    'vm-notification',
    `vm-notification--${layout}`,
    `vm-notification--${type}`,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const isBanner = layout === 'banner';
  /* card 在 Figma 里只有一层文字，没有标题/描述之分，所以 children 缺省时退回 title */
  const text = isBanner ? children : children ?? title;

  return (
    <div
      {...rest}
      ref={ref}
      className={rootClass}
      data-type={type}
      data-layout={layout}
      /* 状态提示不该打断读屏：只有 error 用 alert（立即播报），其余用 status（礼貌播报）。
         调用方通过 ...rest 传 role 可覆盖这个默认值。 */
      role={rest.role ?? (type === 'error' ? 'alert' : 'status')}
    >
      {/* Figma: Filled icon / circle-info-filled 等四个状态图标 */}
      <span className="vm-notification__icon" aria-hidden="true">
        <svg
          width="20"
          height="20"
          viewBox="0 0 17.5 17.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          focusable="false"
        >
          <path d={STATUS_ICON_PATH[type]} fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
        </svg>
      </span>

      {isBanner ? (
        <div className="vm-notification__content">
          {title ? (
            <p className="vm-notification__title vm-type-heading-s">{title}</p>
          ) : null}
          {text ? (
            <p className="vm-notification__description vm-type-caption-caption">{text}</p>
          ) : null}
        </div>
      ) : (
        <p className="vm-notification__text vm-type-heading-body-s-regular">{text}</p>
      )}

      {isBanner && onClose ? (
        <button
          type="button"
          className="vm-notification__close"
          onClick={onClose}
          aria-label={closeLabel}
        >
          {/* Figma: cross_filled */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 10.4876 10.4853"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
          >
            <path d={CLOSE_ICON_PATH} fill="currentColor" />
          </svg>
        </button>
      ) : null}
    </div>
  );
});
