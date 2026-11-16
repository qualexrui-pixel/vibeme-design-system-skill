import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import './Button.css';

/** 视觉类型，对应 Figma 变体属性 `Type`（primary / secondary / ghost / danger）。 */
export type ButtonType = 'primary' | 'secondary' | 'ghost' | 'danger';
/** 尺寸档位，对应 Figma 变体属性 `Size`（sm 32 / md 40 / lg 48，px）。 */
export type ButtonSize = 'sm' | 'md' | 'lg';
/**
 * 原生 `<button type>`（submit / button / reset）。
 * Figma 的 `Type` 属性已被本组件的 `type` prop 占用，故原生的这个属性改名 `htmlType`。
 */
export type ButtonHtmlType = 'submit' | 'button' | 'reset';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /**
   * 视觉类型，对应 Figma 变体属性 `Type`。
   * 四个取值都来自 Figma：`primary` 品牌砂色实底、`secondary` 卡片底 + 1px 描边、
   * `ghost` 无底无描边、`danger` 错误色实底。
   * @default 'primary'
   */
  type?: ButtonType;
  /**
   * 尺寸档位，对应 Figma 变体属性 `Size`。
   * 只改高度（32 / 40 / 48）与横向内边距（12 / 16 / 20），圆角 `--vm-radius-button` 三档一致。
   * @default 'sm'
   */
  size?: ButtonSize;
  /**
   * 原生按钮行为，透传 HTML `type` 属性。
   * 默认 `'button'`：放在 `<form>` 里时不会意外提交表单（原生默认值是 `submit`）。
   * @default 'button'
   */
  htmlType?: ButtonHtmlType;
  /**
   * 按钮文案，对应 Figma 的 TEXT 属性 `label`（Figma 示例文案是 `Button`）。
   * 传 `children` 而非 `label`，是为了能放图标 + 文字的任意组合。
   */
  children?: ReactNode;
}

/** 轻量类名拼接（不引第三方库）。 */
function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Figma 的 `Heading/S`（14 SemiBold/20）覆盖 sm 与 md 两档，`Heading/M`（16 SemiBold/24）只给 lg。
 * 这一档位差异来自 Figma 实测：`Size=md` 的 label 仍是 14/20 SemiBold。
 */
const SIZE_TYPE_CLASS: Record<ButtonSize, string> = {
  sm: 'vm-type-heading-s',
  md: 'vm-type-heading-s',
  lg: 'vm-type-heading-m',
};

/**
 * 按钮。事实来源：Figma 组件集 `Button`（node `56058:5617`），48 个变体 = `Type` × `Size` × `State`。
 *
 * - 交互态 `State=hover` / `State=pressed` **不做成 prop**，分别由 CSS `:hover` / `:active` 触发，
 *   视觉上是「底色 + `--vm-white-7` / `--vm-white-6` 半透明叠加」，底色变量本身不变；
 * - 应用态 `State=disabled` 才是 prop，并直接映射原生 `disabled` 属性（`opacity: 0.38`）。
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const { type = 'primary', size = 'sm', htmlType = 'button', className, children, ...rest } = props;

  const rootClass = cx(
    'vm-button',
    `vm-button--${type}`,
    `vm-button--${size}`,
    SIZE_TYPE_CLASS[size],
    className,
  );

  return (
    <button
      {...rest}
      ref={ref}
      type={htmlType}
      className={rootClass}
      data-type={type}
      data-size={size}
    >
      {children}
    </button>
  );
});
