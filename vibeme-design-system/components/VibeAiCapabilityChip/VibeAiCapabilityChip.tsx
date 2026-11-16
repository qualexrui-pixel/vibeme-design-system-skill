import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SVGProps,
} from 'react';
import './VibeAiCapabilityChip.css';

/** 能力档位，对应 Figma 变体属性 `Type`（`Creative` / `Precise` / `Fast`，代码里小写）。 */
export type VibeAiCapabilityChipType = 'creative' | 'precise' | 'fast';

/** 每档在 Figma 里的原文案（`Chip Label` 文本节点）。传 `children` 时以 `children` 为准。 */
export const VIBE_AI_CAPABILITY_CHIP_LABELS: Record<VibeAiCapabilityChipType, string> = {
  creative: 'Creative', // Figma: Type=Creative / Chip Label
  precise: 'Precise', // Figma: Type=Precise / Chip Label
  fast: 'Fast', // Figma: Type=Fast / Chip Label
};

/** Figma: `Type=Creative` 的 `Chip Icon`（`✦`）—— 示意矢量，建议从 Figma 取原始字形路径。 */
function SparkleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M12 2.6c.5 3.4 1.5 5.6 3.1 6.9 1.3 1.1 3.1 1.7 5.3 2-2.2.3-4 .9-5.3 2-1.6 1.3-2.6 3.5-3.1 6.9-.5-3.4-1.5-5.6-3.1-6.9-1.3-1.1-3.1-1.7-5.3-2 2.2-.3 4-.9 5.3-2C10.5 8.2 11.5 6 12 2.6Z" />
    </svg>
  );
}

/** Figma: `Type=Precise` 的 `Chip Icon`（`◎`）—— 示意矢量，建议从 Figma 取原始字形路径。 */
function ApertureIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" {...props}>
      <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2.6" fill="currentColor" />
    </svg>
  );
}

/** Figma: `Type=Fast` 的 `Chip Icon`（`⚡`）—— 示意矢量，建议从 Figma 取原始字形路径。 */
function BoltIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M13.6 2 5.4 13.1h4.5L9.2 22l8.3-11.6h-4.6L13.6 2Z" />
    </svg>
  );
}

const ICONS: Record<
  VibeAiCapabilityChipType,
  (props: SVGProps<SVGSVGElement>) => ReactElement
> = {
  creative: SparkleIcon,
  precise: ApertureIcon,
  fast: BoltIcon,
};

export interface VibeAiCapabilityChipProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /**
   * 能力档位，映射 Figma 变体属性 `Type`（`Creative` / `Precise` / `Fast`）。
   * 决定图标字形与默认文案；默认 `creative`，与 Figma 的 `defaultVariant` 一致。
   */
  type?: VibeAiCapabilityChipType;
  /**
   * 选中态。**Figma 没有独立的 `Selected` 轴**——选中样式被烘焙在 `Type=Creative` 变体里
   * （`color/bg/brand-soft` 底 ＋ `color/accent/pink` 图标）；这里把它拆成受控状态并映射到
   * 原生 `aria-pressed`，默认值 `type === 'creative'` 复现 Figma 的默认像素。
   */
  selected?: boolean;
  /**
   * 胶囊文案，对应 Figma 的 `Chip Label` 文本内容（内容插槽，优先于 `type` 的默认文案）。
   */
  children?: ReactNode;
}

/**
 * AI 能力切换胶囊。事实来源：Figma 组件集 `VibeMe AI / Capability Chip`（node `56070:14790`），
 * 3 个变体 = `Type`（Creative / Precise / Fast），互斥的 AI 模式开关（Figma 描述：`Use to switch AI modes…`）。
 *
 * - 渲染成原生 `<button type="button">`，原生 `type` 被 `Omit` 掉（本组件的 `type` 指能力档位）；
 * - Figma 没有 hover / pressed / focus / disabled 变体：hover 不换色，focus 用 `:focus-visible`，
 *   `disabled` 只降不透明度；
 * - `selected` 默认跟随 `type === 'creative'`，即 Figma `defaultVariant` 的选中画法。
 */
export const VibeAiCapabilityChip = forwardRef<HTMLButtonElement, VibeAiCapabilityChipProps>(
  function VibeAiCapabilityChip(
    { type = 'creative', selected, className, children, disabled, ...rest },
    ref,
  ) {
    const isSelected = selected ?? type === 'creative';
    const Icon = ICONS[type];

    const rootClass = [
      'vm-ai-capability-chip',
      isSelected ? 'vm-ai-capability-chip--selected' : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        {...rest}
        ref={ref}
        type="button"
        disabled={disabled}
        aria-pressed={isSelected}
        className={rootClass}
        data-type={type}
      >
        <span className="vm-ai-capability-chip__icon">
          <Icon />
        </span>
        <span className="vm-ai-capability-chip__label vm-type-caption-caption">
          {children ?? VIBE_AI_CAPABILITY_CHIP_LABELS[type]}
        </span>
      </button>
    );
  },
);
