import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import './Upload.css';

/**
 * 上传区（虚线拖放框）。事实来源：Figma 组件集 `Upload`（node `56059:6543`），
 * 5 个变体 = `State`（`default` / `hover` / `dragover` / `error` / `disabled`）单轴，默认 `State=default`。
 *
 * - 交互态 `State=hover` **不做成 prop**，由 CSS `:hover` 触发；
 * - 应用态 `State=dragover` / `State=error` / `State=disabled` 才是 prop（`dragging` / `error` / 原生 `disabled`）。
 *
 * 其余属性（`accept`、`multiple`、`onChange`、`onDrop`、`aria-*` …）一律透传给内部真实的
 * `<input type="file">`，`className` 合并到最外层 `.vm-upload`。
 */
export interface UploadProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'children'> {
  /**
   * 拖拽悬停态，映射 Figma 变体 `State=dragover`：描边换 `--vm-brand`（`Brand/Brand`），
   * 文案换 `--vm-text-action`。线宽仍是 1px（`--vm-border-width-thin`）。默认 `false`。
   */
  dragging?: boolean;
  /**
   * 错误态，映射 Figma 变体 `State=error`：描边与文案都换 `--vm-status-error`（`状态色/Error`）。
   * 注意 Upload 的 error **不加粗到 2px**（与 Input 不同）。会同步落到原生 `aria-invalid`。默认 `false`。
   */
  error?: boolean;
  /**
   * 错误说明文本。Figma 的 Upload 组件里没有错误文案——这里补的是可访问性要求：
   * 出错时不能只靠红色虚线框，必须有一段文字，并自动通过 `aria-describedby` 关联到控件。
   */
  errorMessage?: ReactNode;
  /**
   * 文案插槽，对应 Figma 的 TEXT 属性（原文案「点击或拖拽文件到此处上传」）。
   * 不传时回落到 Figma 原文案。
   */
  children?: ReactNode;
}

/**
 * 上传区。根节点是布局用的 `div`，真正可交互的控件是内部铺满整框、`opacity: 0` 的
 * `<input type="file">`，因此点击、Tab 聚焦、Enter/Space 唤起系统选择器都走浏览器原生行为。
 */
export const Upload = forwardRef<HTMLInputElement, UploadProps>(function Upload(
  { dragging = false, error = false, errorMessage, className, children, id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-error`;

  const describedBy =
    [rest['aria-describedby'], error && errorMessage ? messageId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

  const rootClass = [
    'vm-upload',
    dragging ? 'vm-upload--dragover' : '',
    error ? 'vm-upload--error' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} data-dragging={dragging || undefined} data-error={error || undefined}>
      <div className="vm-upload__box">
        <input
          {...rest}
          ref={ref}
          id={inputId}
          type="file"
          className="vm-upload__input"
          aria-invalid={error || undefined}
          aria-describedby={describedBy}
        />
        {/* Figma: Line icon / import-line（实例 24×24，内部矢量 18.5×18.5 居中） */}
        <svg
          className="vm-upload__icon"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <g transform="translate(2.75 2.75)" fill="currentColor">
            <path d="M9.25 0C9.66421 0 10 0.335786 10 0.75C10 1.16421 9.66421 1.5 9.25 1.5H4.75C2.95507 1.5 1.5 2.95507 1.5 4.75V13.75C1.5 15.5449 2.95507 17 4.75 17H13.75C15.5449 17 17 15.5449 17 13.75V9.25C17 8.83579 17.3358 8.5 17.75 8.5C18.1642 8.5 18.5 8.83579 18.5 9.25V13.75C18.5 16.3734 16.3734 18.5 13.75 18.5H4.75C2.12665 18.5 0 16.3734 0 13.75V4.75C0 2.12665 2.12665 0 4.75 0H9.25Z" />
            <path d="M15.9521 1.45215C16.2548 1.14949 16.7452 1.14949 17.0479 1.45215C17.3505 1.7548 17.3505 2.2452 17.0479 2.54785L9.5957 10H11.75C12.1642 10 12.5 10.3358 12.5 10.75C12.5 11.1642 12.1642 11.5 11.75 11.5H8.25C7.55964 11.5 7 10.9404 7 10.25V6.75C7 6.33579 7.33579 6 7.75 6C8.16421 6 8.5 6.33579 8.5 6.75V8.9043L15.9521 1.45215Z" />
          </g>
        </svg>
        <span className="vm-upload__label vm-type-heading-body-s-regular">
          {children ?? '点击或拖拽文件到此处上传'}
        </span>
      </div>
      {error && errorMessage ? (
        <p className="vm-upload__error vm-type-heading-body-s-regular" id={messageId} role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
});
