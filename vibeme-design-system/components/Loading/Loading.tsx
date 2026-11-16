import { forwardRef, type SVGProps } from 'react';
import './Loading.css';

/** 尺寸档位，对应 Figma 变体属性 `Size`（sm 16 / md 24 / lg 32，px）。 */
export type LoadingSize = 'sm' | 'md' | 'lg';

/** Figma 三档实例尺寸（px），与 `Size=sm|md|lg` 的 16 / 24 / 32 一一对应。 */
const SIZE_PX: Record<LoadingSize, number> = { sm: 16, md: 24, lg: 32 };

/**
 * Figma 的描边线宽变量 `border/width/ring` ＝ 3px（CSS `--vm-border-width-ring`），三档共用同一个变量，
 * 所以 16 / 24 / 32 三档的环线都是 3px、**不随尺寸缩放**。这里只用它推导圆的半径，
 * 真正的线宽由 CSS 的 `stroke-width: var(--vm-border-width-ring)` 给出。
 */
const RING_WIDTH = 3;

/** 圆弧占整圈的比例：Figma 的 `Vector` 是 270° 弧（path 从 12 点顺时针到 9 点），即 3/4 圈。 */
const ARC_RATIO = 0.75;

/**
 * 环形加载指示器 props。事实来源：Figma 组件集 `Loading`（node `56063:6842`），
 * 3 个变体只有一个属性轴 `Size`（sm / md / lg），没有任何状态轴。
 *
 * 宽高已从 props 里剔除：尺寸只由 `size` 决定（三档都是 Figma 里的固定尺寸），
 * 需要额外留白请用 `className` 或外层容器。
 */
export interface LoadingProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  /**
   * 尺寸档位，映射 Figma 变体属性 `Size`（`sm` 16 / `md` 24 / `lg` 32）。
   * 三档只改直径，环线保持 3px。默认 `sm`（与 Figma 的默认变体 `Size=sm` 一致）。
   */
  size?: LoadingSize;
  /**
   * 无障碍名称，默认 `加载中`。Figma 里没有这个属性，补它是为了让
   * `<svg role="status">` 有可读的播报内容；`aria-label` 的优先级更高。
   * 纯装饰场景（旁边已经有「正在生成…」这类文字）请传 `aria-hidden` 或 `label=""`。
   */
  label?: string;
}

/**
 * 环形加载指示器（不确定进度）。底环 `--vm-white-6`（`White/White-6` 12% 白）＋ 270° 品牌色弧 `--vm-brand`
 * （`Brand/Brand` #FFCC90），线宽 `--vm-border-width-ring`（`border/width/ring` 3px），圆角与线帽都是圆的
 * （Figma 的 `strokeCap` = `ROUND`）。
 *
 * 环与弧画在**同一个圆心**上：半径 `(尺寸 - 3) / 2`。Figma 里底环是 16×16 的 INSIDE 3px 描边（视觉带宽 5–8），
 * 弧是 13×13 的 CENTER 3px 描边（同样 5–8），二者等值，所以一个 `<circle>` 加居中描边即可复刻。
 */
export const Loading = forwardRef<SVGSVGElement, LoadingProps>(function Loading(
  { size = 'sm', label = '加载中', className, ...rest },
  ref,
) {
  const px = SIZE_PX[size];
  const center = px / 2;
  const radius = (px - RING_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * ARC_RATIO;
  const rootClass = ['vm-loading', `vm-loading--${size}`, className ?? ''].filter(Boolean).join(' ');
  const ariaLabel = (rest['aria-label'] as string | undefined) ?? label;

  return (
    <svg
      {...rest}
      ref={ref}
      className={rootClass}
      viewBox={`0 0 ${px} ${px}`}
      role={rest.role ?? 'status'}
      aria-label={ariaLabel}
    >
      {/* Figma: Frame —— 底环，圆角 999、描边 White/White-6 3px（INSIDE） */}
      <circle className="vm-loading__ring" cx={center} cy={center} r={radius} />
      <g className="vm-loading__spin">
        {/* Figma: Vector —— 270° 弧，Brand/Brand，stroke-linecap: round；rotate(-90) 让弧从 12 点起画 */}
        <circle
          className="vm-loading__arc"
          cx={center}
          cy={center}
          r={radius}
          strokeDasharray={`${arc} ${circumference - arc}`}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </g>
    </svg>
  );
});
