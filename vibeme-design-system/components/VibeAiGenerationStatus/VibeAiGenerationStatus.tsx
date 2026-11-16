import { forwardRef, type HTMLAttributes, type ReactNode, type SVGProps } from 'react';
import './VibeAiGenerationStatus.css';

/** 生成阶段档位，对应 Figma 变体属性 `State`（`Thinking` / `Generating` / `Complete`，代码里小写）。 */
export type VibeAiGenerationStatusState = 'thinking' | 'generating' | 'complete';

/**
 * 每档状态在 Figma 里的原文案（`Status Label` 文本节点的内容）。
 * 只是兜底默认值，调用方传 `children` 时以 `children` 为准。
 */
export const VIBE_AI_GENERATION_STATUS_LABELS: Record<VibeAiGenerationStatusState, string> = {
  thinking: 'Thinking…', // Figma: State=Thinking / Status Label
  generating: 'Generating your vibe…', // Figma: State=Generating / Status Label
  complete: 'Ready', // Figma: State=Complete / Status Label
};

/** Figma: `AI Sparkle`（Thinking / Generating 档的 `✦`）—— 示意矢量，建议从 Figma 取原始字形路径。 */
function SparkleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M12 2.6c.5 3.4 1.5 5.6 3.1 6.9 1.3 1.1 3.1 1.7 5.3 2-2.2.3-4 .9-5.3 2-1.6 1.3-2.6 3.5-3.1 6.9-.5-3.4-1.5-5.6-3.1-6.9-1.3-1.1-3.1-1.7-5.3-2 2.2-.3 4-.9 5.3-2C10.5 8.2 11.5 6 12 2.6Z" />
    </svg>
  );
}

/** Figma: `Status Icon`（Complete 档的 `✓`）—— 示意矢量，建议从 Figma 取原始字形路径。 */
function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M4.5 12.8 9.4 17.7 19.5 6.9"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface VibeAiGenerationStatusProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * 生成阶段，映射 Figma 变体属性 `State`（`Thinking` / `Generating` / `Complete`）。
   * 它同时决定底色、图标形状与图标颜色；默认 `thinking`，与 Figma 的 `defaultVariant` 一致。
   */
  state?: VibeAiGenerationStatusState;
  /**
   * 状态文案，对应 Figma 的 `Status Label` 文本内容（内容插槽，优先于 `state` 的默认文案）。
   * 不传时按 `state` 取 Figma 原文案（`Thinking…` / `Generating your vibe…` / `Ready`）。
   */
  children?: ReactNode;
}

/**
 * AI 生成状态胶囊。事实来源：Figma 组件集 `VibeMe AI / Generation Status`（node `56070:14780`），
 * 3 个变体 = `State`（Thinking / Generating / Complete）。
 *
 * - 只读指示器：Figma 没有 hover / pressed / focus / disabled 变体，所以没有交互态与禁用态；
 * - `thinking` 与 `generating` 只差文案，`complete` 才换底色并把图标从 `✦` 换成 `✓`。
 */
export const VibeAiGenerationStatus = forwardRef<HTMLSpanElement, VibeAiGenerationStatusProps>(
  function VibeAiGenerationStatus(
    { state = 'thinking', className, children, role = 'status', ...rest },
    ref,
  ) {
    const rootClass = [
      'vm-ai-generation-status',
      `vm-ai-generation-status--${state}`,
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    const Icon = state === 'complete' ? CheckIcon : SparkleIcon;

    return (
      <span {...rest} ref={ref} className={rootClass} role={role} data-state={state}>
        <span className="vm-ai-generation-status__icon">
          <Icon />
        </span>
        <span className="vm-ai-generation-status__label vm-type-caption-caption">
          {children ?? VIBE_AI_GENERATION_STATUS_LABELS[state]}
        </span>
      </span>
    );
  },
);
