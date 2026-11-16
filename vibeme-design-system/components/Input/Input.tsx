import {
  forwardRef,
  useId,
  useImperativeHandle,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
} from 'react';
import './Input.css';

/** 尺寸档位，对应 Figma 变体属性 `Size`（sm 32 / md 40 / lg 48，px）。 */
export type InputSize = 'sm' | 'md' | 'lg';

/** 单行输入用 input 的原生属性；`size` 是 Figma 的档位枚举，故剔除原生数值型 size。 */
type SingleLineProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;
/** 多行输入用 textarea 的原生属性；同样剔除原生 size。 */
type MultiLineProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>;

/** 单行与多行共用的 props（不含各自的原生属性），用于让 forwardRef 泛型保持稳定。 */
export interface InputBaseProps {
  /**
   * 尺寸档位，映射 Figma 属性 `Size`（`sm` / `md` / `lg`）。
   * 只改控件高度，内边距 `--vm-padding-input-x` 不变。默认 `sm`。
   */
  size?: InputSize;
  /**
   * 错误态，映射 Figma 变体 `State=error`（描边换成 `--vm-status-error`、线宽 2px）。
   * 会同步落到原生 `aria-invalid`。默认 `false`。
   */
  error?: boolean;
  /**
   * 错误说明文本。Figma 的 Input 组件里没有错误文案——这里补的是可访问性要求：
   * 出错时不能只靠红框，必须有一段文字，并自动通过 `aria-describedby` 关联到控件。
   */
  errorMessage?: ReactNode;
  /**
   * 渲染成 `<textarea>`（多行输入）。Figma 的 `Input` 组件集只有单行，
   * 多行对应的是独立的 `Textarea` 组件集；这里提供该开关只是为了统一调用姿势，
   * 真正的多行用法请优先用 `Textarea` 组件。
   * @default false
   */
  multiline?: boolean;
}

/** 单行输入框 props。 */
export interface InputProps extends InputBaseProps, SingleLineProps {
  multiline?: false;
}
/** 多行输入框 props（走 textarea 语义）。 */
export interface InputTextareaProps extends InputBaseProps, MultiLineProps {
  multiline: true;
}

type AnyInputProps = InputProps | InputTextareaProps;

interface RenderProps extends InputBaseProps {
  className?: string;
  multiline?: boolean;
  rest: Record<string, unknown>;
  mergedRef: Ref<HTMLInputElement | HTMLTextAreaElement>;
}

function InputRender(props: RenderProps) {
  const { size = 'sm', error = false, errorMessage, multiline, className, rest, mergedRef } = props;
  const autoId = useId();
  const inputId = (rest.id as string | undefined) ?? `${autoId}-field`;
  const messageId = `${inputId}-error`;

  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(mergedRef, () => (multiline ? textareaRef.current! : inputRef.current!), [multiline]);

  const rootClass = [
    'vm-input',
    `vm-input--${size}`,
    error ? 'vm-input--error' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const describedBy =
    [rest['aria-describedby'] as string | undefined, error && errorMessage ? messageId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

  const shared = {
    ...rest,
    id: inputId,
    className: 'vm-input__field',
    disabled: rest.disabled as boolean | undefined,
    'aria-invalid': error || undefined,
    'aria-describedby': describedBy,
  };

  return (
    <div className={rootClass} data-size={size} data-error={error || undefined}>
      {multiline ? (
        <textarea
          {...(shared as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          ref={textareaRef}
          rows={(rest.rows as number | undefined) ?? 3}
        />
      ) : (
        <input {...(shared as InputHTMLAttributes<HTMLInputElement>)} ref={inputRef} />
      )}
      {error && errorMessage ? (
        <p className="vm-input__error vm-type-heading-body-s-regular" id={messageId} role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

/**
 * 输入框。事实来源：Figma 组件集 `Input`（node `56058:5648`），15 个变体 = `Size` × `State`。
 *
 * - 交互态 `State=hover` / `State=focus` **不做成 prop**，分别由 CSS `:hover` 与 `:focus-visible` 触发；
 * - 应用态 `State=error` / `State=disabled` 才是 prop（`error`、原生 `disabled`）。
 */
export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, AnyInputProps>(
  function Input(props, ref) {
    const { size, error, errorMessage, multiline, className, ...rest } = props;
    return (
      <InputRender
        size={size}
        error={error}
        errorMessage={errorMessage}
        multiline={multiline}
        className={className}
        rest={rest as Record<string, unknown>}
        mergedRef={ref}
      />
    );
  },
);
