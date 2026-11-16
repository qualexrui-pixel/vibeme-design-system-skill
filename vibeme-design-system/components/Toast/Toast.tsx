import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import './Toast.css';

/** 语义类型，对应 Figma 变体属性 `Type`。图标与图标颜色都跟着它走。 */
export type ToastType = 'info' | 'success' | 'warning' | 'error';

/**
 * Figma 里 4 个 `Type` 各内嵌一个 `Filled icon` 实例，矢量直接取自 Figma 导出
 * （实例容器 20×20，内部图形 17.5×17.5，所以统一用 `translate(1.25 1.25)` 摆进 20 的坐标里）：
 * `circle-info-filled` / `circle-check-filled` / `circle-alert-filled` / `circle-cross-filled`。
 */
const STATUS_ICON_PATH: Record<ToastType, string> = {
  info: 'M8.75 0C13.5825 0 17.5 3.91751 17.5 8.75C17.5 13.5825 13.5825 17.5 8.75 17.5C3.91751 17.5 0 13.5825 0 8.75C0 3.91751 3.91751 0 8.75 0ZM8.95833 7.08333C8.4981 7.08333 8.125 7.45643 8.125 7.91667V12.9167C8.125 13.3769 8.4981 13.75 8.95833 13.75C9.41857 13.75 9.79167 13.3769 9.79167 12.9167V7.91667C9.79167 7.45643 9.41857 7.08333 8.95833 7.08333ZM8.95833 3.75C8.26798 3.75 7.70833 4.30964 7.70833 5C7.70833 5.69036 8.26798 6.25 8.95833 6.25C9.64869 6.25 10.2083 5.69036 10.2083 5C10.2083 4.30964 9.64869 3.75 8.95833 3.75Z',
  success:
    'M8.75 0C13.5825 0 17.5 3.91751 17.5 8.75C17.5 13.5825 13.5825 17.5 8.75 17.5C3.91751 17.5 0 13.5825 0 8.75C0 3.91751 3.91751 0 8.75 0ZM13.5209 5.45085C13.1955 5.12553 12.6679 5.12552 12.3425 5.45085L7.25667 10.5359L5.15747 8.43709C4.83205 8.11177 4.3045 8.11176 3.97909 8.43709C3.65371 8.7625 3.65375 9.29005 3.97909 9.61548L6.66748 12.3043C6.82375 12.4606 7.03608 12.548 7.25708 12.548C7.47801 12.548 7.69004 12.4605 7.84627 12.3043L13.5209 6.62923C13.8463 6.30379 13.8463 5.77626 13.5209 5.45085Z',
  warning:
    'M8.75 0C13.5825 0 17.5 3.91751 17.5 8.75C17.5 13.5825 13.5825 17.5 8.75 17.5C3.91751 17.5 0 13.5825 0 8.75C0 3.91751 3.91751 0 8.75 0ZM8.95833 11.25C8.26798 11.25 7.70833 11.8096 7.70833 12.5C7.70833 13.1904 8.26798 13.75 8.95833 13.75C9.64869 13.75 10.2083 13.1904 10.2083 12.5C10.2083 11.8096 9.64869 11.25 8.95833 11.25ZM8.95833 3.75C8.4981 3.75 8.125 4.1231 8.125 4.58333V9.58333C8.125 10.0436 8.4981 10.4167 8.95833 10.4167C9.41857 10.4167 9.79167 10.0436 9.79167 9.58333V4.58333C9.79167 4.1231 9.41857 3.75 8.95833 3.75Z',
  error:
    'M8.75 0C13.5825 0 17.5 3.91751 17.5 8.75C17.5 13.5825 13.5825 17.5 8.75 17.5C3.91751 17.5 0 13.5825 0 8.75C0 3.91751 3.91751 0 8.75 0ZM6.09985 4.92025C5.77447 4.59495 5.24689 4.59502 4.92147 4.92025C4.59603 5.24568 4.59603 5.7736 4.92147 6.09904L7.57406 8.75203L4.92147 11.405C4.59603 11.7305 4.59603 12.2584 4.92147 12.5838C5.2469 12.9091 5.77446 12.9092 6.09985 12.5838L8.75285 9.93042L11.403 12.581C11.7284 12.9064 12.2564 12.9064 12.5818 12.581C12.9072 12.2555 12.9072 11.7276 12.5818 11.4022L9.93164 8.75203L12.5818 6.10189C12.9071 5.7765 12.907 5.24893 12.5818 4.9235C12.2563 4.59807 11.7284 4.59807 11.403 4.9235L8.75285 7.57324L6.09985 4.92025Z',
};

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * 对应 Figma 变体属性 `Type`。只改状态图标的图形与颜色
   * （`--vm-status-info` / `--vm-status-success` / `--vm-status-warning` / `--vm-status-error`），
   * 底色（`--vm-bg-toast`）、描边、圆角、内边距四档完全一致。
   * @default 'info'
   */
  type?: ToastType;
  /**
   * 标题槽位，对应 Figma 文本层「提示」（`Heading/S` → `.vm-type-heading-s`，色 `--vm-text-primary`）。
   * 4 个变体的示例文案分别是「提示」「操作成功」「注意」「操作失败」。
   */
  title?: ReactNode;
  /**
   * 描述槽位，对应 Figma 文本层「这是一条普通提示信息」
   * （`Caption/Caption` → `.vm-type-caption-caption`，色 `--vm-text-secondary`）。
   */
  children?: ReactNode;
  /**
   * 右上角 × 的可访问名。Figma 的 `Filled icon` / `cross_filled` 图标没有文案层，
   * 但图标按钮必须有名字，所以补这个 prop。
   * @default '关闭'
   */
  closeLabel?: string;
  /** 点击右上角 × 时触发。Toast 的显示/消失由消费方挂载/卸载控制，组件不内置计时器。 */
  onClose?: () => void;
}

/**
 * 轻提示。事实来源：Figma 组件集 `Toast`（node `56063:6596`），4 个变体 = `Type`。
 *
 * - **没有 `State` 轴**：hover / pressed / focus / disabled 在 Figma 里都不存在，
 *   所以面板本体不加任何叠加层（唯一的交互体是 × 按钮）；
 * - **没有 `open` 变体**：可见性交给消费方挂载/卸载，组件不提供 `open` prop，也不内置自动消失计时；
 * - 默认是 `role="status"`（`aria-live="polite"`），`warning` / `error` 自动升级成
 *   `role="alert"`（`aria-live="assertive"`），需要别的行为可以从 `...rest` 覆盖。
 */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  { type = 'info', title, children, closeLabel = '关闭', onClose, className, ...rest },
  ref,
) {
  const rootClass = ['vm-toast', `vm-toast--${type}`, className].filter(Boolean).join(' ');
  const isUrgent = type === 'warning' || type === 'error';

  return (
    <div
      {...rest}
      ref={ref}
      className={rootClass}
      role={rest.role ?? (isUrgent ? 'alert' : 'status')}
      aria-live={rest['aria-live'] ?? (isUrgent ? 'assertive' : 'polite')}
    >
      {/* Figma: Filled icon / Property 1=circle-*-filled（20×20 容器 + 17.5 图形） */}
      <span className="vm-toast__icon">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <g transform="translate(1.25 1.25)">
            <path d={STATUS_ICON_PATH[type]} fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
          </g>
        </svg>
      </span>

      <div className="vm-toast__content">
        {title !== undefined && title !== null ? (
          <p className="vm-toast__title vm-type-heading-s">{title}</p>
        ) : null}
        {children !== undefined && children !== null ? (
          <p className="vm-toast__description vm-type-caption-caption">{children}</p>
        ) : null}
      </div>

      <button
        type="button"
        className="vm-toast__close"
        onClick={onClose}
        aria-label={closeLabel}
      >
        {/* Figma: Filled icon / Property 1=cross_filled（16×16 容器 + 10.49 图形，填充 Text/Text-Tertiary） */}
        <svg
          width="10.49"
          height="10.49"
          viewBox="0 0 10.4876 10.4853"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M10.1924 0.292893C10.5829 0.683418 10.5829 1.31658 10.1924 1.70711L6.658 5.24149L10.1947 8.77817C10.5852 9.1687 10.5852 9.80186 10.1947 10.1924C9.80416 10.5829 9.17099 10.5829 8.78048 10.1924L5.24379 6.6557L1.70711 10.1924C1.31658 10.5829 0.683417 10.5829 0.292893 10.1924C-0.0976312 9.80186 -0.0976308 9.1687 0.292893 8.77817L3.82958 5.24149L0.295195 1.70711C-0.0953193 1.31659 -0.0953003 0.68342 0.295195 0.292893C0.685719 -0.097631 1.31888 -0.0976307 1.70941 0.292893L5.24379 3.82728L8.77817 0.292893C9.1687 -0.0976311 9.80186 -0.0976311 10.1924 0.292893Z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
  );
});
