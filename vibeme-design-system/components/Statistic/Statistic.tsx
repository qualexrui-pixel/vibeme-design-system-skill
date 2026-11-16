import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import './Statistic.css';

/** 统计类型，对应 Figma 变体属性 `Type`。 */
export type StatisticType = 'default' | 'up' | 'down';

/** 统计数值 props。 */
export interface StatisticProps extends HTMLAttributes<HTMLDListElement> {
  /**
   * 统计类型，映射 Figma 变体属性 `Type`。
   * `default` 只有标签 ＋ 数值（77×58）；`up` 多一行 Success 色的箭头 ＋ 变化文案；
   * `down` 同理但换成 Error 色。默认 `default`。
   * @default 'default'
   */
  type?: StatisticType;
  /**
   * 标签，对应 Figma 文本层 `总播放量`（样式 `Caption/Caption` 12 Medium /18，
   * 色 `Text/Text-Secondary` ⇒ `--vm-text-secondary`）。
   */
  label?: ReactNode;
  /**
   * 数值，对应 Figma 文本层 `12,846`（样式 `Heading/XXL` 24 Bold /36，
   * 色 `Text/Text-Primary` ⇒ `--vm-text-primary`）。千分位与单位由调用方格式化。
   */
  value?: ReactNode;
  /**
   * 变化文案，对应 Figma 文本层 `+12.5%` / `-3.2%`（同样是 `Caption/Caption`）。
   * 只有 `type="up"` / `type="down"` 时才渲染；`+` / `-` 号属于文案本身，组件不自动补。
   */
  change?: ReactNode;
}

/**
 * 统计数值。事实来源：Figma 组件集 `Statistic`（node `56065:7053`），
 * 3 个变体 = `Type`(default / up / down)。
 *
 * - 组件集里没有 `State` 轴：无 hover / pressed / focus / disabled 变体，故不写任何交互态样式；
 * - `type` 决定第三行是否存在，以及箭头与变化文案用 `--vm-status-success` 还是 `--vm-status-error`；
 * - 内部结构：根部 VERTICAL gap `--vm-space-1`（4px），第三行是 HORIZONTAL gap `--vm-space-1`。
 */
export const Statistic = forwardRef<HTMLDListElement, StatisticProps>(function Statistic(
  { type = 'default', label, value, change, className, ...rest },
  ref,
) {
  const rootClass = ['vm-statistic', `vm-statistic--${type}`, className ?? ''].filter(Boolean).join(' ');
  const showChange = type !== 'default' && change !== undefined && change !== null;

  return (
    <dl {...rest} ref={ref} className={rootClass} data-type={type}>
      {/* Figma: 标签文本层（Caption/Caption，Text/Text-Secondary） */}
      {label !== undefined && label !== null ? (
        <dt className="vm-statistic__label vm-type-caption-caption">{label}</dt>
      ) : null}
      {/* Figma: 数值文本层（Heading/XXL，Text/Text-Primary） */}
      <dd className="vm-statistic__value vm-type-heading-xxl">
        {value}
        {showChange ? (
          <span className="vm-statistic__change vm-type-caption-caption">
            {/* Figma: Filled icon 实例 chevron-up_filled / chevron-down_filled（12×12，示意几何图形） */}
            <svg
              className="vm-statistic__change-icon"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              {type === 'up' ? (
                <path d="M2.6 7.6 6 4.2l3.4 3.4" />
              ) : (
                <path d="M2.6 4.4 6 7.8l3.4-3.4" />
              )}
            </svg>
            {change}
          </span>
        ) : null}
      </dd>
    </dl>
  );
});
