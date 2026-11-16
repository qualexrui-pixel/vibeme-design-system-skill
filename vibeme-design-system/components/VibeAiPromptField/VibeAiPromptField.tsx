import { forwardRef, type ReactNode, type TextareaHTMLAttributes } from 'react';
import './VibeAiPromptField.css';

/**
 * AI 提示词输入区。事实来源：Figma 组件集 `VibeMe AI / Prompt Field`（node `56070:14761`），
 * 3 个变体 = `State`(Default / Focus / Disabled)，参考尺寸 420×136。
 *
 * - 交互态 `State=Focus` **不做成 prop**，由 CSS `:focus-within` 触发（Figma 只把描边换成
 *   `--vm-ai-color-bg-brand`，线宽仍是 1px）；
 * - 应用态 `State=Disabled` 做成 `disabled` prop，并同时落到内部 `<textarea>` 与「Generate」按钮；
 * - 容器是 `<div>`、输入是真实 `<textarea>`、右下角「Generate」是真实 `<button type="button">`；
 * - 属于 `VibeMe AI` 主题，取值一律 `--vm-ai-*`，不要与主库 token 混用。
 */
export interface VibeAiPromptFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * 左下角快捷键提示，对应 Figma TEXT 图层 `Hint`（默认内容 `⌘ ↵ to generate`）。
   * Figma 没有把它定义成 TEXT 属性，故默认值取 Figma 字面文案。
   */
  hint?: ReactNode;
  /**
   * 右下角按钮文案，对应 Figma 图层 `Send` 里的 `Send Label`（默认内容 `Generate`）。
   */
  submitLabel?: ReactNode;
  /**
   * 点击「Generate」触发。Figma 里 `Send` 是一个 HUG 的按钮框，这里映射成真实 `<button>` 的点击回调；
   * 按回车键提交由调用方在 `onKeyDown` 里处理（Figma 的 `Hint` 文案就是提示这个快捷键）。
   */
  onSend?: () => void;
}

/**
 * AI 提示词输入区（`VibeMe AI` 主题）。
 *
 * 原生 `<textarea>` 属性（`value` / `defaultValue` / `onChange` / `placeholder` / `rows` / `id` /
 * `aria-*` …）通过 `...rest` 透传到内部 textarea；`className` 落到最外层容器。
 */
export const VibeAiPromptField = forwardRef<HTMLTextAreaElement, VibeAiPromptFieldProps>(
  function VibeAiPromptField(
    {
      hint = '⌘ ↵ to generate',
      submitLabel = 'Generate',
      onSend,
      disabled,
      className,
      rows = 2,
      ...rest
    },
    ref,
  ) {
    const rootClass = [
      'vm-vibe-ai-prompt-field',
      disabled ? 'vm-vibe-ai-prompt-field--disabled' : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={rootClass} data-disabled={disabled || undefined}>
        {/* Figma: Prompt —— 空态提示文案绑的是 color/text/primary（禁用才是 color/text/secondary） */}
        <textarea {...rest} ref={ref} className="vm-vibe-ai-prompt-field__input" rows={rows} disabled={disabled} />

        {/* Figma: Actions —— 两端对齐的一行：左 Hint、右 Send */}
        <div className="vm-vibe-ai-prompt-field__actions">
          <span className="vm-vibe-ai-prompt-field__hint">{hint}</span>
          <button
            type="button"
            className="vm-vibe-ai-prompt-field__send"
            disabled={disabled}
            onClick={onSend}
          >
            <span className="vm-vibe-ai-prompt-field__send-label">{submitLabel}</span>
          </button>
        </div>
      </div>
    );
  },
);
