import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import './Avatar.css';

/** 尺寸档位，对应 Figma 变体属性 `Size`（xs 24 / sm 32 / md 40 / lg 48 / xl 64，px）。 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** 展示类型，对应 Figma 变体属性 `Type`：`icon` 占位图标、`initial` 首字母。 */
export type AvatarType = 'icon' | 'initial';

/**
 * 头像。事实来源：Figma 组件集 `Avatar`（node `56061:6443`），10 个变体 = `Size` × `Type`。
 *
 * - 只有展示态，**没有** `State` 轴：hover / pressed / focus 不做 prop，也不在组件上写伪类；
 * - 圆形半径固定 `--vm-radius-avatar`，底色 `--vm-neutral-700`，描边 `--vm-border-default` 1px。
 */
export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * 尺寸档位，映射 Figma 变体属性 `Size`。
   * 只改外框尺寸与首字母文字样式，图标恒为外框的 50%（12/16/20/24/32）。
   * @default 'xs'
   */
  size?: AvatarSize;
  /**
   * 展示类型，映射 Figma 变体属性 `Type`。
   * `icon` 渲染 `Line icon / user-line` 占位图标；`initial` 渲染首字母。
   * @default 'icon'
   */
  type?: AvatarType;
  /**
   * 首字母文本，映射 Figma TEXT 属性 `initial`（Figma 里的样本值是 `A`）。
   * 与 `children` 同时给出时以 `children` 为准。
   */
  initial?: ReactNode;
}

/**
 * 头像。`type="icon"` 时展示 user-line 占位图标，`type="initial"` 时展示首字母。
 *
 * 不可交互、不可聚焦：要可点击请包一层 `<button>` / `<a>`；
 * 需要无障碍名称时传 `aria-label`，组件会自动补 `role="img"`。
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { size = 'xs', type = 'icon', initial, className, children, role, ...rest },
  ref,
) {
  const content = children ?? initial;
  const named = Boolean(rest['aria-label'] || rest['aria-labelledby']);

  const rootClass = [
    'vm-avatar',
    `vm-avatar--${size}`,
    `vm-avatar--${type}`,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      {...rest}
      ref={ref}
      className={rootClass}
      role={role ?? (named ? 'img' : undefined)}
      data-size={size}
      data-type={type}
    >
      {type === 'initial' ? (
        <span className="vm-avatar__initial" aria-hidden={named || undefined}>
          {content}
        </span>
      ) : (
        /* Figma: Line icon / user-line（原始矢量，viewBox 按 12×12 外框等比居中） */
        <svg
          className="vm-avatar__icon"
          viewBox="0 0 12 12"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          <g transform="translate(1.6385 1.325)" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.42974 5.35C7.44541 5.35 8.34246 6.01255 8.64116 6.9833C9.00294 8.15935 8.12356 9.34995 6.89312 9.35H1.83013C0.599715 9.34992 -0.279684 8.15933 0.0820801 6.9833C0.380771 6.01256 1.27785 5.35002 2.29351 5.35H6.42974ZM2.29351 6.1C1.6071 6.10002 1.00074 6.54771 0.798877 7.20376C0.58544 7.89752 1.10429 8.59992 1.83013 8.6H6.89312C7.61899 8.59995 8.13782 7.89754 7.92437 7.20376C7.72249 6.5477 7.11615 6.1 6.42974 6.1H2.29351Z"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.36162 0C5.63878 0 6.67412 1.03534 6.67412 2.3125C6.67412 3.58966 5.63878 4.625 4.36162 4.625C3.08449 4.62497 2.04912 3.58964 2.04912 2.3125C2.04912 1.03536 3.08449 3.04091e-05 4.36162 0ZM4.36162 0.75C3.4987 0.75003 2.79912 1.44957 2.79912 2.3125C2.79912 3.17543 3.4987 3.87497 4.36162 3.875C5.22457 3.875 5.92412 3.17544 5.92412 2.3125C5.92412 1.44956 5.22457 0.75 4.36162 0.75Z"
            />
          </g>
        </svg>
      )}
    </span>
  );
});
