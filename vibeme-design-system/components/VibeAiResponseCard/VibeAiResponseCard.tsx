import { forwardRef, useId, type HTMLAttributes, type ReactNode, type SVGProps } from 'react';
import './VibeAiResponseCard.css';

/** 回复卡片状态，对应 Figma 变体属性 `State`（`Thinking` / `Complete` / `Error`，代码里小写）。 */
export type VibeAiResponseCardState = 'thinking' | 'complete' | 'error';

/** 三档状态在 Figma 里的 `State` 文本（`thinking` / `complete` / `error`），可用 `stateLabel` 覆盖。 */
export const VIBE_AI_RESPONSE_CARD_STATE_LABELS: Record<VibeAiResponseCardState, string> = {
  thinking: 'Thinking', // Figma: State=Thinking / State
  complete: 'Complete', // Figma: State=Complete / State
  error: 'Error', // Figma: State=Error / State
};

/** 三档 `Response` 正文的 Figma 原文案，作为 `children` 缺省时的兜底。 */
export const VIBE_AI_RESPONSE_CARD_RESPONSES: Record<VibeAiResponseCardState, string> = {
  thinking: 'Exploring the best direction for your idea…', // Figma: State=Thinking / Response
  complete:
    'Here’s a polished concept based on your prompt, with a bold hook and a warm, cinematic tone.', // Figma: State=Complete / Response
  error: 'Something interrupted this generation. Try again.', // Figma: State=Error / Response
};

/** Figma: `Title` 文本内容（Header 里 `Identity` 右侧的品牌名）。 */
export const VIBE_AI_RESPONSE_CARD_TITLE = 'VibeMe AI';

/** Figma: `Actions` 帧里的 `Copy` 文本动作。 */
export const VIBE_AI_RESPONSE_CARD_COPY_LABEL = 'Copy';

/** Figma: `Actions` 帧里的 `Regenerate` 文本动作。 */
export const VIBE_AI_RESPONSE_CARD_REGENERATE_LABEL = 'Regenerate';

/** Figma: Header 里的 `AI Avatar` —— 紫底方块中的白色 `✦`，示意矢量，建议从 Figma 取原始字形路径。 */
function SparkleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M12 2.6c.5 3.4 1.5 5.6 3.1 6.9 1.3 1.1 3.1 1.7 5.3 2-2.2.3-4 .9-5.3 2-1.6 1.3-2.6 3.5-3.1 6.9-.5-3.4-1.5-5.6-3.1-6.9-1.3-1.1-3.1-1.7-5.3-2 2.2-.3 4-.9 5.3-2C10.5 8.2 11.5 6 12 2.6Z" />
    </svg>
  );
}

export interface VibeAiResponseCardProps
  extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'onCopy'> {
  /**
   * 回复状态，映射 Figma 变体属性 `State`（`Thinking` / `Complete` / `Error`）。
   * 决定描边色、`State` 文本颜色、正文颜色，以及是否渲染 `Actions`；默认 `thinking`。
   */
  state?: VibeAiResponseCardState;
  /**
   * 头部标题，对应 Figma 的 `Title` 文本内容（内容插槽）。默认 `VibeMe AI`。
   * 注意它占用的是原生 `title`（tooltip）的位置：接口里已 `Omit<'title'>`，不会当提示语用。
   */
  title?: ReactNode;
  /**
   * 右上角状态文本，对应 Figma 的 `State` 文本内容（内容插槽）。
   * 不传时按 `state` 取 Figma 原文案（`Thinking` / `Complete` / `Error`）。
   */
  stateLabel?: ReactNode;
  /** 正文，对应 Figma 的 `Response` 文本内容（内容插槽）；不传时按 `state` 取 Figma 原文案。 */
  children?: ReactNode;
  /**
   * 动作区插槽，对应 Figma 的 `Actions` 帧（只在 `state="complete"` 的变体里存在）。
   * 传了就用它整体替换默认的 `Copy` / `Regenerate` 两个按钮。
   */
  actions?: ReactNode;
  /**
   * 默认动作区里 `Copy` 按钮的点击回调。**会覆盖 React 原生的 `onCopy` 剪贴板事件**
   * （接口里已 `Omit<'onCopy'>`）；要监听原生 copy 事件请挂到外层容器上。
   */
  onCopy?: () => void;
  /** 默认动作区里 `Regenerate` 按钮的点击回调。 */
  onRegenerate?: () => void;
}

/**
 * AI 回复卡片。事实来源：Figma 组件集 `VibeMe AI / Response Card`（node `56070:14800`），
 * 3 个变体 = `State`（Thinking / Complete / Error）。
 *
 * - 固定宽 460（Figma `wSizing=FIXED`），高度由内容撑开；底色三档都是 `color/bg/panel`；
 * - `State=Error` 是唯一换描边的档（`color/status/error`），并且正文降为 `color/text/secondary`；
 * - `State=Complete` 是唯一有 `Actions`（`Copy` / `Regenerate`）的档；卡片本身不可点，没有 hover 变体。
 */
export const VibeAiResponseCard = forwardRef<HTMLElement, VibeAiResponseCardProps>(
  function VibeAiResponseCard(
    {
      state = 'thinking',
      title,
      stateLabel,
      actions,
      onCopy,
      onRegenerate,
      className,
      children,
      id,
      'aria-labelledby': ariaLabelledBy,
      ...rest
    },
    ref,
  ) {
    const autoId = useId();
    const titleId = `${id ?? autoId}-title`;

    const rootClass = [
      'vm-ai-response-card',
      `vm-ai-response-card--${state}`,
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <article
        {...rest}
        ref={ref}
        id={id}
        className={rootClass}
        aria-labelledby={ariaLabelledBy ?? titleId}
        aria-busy={state === 'thinking' || undefined}
        data-state={state}
      >
        <div className="vm-ai-response-card__header">
          <div className="vm-ai-response-card__identity">
            <span className="vm-ai-response-card__avatar">
              {/* Figma: AI Avatar / AI Sparkle */}
              <SparkleIcon />
            </span>
            <span className="vm-ai-response-card__title vm-type-heading-s" id={titleId}>
              {title ?? VIBE_AI_RESPONSE_CARD_TITLE}
            </span>
          </div>
          <span className="vm-ai-response-card__state vm-type-caption-caption" role="status">
            {stateLabel ?? VIBE_AI_RESPONSE_CARD_STATE_LABELS[state]}
          </span>
        </div>

        <p className="vm-ai-response-card__response vm-type-heading-body-s-regular">
          {children ?? VIBE_AI_RESPONSE_CARD_RESPONSES[state]}
        </p>

        {actions ? (
          <div className="vm-ai-response-card__actions">{actions}</div>
        ) : state === 'complete' ? (
          <div className="vm-ai-response-card__actions">
            {/* Figma: Actions / Copy */}
            <button
              type="button"
              className="vm-ai-response-card__action vm-type-caption-caption"
              onClick={onCopy}
            >
              {VIBE_AI_RESPONSE_CARD_COPY_LABEL}
            </button>
            {/* Figma: Actions / Regenerate */}
            <button
              type="button"
              className="vm-ai-response-card__action vm-ai-response-card__action--accent vm-type-caption-caption"
              onClick={onRegenerate}
            >
              {VIBE_AI_RESPONSE_CARD_REGENERATE_LABEL}
            </button>
          </div>
        ) : null}
      </article>
    );
  },
);
