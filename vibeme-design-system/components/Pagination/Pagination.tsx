import { forwardRef, type HTMLAttributes } from 'react';
import './Pagination.css';

/** 尺寸档位，对应 Figma 变体属性 `Size`（`sm` 单元格 28×28 / `md` 单元格 32×32）。 */
export type PaginationSize = 'sm' | 'md';

/** 展示型，对应 Figma 变体属性 `Type`（`full` 逐个页码 / `simple` 中间显示「当前 / 总数」）。 */
export type PaginationType = 'full' | 'simple';

/** 分页 props。Figma 组件集只有 `Size` × `Type` 两个属性轴，页码本身是数值而不是变体。 */
export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange' | 'children'> {
  /**
   * 尺寸档位，映射 Figma 变体属性 `Size`（`sm` / `md`）。
   * 只改单元格边长（28 / 32）与整组高度，圆角 `--vm-radius-md`、字号与间距不变。
   * @default 'sm'
   */
  size?: PaginationSize;
  /**
   * 展示型，映射 Figma 变体属性 `Type`（`full` / `simple`）。
   * Figma 里 `full` 只画了 3 个页码，那只是视觉样本，`total` 取任意正整数都合法。
   * @default 'full'
   */
  type?: PaginationType;
  /**
   * 当前页，**1 起算的真实数值**（对应 Figma 里被 `Brand/Brand` 填充的那一格）。
   * 会钳制到 `[1, max(total,1)]`：0 / 负数 / 非有限值钳到 1，超过总页数钳到最后一页，不抛错。
   * @default 1
   */
  current?: number;
  /**
   * 总页数，真实数值（≥1）。`full` 会为每一项渲染一个页码单元格。
   * 缺省 1 = 只有一页：页码 `1` 高亮，左右箭头都因首/末页而禁用，不补空白格。
   * 取 1 而不是 0，是为了和实现里 `Math.max(1, …)` 的钳制语义一致（写 0 也会被静默钳成 1）。
   * @default 1
   */
  total?: number;
  /** 页码变化回调；点击当前页、越界或 `disabled` 时不会触发。 */
  onChange?: (page: number) => void;
  /**
   * 整组禁用。Figma 没有 disabled 变体，这里按全库规则补：整组
   * `opacity: var(--vm-opacity-disabled)`，且每个按钮落到原生 `disabled`。
   * @default false
   */
  disabled?: boolean;
}

/** 内联 `chevron-left_filled` 矢量；`direction="right"` 用同一路径旋转 180°。 */
function ChevronIcon(props: { direction: 'left' | 'right' }) {
  return (
    <svg
      aria-hidden="true"
      className={`vm-pagination__icon vm-pagination__icon--${props.direction}`}
      focusable="false"
      height="12"
      viewBox="0 0 7.52011 12.1202"
      width="8"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Figma: Filled icon / chevron-left_filled（右侧为同一矢量的镜像） */}
      <path
        d="M0.806776 4.88065C0.360329 5.2899 0.137105 5.49452 0.0544576 5.7346C-0.0181526 5.94553 -0.0181525 6.17468 0.0544577 6.3856C0.137105 6.62568 0.360329 6.8303 0.806777 7.23955L4.83895 10.9357C5.68691 11.713 6.11089 12.1017 6.472 12.119C6.78562 12.1341 7.08813 12.0011 7.28891 11.7597C7.52011 11.4817 7.52011 10.9066 7.52011 9.75626L7.52011 2.36394C7.52011 1.21363 7.52011 0.63847 7.28891 0.360521C7.08813 0.119128 6.78562 -0.0139443 6.472 0.00116008C6.11089 0.0185519 5.68691 0.407201 4.83894 1.1845L0.806776 4.88065Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 分页。事实来源：Figma 组件集 `Pagination`（node `56064:6707`），4 个变体 = `Size` × `Type`。
 *
 * - Figma **没有** `State` 轴，所以没有 `state` prop：箭头单元格（有描边）hover 换
 *   `--vm-border-default` → `--vm-white-4`；页码单元格（无底色无描边）hover 加
 *   `--vm-surface-hover` + 文字 `--vm-text-primary`；两者都由 `:hover` / `:focus-visible` 承担；
 * - 应用态只有 `disabled`（整组）与「首/末页自动禁用箭头」，落到原生 `disabled`；
 * - 当前页是数值 `current`，不是 Figma 变体（Figma 示例里高亮的是第 2 页）。
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(props, ref) {
  const { size = 'sm', type = 'full', current = 1, total = 1, onChange, disabled = false, className, ...rest } =
    props;

  const totalPages = Math.max(1, Math.floor(Number.isFinite(total) ? total : 1));
  const rawCurrent = Math.floor(Number.isFinite(current) ? current : 1);
  const page = Math.min(Math.max(1, rawCurrent), totalPages);

  const goTo = (next: number) => {
    if (disabled || next < 1 || next > totalPages || next === page) return;
    onChange?.(next);
  };

  const rootClass = ['vm-pagination', `vm-pagination--${size}`, className ?? ''].filter(Boolean).join(' ');

  const arrow = (direction: 'left' | 'right') => {
    const isPrev = direction === 'left';
    const target = isPrev ? page - 1 : page + 1;
    const blocked = disabled || (isPrev ? page <= 1 : page >= totalPages);
    return (
      <li className="vm-pagination__item" key={direction}>
        <button
          aria-label={isPrev ? '上一页' : '下一页'}
          className="vm-pagination__cell vm-pagination__arrow"
          disabled={blocked}
          onClick={() => goTo(target)}
          type="button"
        >
          <ChevronIcon direction={direction} />
        </button>
      </li>
    );
  };

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  const middle =
    type === 'simple' ? (
      <li className="vm-pagination__item" key="simple">
        <span aria-hidden="true" className="vm-pagination__simple vm-type-caption-caption">
          {page} / {totalPages}
        </span>
      </li>
    ) : (
      pages.map((item) => {
        const isCurrent = item === page;
        return (
          <li className="vm-pagination__item" key={item}>
            <button
              aria-current={isCurrent ? 'page' : undefined}
              aria-label={isCurrent ? undefined : `第 ${item} 页`}
              className={[
                'vm-pagination__cell',
                'vm-pagination__page',
                isCurrent ? 'vm-pagination__page--current' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={disabled}
              onClick={() => goTo(item)}
              type="button"
            >
              <span className="vm-type-caption-caption">{item}</span>
            </button>
          </li>
        );
      })
    );

  return (
    <nav
      aria-label="分页"
      className={rootClass}
      data-disabled={disabled || undefined}
      data-size={size}
      data-type={type}
      ref={ref}
      {...rest}
    >
      <ul className="vm-pagination__list">
        {arrow('left')}
        {middle}
        {arrow('right')}
      </ul>
    </nav>
  );
});
