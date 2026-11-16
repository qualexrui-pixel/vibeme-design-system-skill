import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type DialogHTMLAttributes,
  type ReactNode,
} from 'react';
import './Modal.css';

/** 尺寸档位，对应 Figma 变体属性 `Size`。宽度绑 `Modal Size/modal-sm|md|lg`（400 / 520 / 720 px）。 */
export type ModalSize = 'sm' | 'md' | 'lg';

/** 底部主按钮层级，对应 Figma 变体属性 `Type`。
 * `basic` 是 `Type=primary` 实例，`confirm` 把主按钮换成 `Type=danger` 实例。 */
export type ModalType = 'basic' | 'confirm';

export interface ModalProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, 'title'> {
  /**
   * 对应 Figma 属性 `Size`（`sm` / `md` / `lg`），只改宽度，内边距三档一致。
   * @default 'sm'
   */
  size?: ModalSize;
  /**
   * 对应 Figma 属性 `Type`（`basic` / `confirm`）。`confirm` 时底部主按钮换成
   * `状态色/Error`（`--vm-status-error`）底色的危险按钮。
   * @default 'basic'
   */
  type?: ModalType;
  /**
   * 标题槽位，对应 Figma 的「弹窗标题」文字层（`Heading/L`，`Text/Text-Primary`）。
   * 渲染成 `<h2>` 并通过 `aria-labelledby` 挂到 `<dialog>` 上。
   */
  title?: ReactNode;
  /**
   * 正文内容，对应 Figma 的正文文字层（`Heading/Body/M/Regular`，`Text/Text-Secondary`）。
   * 渲染的容器通过 `aria-describedby` 挂到 `<dialog>` 上。
   */
  children?: ReactNode;
  /**
   * 底部主按钮文案。Figma 示例里 `Type=basic` 是「确认」、`Type=confirm` 是「删除」，
   * 这里按 `type` 给出同样的默认值。
   */
  confirmLabel?: string;
  /**
   * 底部次按钮文案（Figma 示例「取消」）。
   * @default '取消'
   */
  cancelLabel?: string;
  /**
   * 右上角关闭图标的可访问名。Figma 的 `cross_filled` 图标没有文案层，
   * 但图标按钮必须有名字，所以补这个 prop。
   * @default '关闭'
   */
  closeLabel?: string;
  /** 点击底部主按钮后触发（随后弹窗会关闭）。 */
  onConfirm?: () => void;
}

/**
 * 弹窗。事实来源：Figma 组件集 `Modal`（node `56063:6526`），6 个变体 = `Size` × `Type`。
 *
 * - Figma 没有 `State` 轴：hover / pressed 只存在于底部内嵌的 Button 实例上（填充叠加 `--vm-white-7` / `--vm-white-6`），
 *   弹窗本体不做悬停变化，所以这里**没有** `state` 这类 prop；
 * - `open` 是原生 `<dialog>` 的受控开关：组件内部走 `showModal()` / `close()`，
 *   让它进入 top layer 并拿到 `::backdrop`（`Scrim/scrim-modal` → `--vm-scrim-modal`）；
 * - 关闭（`Esc`、右上角 ×、次按钮）统一走 `dialog.close()` → 原生 `close` 事件 → 消费方的 `onClose`。
 */
export const Modal = forwardRef<HTMLDialogElement, ModalProps>(function Modal(props, ref) {
  const {
    size = 'sm',
    type = 'basic',
    title,
    children,
    confirmLabel,
    cancelLabel = '取消',
    closeLabel = '关闭',
    onConfirm,
    className,
    onClose,
    open,
    ...rest
  } = props;

  const dialogRef = useRef<HTMLDialogElement>(null);
  useImperativeHandle(ref, () => dialogRef.current as HTMLDialogElement, []);

  const autoId = useId();
  const titleId = `${autoId}-title`;
  const bodyId = `${autoId}-body`;

  // open 不是普通属性：直接透传 open 属性只会得到「非模态」的 dialog，
  // 既没有 top layer 也没有 ::backdrop，所以这里只通过 showModal()/close() 控制。
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [open]);

  const closeDialog = () => dialogRef.current?.close();

  const rootClass = ['vm-modal', `vm-modal--${size}`, className].filter(Boolean).join(' ');
  const confirmVariant = type === 'confirm' ? 'danger' : 'primary';
  const confirmText = confirmLabel ?? (type === 'confirm' ? '删除' : '确认');

  return (
    <dialog
      {...rest}
      ref={dialogRef}
      className={rootClass}
      aria-labelledby={(rest['aria-labelledby'] as string | undefined) ?? (title ? titleId : undefined)}
      aria-describedby={(rest['aria-describedby'] as string | undefined) ?? (children ? bodyId : undefined)}
      onClose={onClose}
    >
      <div className="vm-modal__header">
        {title ? (
          <h2 className="vm-modal__title vm-type-heading-l" id={titleId}>
            {title}
          </h2>
        ) : null}
        <button
          type="button"
          className="vm-modal__close"
          onClick={closeDialog}
          aria-label={closeLabel}
        >
          {/* Figma: Filled icon / Property 1=cross_filled（20×20，内部矢量 13.11×13.11；示意画法） */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M3.44 3.44 16.56 16.56M16.56 3.44 3.44 16.56"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {children ? (
        <div className="vm-modal__body vm-type-heading-body-m-regular" id={bodyId}>
          {children}
        </div>
      ) : null}

      <div className="vm-modal__footer">
        <button
          type="button"
          className="vm-modal__action vm-modal__action--secondary vm-type-heading-s"
          onClick={closeDialog}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className={`vm-modal__action vm-modal__action--${confirmVariant} vm-type-heading-s`}
          onClick={() => {
            onConfirm?.();
            closeDialog();
          }}
        >
          {confirmText}
        </button>
      </div>
    </dialog>
  );
});
