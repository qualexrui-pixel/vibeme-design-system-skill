import { forwardRef, type InputHTMLAttributes } from 'react';
import './Search.css';

/** 尺寸档位，对应 Figma 变体属性 `Size`（sm 32 / md 40 / lg 48，px）。 */
export type SearchSize = 'sm' | 'md' | 'lg';

/** 轻量类名拼接（不引第三方库）。 */
function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Figma 的文字样式档位：sm = `Heading/Body/S/Regular`（14 Regular/20），
 * md 与 lg = `Heading/Body/M/Regular`（16 Regular/24）。
 */
const SIZE_TYPE_CLASS: Record<SearchSize, string> = {
  sm: 'vm-type-heading-body-s-regular',
  md: 'vm-type-heading-body-m-regular',
  lg: 'vm-type-heading-body-m-regular',
};

export interface SearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * 尺寸档位，对应 Figma 变体属性 `Size`。
   * 只改高度（32 / 40 / 48）与文字样式，横向内边距 `--vm-padding-input-x` 与图标尺寸三档一致。
   * @default 'sm'
   */
  size?: SearchSize;
  /**
   * 输入提示文案，对应 Figma 的 TEXT 属性 `placeholder`（Figma 默认文案是 `Search`）。
   * 颜色取 Figma 绑定的 `Text/Text-Secondary`（`--vm-text-secondary`）。
   * @default 'Search'
   */
  placeholder?: string;
}

/**
 * 搜索框。事实来源：Figma 组件集 `Search`（node `56059:6373`），12 个变体 = `Size` × `State`。
 *
 * - 交互态 `State=hover` / `State=focus` **不做成 prop**：hover 由 CSS `:hover` 触发（描边换
 *   `--vm-white-4`），focus 由 `:focus-visible` 触发（`--vm-border-selected` + 2px）；
 * - 应用态只有 `State=disabled`，直接落到原生 `disabled` 属性（`opacity: 0.38`）。
 */
export const Search = forwardRef<HTMLInputElement, SearchProps>(function Search(props, ref) {
  const { size = 'sm', placeholder = 'Search', type = 'search', className, ...rest } = props;

  return (
    <div className={cx('vm-search', `vm-search--${size}`, className)} data-size={size}>
      {/* Figma: Line icon / Property 1=icon, Property 2=search-line
          （16×16 容器，矢量 12.1666×12.1666，填充无变量绑定、Figma 里就是纯白，故用 --vm-white-0） */}
      <svg
        className="vm-search__icon"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <g transform="translate(1.9167 1.9167)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5.5 0C8.53757 0 11 2.46243 11 5.5C11 6.83875 10.5213 8.06546 9.72624 9.01921L12.0202 11.3132C12.2154 11.5084 12.2154 11.8249 12.0202 12.0202C11.8249 12.2154 11.5084 12.2154 11.3132 12.0202L9.01921 9.72624C8.06546 10.5213 6.83875 11 5.5 11C2.46243 11 0 8.53757 0 5.5C0 2.46243 2.46243 0 5.5 0ZM5.5 1C3.01472 1 1 3.01472 1 5.5C1 7.98528 3.01472 10 5.5 10C7.98528 10 10 7.98528 10 5.5C10 3.01472 7.98528 1 5.5 1Z"
            fill="currentColor"
          />
        </g>
      </svg>

      <input
        {...rest}
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={cx('vm-search__field', SIZE_TYPE_CLASS[size])}
      />
    </div>
  );
});
