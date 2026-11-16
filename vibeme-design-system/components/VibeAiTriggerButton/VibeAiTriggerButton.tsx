import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import './VibeAiTriggerButton.css';

/** 尺寸档位，对应 Figma 变体属性 `Size`（大写值 `Medium` / `Large` 在代码里转小写）。 */
export type VibeAiTriggerButtonSize = 'medium' | 'large';

/**
 * AI 主入口按钮。事实来源：Figma 组件集 `VibeMe AI / Trigger Button`（node `56070:14742`），
 * 6 个变体 = `Size`(Medium / Large) × `State`(Default / Hover / Disabled)。
 *
 * - 交互态 `State=Hover` **不做成 prop**，由 CSS `:hover` 触发；
 *   应用态 `State=Disabled` 映射到原生 `disabled`；
 * - 该组件集属于 `VibeMe AI` 主题（紫 `--vm-ai-color-bg-brand` #8547FF / 粉
 *   `--vm-ai-color-accent-pink` #FF57AD / 底 `--vm-ai-color-bg-canvas` #080A11），
 *   **不要**把主库的 `--vm-*` 数值型 token 混进来；
 * - Figma 里的图标是一个文字图层（`AI Sparkle`，字符 `✦`）。按实现规范改成内联 SVG 星形，
 *   `currentColor` 跟随文字色，**示意，建议从 Figma 取原始矢量**。
 */
export interface VibeAiTriggerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 尺寸档位，映射 Figma 变体属性 `Size`。
   * `medium` = 高 40 / 横向内边距 `--vm-ai-spacing-16`（16）/ 图标 14；
   * `large` = 高 48 / 横向内边距 `--vm-ai-spacing-20`（20）/ 图标 16。
   * @default 'medium'
   */
  size?: VibeAiTriggerButtonSize;
  /**
   * 按钮文案，对应 Figma TEXT 图层 `Label`（默认内容 `Ask VibeMe AI`）。
   * Figma 没有把它定义成 TEXT 属性，所以默认值取 Figma 里的字面文案。
   * @default 'Ask VibeMe AI'
   */
  children?: ReactNode;
}

/** Figma: AI Sparkle —— 四角星（Figma 里是 Poppins 的 `✦` 字形，此处用等义矢量复刻）。 */
function SparkleIcon({ size }: { size: VibeAiTriggerButtonSize }) {
  const px = size === 'large' ? 16 : 14;
  return (
    <svg
      className="vm-vibe-ai-trigger-button__icon"
      width={px}
      height={px}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M8 1.2c.36 2.62 1.53 3.79 4.15 4.15.3.04.3.46 0 .5C9.53 6.21 8.36 7.38 8 10c-.36-2.62-1.53-3.79-4.15-4.15-.3-.04-.3-.46 0-.5C6.47 4.99 7.64 3.82 8 1.2Z"
        fill="currentColor"
      />
      <path
        d="M12.4 9.1c.18 1.3.76 1.88 2.06 2.06.15.02.15.23 0 .25-1.3.18-1.88.76-2.06 2.06-.02.15-.23.15-.25 0-.18-1.3-.76-1.88-2.06-2.06-.15-.02-.15-.23 0-.25 1.3-.18 1.88-.76 2.06-2.06.02-.15.23-.15.25 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * AI 主入口按钮（`VibeMe AI` 主题）。渲染真实 `<button type="button">`，原生属性全部透传。
 */
export const VibeAiTriggerButton = forwardRef<HTMLButtonElement, VibeAiTriggerButtonProps>(
  function VibeAiTriggerButton({ size = 'medium', children = 'Ask VibeMe AI', className, type = 'button', ...rest }, ref) {
    const rootClass = [
      'vm-vibe-ai-trigger-button',
      `vm-vibe-ai-trigger-button--${size}`,
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button {...rest} ref={ref} type={type} className={rootClass} data-size={size}>
        <SparkleIcon size={size} />
        <span className="vm-vibe-ai-trigger-button__label">{children}</span>
      </button>
    );
  },
);
