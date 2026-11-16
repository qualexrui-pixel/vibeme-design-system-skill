import { forwardRef, type OlHTMLAttributes, type ReactNode } from 'react';
import './Steps.css';

/** 方向，对应 Figma 变体属性 `Type`。 */
export type StepsType = 'horizontal' | 'vertical';

/** 步骤条里的一步。文案对应 Figma 每组步骤里的 TEXT 节点（`步骤 1` / `步骤 2` / `步骤 3`）。 */
export interface StepsItem {
  /** 该步的文案。任意节点均可（可以塞 `Tag`、`Button` 等），序号与对勾由组件自己渲染。 */
  label: ReactNode;
}

/**
 * 步骤条（Steps）。事实来源：Figma 组件集 `Steps`（node `56064:6770`），
 * 4 个变体 = `Type`(horizontal/vertical) × `Current`(1/2)，默认 `Type=horizontal, Current=1`，参考尺寸 309×24。
 *
 * Figma **没有 `State` 轴**（没有 hover / pressed / focus / disabled 变体），所以：
 * 既不写任何交互伪类，也没有 `disabled` prop。每一步的 `complete` / `current` / `upcoming`
 * 不是变体，而是**由 `current` 与下标算出来的**，只落在 class 与 `data-state` 上。
 *
 * 注意：Figma 的 `Type` 轴占用了 `<ol>` 原生的 `type`（编号样式），因此本组件 Omit 掉原生的 `type`，
 * 需要换编号样式时用 `list-style` 自行处理（默认 `none`）。
 */
export interface StepsProps extends Omit<OlHTMLAttributes<HTMLOListElement>, 'type' | 'children'> {
  /**
   * 方向，映射 Figma 变体属性 `Type`：
   * `horizontal` = 步骤横向排列（连接线 32×2）；`vertical` = 纵向排列（连接线 2×24，左边缘与圆点左边缘对齐）。
   * @default 'horizontal'
   */
  type?: StepsType;
  /**
   * 当前步的序号，映射 Figma 变体属性 `Current`。**1 起**（不是 0 起下标，也不是百分比）。
   * Figma 只给了 `1` / `2` 两个样本值，真实合法范围是 `1..items.length`，越界会被钳制到该区间。
   * `index + 1 < current` 的步骤为已完成（品牌色圆底 + 对勾），`= current` 的为当前（品牌色描边），
   * `> current` 的为未开始。
   * @default 1
   */
  current?: number;
  /**
   * 步骤内容插槽（Figma 里是每组步骤的 TEXT 节点）。Figma 的 3 步只是示例，步数与文案都由这里决定。
   * 缺省等于空数组：只保留 `<ol>` 根（承载 `ref` / `className` / `...rest` 与列表语义），
   * 不渲染任何 `<li>`、序号、对勾与连接线；`current` 也被当作 0 处理，不会凭空补一步。
   * @default []
   */
  items?: StepsItem[];
}

/**
 * Figma: `Filled icon / Property 1=circle-check-filled`（14×14 图标框内的 12.25×12.25 矢量）。
 * 矢量本身是一个**实心圆 + 挖空的对勾**（`fill-rule="evenodd"`），所以填 `currentColor`
 * （已完成态 = `--vm-neutral-950`）后，对勾处透出的是圆点的品牌色底 —— 与 Figma 渲染一致。
 */
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false">
      <path
        transform="translate(0.875 0.875)"
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
        d="M6.125 0C9.50774 0 12.25 2.74226 12.25 6.125C12.25 9.50774 9.50774 12.25 6.125 12.25C2.74226 12.25 0 9.50774 0 6.125C0 2.74226 2.74226 0 6.125 0ZM9.46464 3.81559C9.23685 3.58787 8.86756 3.58786 8.63977 3.81559L5.07967 7.37512L3.61023 5.90596C3.38243 5.67824 3.01315 5.67823 2.78536 5.90596C2.5576 6.13375 2.55763 6.50303 2.78536 6.73083L4.66724 8.613C4.77663 8.72239 4.92525 8.78361 5.07996 8.78361C5.23461 8.78358 5.38303 8.72235 5.49239 8.613L9.46464 4.64046C9.69239 4.41265 9.69242 4.04338 9.46464 3.81559Z"
      />
    </svg>
  );
}

/**
 * 步骤条。渲染成 `<ol>` / `<li>`，每一步由「圆点 + 文案」组成，最后一步之外带一段连接线。
 *
 * 圆点只有三种形态，全部来自 Figma：
 * 已完成 = 品牌色实心圆 + 对勾；当前 = 品牌色 2px 描边 + 品牌色序号；未开始 = 12% 白描边 + 30% 白序号。
 */
export const Steps = forwardRef<HTMLOListElement, StepsProps>(function Steps(
  { type = 'horizontal', current = 1, items = [], className, ...rest },
  ref,
) {
  // current 是 1 起序号；0 / 负数钳到 1，超过步数钳到最后一步（Figma 只有 1/2 两个样本，别照抄值域）。
  const active = items.length === 0 ? 0 : Math.min(Math.max(current, 1), items.length);

  const rootClass = ['vm-steps', `vm-steps--${type}`, className ?? ''].filter(Boolean).join(' ');

  return (
    // items 为空（缺省即空数组）时就是「一个没有步骤的列表」：没有 <li>、没有连接线、没有多余分隔符，
    // 根 <ol> 保留下来承载 ref / className / ...rest（与 Descriptions 空 items 的处理一致）。
    <ol {...rest} ref={ref} className={rootClass} data-type={type}>
      {items.map((item, index) => {
        const step = index + 1;
        const state = step < active ? 'complete' : step === active ? 'current' : 'upcoming';
        return (
          <li
            key={index}
            className={`vm-steps__item vm-steps__item--${state}`}
            data-state={state}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            {/* 序号/对勾是纯装饰：读屏靠文案 + aria-current 就够了，不重复念数字 */}
            <span
              className={`vm-steps__indicator vm-steps__indicator--${state}`}
              aria-hidden="true"
            >
              {state === 'complete' ? (
                <CheckIcon />
              ) : (
                <span className="vm-steps__number vm-type-caption-caption">{step}</span>
              )}
            </span>
            <span className="vm-steps__label vm-type-heading-body-s-regular">{item.label}</span>
          </li>
        );
      })}
    </ol>
  );
});
