import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import './Select.css';

/** 尺寸档位，对应 Figma 变体属性 `Size`（sm 32 / md 40 / lg 48，px）。 */
export type SelectSize = 'sm' | 'md' | 'lg';

/** 轻量类名拼接（不引第三方库）。 */
function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Figma 的文字样式档位：sm = `Heading/Body/S/Regular`（14 Regular/20），
 * md 与 lg = `Heading/Body/M/Regular`（16 Regular/24）。
 */
const SIZE_TYPE_CLASS: Record<SelectSize, string> = {
  sm: 'vm-type-heading-body-s-regular',
  md: 'vm-type-heading-body-m-regular',
  lg: 'vm-type-heading-body-m-regular',
};

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /**
   * 尺寸档位，对应 Figma 变体属性 `Size`。
   * 只改高度（32 / 40 / 48）与文字样式，横向内边距 `--vm-padding-input-x` 三档一致。默认 `'sm'`。
   * @default 'sm'
   */
  size?: SelectSize;
  /**
   * 展开态，对应 Figma 变体 `State=open`（描边换成 `--vm-border-selected` + 2px）。
   * 原生 `<select>` 的弹层由浏览器绘制、无法被脚本观测，所以这里是**受调用方控制**的视觉状态：
   * 自绘下拉（与 `Dropdown` 组合）时用它表达「面板已展开」，用原生弹层时可以不管。
   * @default false
   */
  open?: boolean;
  /**
   * 错误态，对应 Figma 变体 `State=error`（描边换成 `--vm-status-error` + 2px）。
   * 会同步落到原生 `aria-invalid`。默认 `false`。
   * @default false
   */
  error?: boolean;
  /**
   * 错误说明文本。Figma 的 Select 组件里没有错误文案——这里补的是可访问性要求：
   * 出错时不能只靠红框，必须有一段文字，并自动通过 `aria-describedby` 关联到控件。
   */
  errorMessage?: ReactNode;
  /**
   * `<option>` / `<optgroup>` 列表。
   * Figma 的 TEXT 属性 `value`（示例文案 `Option`）对应原生 `<select>` 里**被选中那一项的 label**，
   * 所以这里传的是选项集合，而不是一段展示文本。
   */
  children?: ReactNode;
}

/**
 * 下拉选择器（收起态）。事实来源：Figma 组件集 `Select`（node `56059:6318`），
 * 15 个变体 = `Size` × `State`。
 *
 * - 交互态 `State=hover` **不做成 prop**，由 CSS `:hover` 触发，视觉是**描边换 token**
 *   （`--vm-border-default` → `--vm-white-4`），不是填充叠加；
 * - 应用态 `State=open` / `State=error` / `State=disabled` 才是 prop（后两者分别落到
 *   `open`、`error` 与原生 `disabled`）。
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(props, ref) {
  const { size = 'sm', open = false, error = false, errorMessage, className, children, ...rest } = props;

  const autoId = useId();
  const fieldId = (rest.id as string | undefined) ?? `${autoId}-field`;
  const messageId = `${fieldId}-error`;

  const rootClass = cx(
    'vm-select',
    `vm-select--${size}`,
    open && 'vm-select--open',
    error && 'vm-select--error',
    className,
  );

  const describedBy =
    [rest['aria-describedby'] as string | undefined, error && errorMessage ? messageId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div className={rootClass} data-size={size} data-open={open || undefined} data-error={error || undefined}>
      <select
        {...rest}
        ref={ref}
        id={fieldId}
        className={cx('vm-select__field', SIZE_TYPE_CLASS[size])}
        aria-invalid={error || undefined}
        aria-describedby={describedBy}
      >
        {children}
      </select>

      {/* Figma: Filled icon / Property 1=chevron-down_filled（16×16 容器，矢量 7.52×12.12，
          实例内旋转 90° 指向下方）。填充无色值变量绑定，Figma 里就是纯白，故用 --vm-white-0 */}
      <svg
        className="vm-select__icon"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <g transform="translate(4.24 1.94) rotate(90 3.760055 6.0601)">
          <path
            d="M6.71333 4.88065C7.15978 5.2899 7.383 5.49452 7.46565 5.7346C7.53826 5.94553 7.53826 6.17468 7.46565 6.3856C7.383 6.62568 7.15978 6.8303 6.71333 7.23955L2.68116 10.9357C1.8332 11.713 1.40922 12.1017 1.04811 12.119C0.734485 12.1341 0.43198 12.0011 0.231193 11.7597C-1.39078e-07 11.4817 -9.95988e-08 10.9066 1.30924e-10 9.75626L6.41027e-07 2.36394C7.40757e-07 1.21363 7.7486e-07 0.63847 0.231194 0.360521C0.431981 0.119128 0.734486 -0.0139443 1.04811 0.00116008C1.40922 0.0185519 1.8332 0.407201 2.68116 1.1845L6.71333 4.88065Z"
            fill="currentColor"
          />
        </g>
      </svg>

      {error && errorMessage ? (
        <p className="vm-select__error vm-type-heading-body-s-regular" id={messageId} role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
});
