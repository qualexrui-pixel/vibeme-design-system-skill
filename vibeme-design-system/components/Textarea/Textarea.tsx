import {
  forwardRef,
  useId,
  useImperativeHandle,
  useRef,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import './Textarea.css';

/** 尺寸档位，对应 Figma 变体属性 `Size`（md 320×88 / lg 320×120，px）。 */
export type TextareaSize = 'md' | 'lg';

/**
 * 原生 `<textarea>` 属性；只剔除原生数值型 `size`（那是「可见字符列数」），
 * 本组件的 `size` 是 Figma 的高度档位枚举。
 */
type NativeTextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>;

export interface TextareaProps extends NativeTextareaProps {
  /**
   * 尺寸档位，映射 Figma 变体属性 `Size`（`md` / `lg`）。
   * 只改起始高度（88 / 120），内边距 12/16 与圆角 12 两档一致。默认 `md`。
   * @default 'md'
   */
  size?: TextareaSize;
  /**
   * 错误态，映射 Figma 变体 `State=error`（描边换成 `--vm-status-error`、线宽 `--vm-border-width-thick`）。
   * 同时落到原生 `aria-invalid`。默认 `false`。
   * @default false
   */
  error?: boolean;
  /**
   * 错误说明文本。Figma 的 Textarea 里**没有**错误文案节点（`Size=lg, State=error` 的树里只有占位文本），
   * 这里补的是可访问性要求：出错不能只靠红框，必须有一段文字，并自动用 `aria-describedby` 关联到控件。
   */
  errorMessage?: ReactNode;
}

/**
 * 多行文本域。事实来源：Figma 组件集 `Textarea`（node `56059:6287`），
 * 10 个变体 = `Size`（md / lg）× `State`（default / hover / focus / error / disabled）。
 *
 * - 交互态 `State=hover` / `State=focus` **不做成 prop**，分别由 CSS `:hover` 与 `:focus-visible` 触发；
 * - 应用态 `State=error` / `State=disabled` 才是 prop（`error` 与原生 `disabled`）；
 * - TEXT 属性 `placeholder` 走原生 `placeholder` 透传，组件不接受 `children` 文案。
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(props, ref) {
    const {
      size = 'md',
      error = false,
      errorMessage,
      className,
      id,
      'aria-describedby': ariaDescribedBy,
      ...rest
    } = props;

    const autoId = useId();
    const fieldId = id ?? `${autoId}-field`;
    const messageId = `${fieldId}-error`;

    const innerRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement, []);

    const rootClass = [
      'vm-textarea',
      `vm-textarea--${size}`,
      error ? 'vm-textarea--error' : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    const describedBy =
      [ariaDescribedBy, error && errorMessage ? messageId : undefined]
        .filter(Boolean)
        .join(' ') || undefined;

    return (
      <div className={rootClass} data-size={size} data-error={error || undefined}>
        <textarea
          {...rest}
          id={fieldId}
          ref={innerRef}
          className="vm-textarea__field"
          aria-invalid={error || undefined}
          aria-describedby={describedBy}
        />
        {error && errorMessage ? (
          <p className="vm-textarea__error vm-type-heading-body-s-regular" id={messageId} role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>
    );
  },
);
