import {
  forwardRef,
  useId,
  useImperativeHandle,
  useRef,
  type DialogHTMLAttributes,
  type ReactNode,
} from 'react';
import './Drawer.css';

/** 宽度档位，对应 Figma 变体属性 `Size`：sm 320 / md 420 / lg 560 px（Figma 里都是 FIXED 宽）。 */
export type DrawerSize = 'sm' | 'md' | 'lg';

/** 贴边方向，对应 Figma 变体属性 `Side`。只有**靠外的一侧**保留 16px 圆角（`--vm-radius-xl`）。 */
export type DrawerSide = 'right' | 'left';

export interface DrawerProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, 'title'> {
  /**
   * 对应 Figma 变体属性 `Size`，只改宽度：`sm` 320px、`md` 420px、`lg` 560px。
   * 三档的内边距（`--vm-padding-modal-y` / `--vm-padding-modal-x`）与间距完全相同。
   * @default 'sm'
   */
  size?: DrawerSize;
  /**
   * 对应 Figma 变体属性 `Side`，决定贴哪一边以及圆角朝哪一边：
   * `right` = 贴右、左侧 16px 圆角（`16/0/0/16`）；`left` = 贴左、右侧 16px 圆角（`0/16/16/0`）。
   * @default 'right'
   */
  side?: DrawerSide;
  /**
   * 标题槽位，对应 Figma 的「抽屉标题」文字层（`Heading/L` → `.vm-type-heading-l`，色 `--vm-text-primary`）。
   * 渲染成 `<h2>` 并通过 `aria-labelledby` 挂到 `<dialog>` 上；需要别的标题层级请用 `aria-labelledby` 自行关联。
   */
  title?: ReactNode;
  /**
   * 右上角 × 的可访问名。Figma 的 `Filled icon` / `cross_filled` 图标没有文案层，
   * 但图标按钮必须有名字，所以补这个 prop。
   * @default '关闭'
   */
  closeLabel?: string;
}

/**
 * 侧滑抽屉。事实来源：Figma 组件集 `Drawer`（node `56063:6563`），6 个变体 = `Size` × `Side`。
 *
 * - 组件集**没有 `State` 轴**：hover / pressed / focus 都不存在于 Figma，面板与文字一律不加交互态；
 * - `open` 是**原生** `<dialog>` 的 `open` 属性（这里刻意不调 `showModal()`）：Figma 的 Drawer 变量表里
 *   没有 `Scrim/scrim-modal`，所以它是非模态侧栏——没有 `::backdrop`、没有焦点陷阱；
 * - 收起统一走 `dialog.close()` → 原生 `close` 事件 → 消费方的 `onClose`，组件不自己保存可见状态；
 * - 面板底色 `--vm-bg-panel`、描边 `--vm-border-default`、单侧圆角 `--vm-radius-xl`、海拔 `--vm-elevation-4`。
 */
export const Drawer = forwardRef<HTMLDialogElement, DrawerProps>(function Drawer(props, ref) {
  const { size = 'sm', side = 'right', title, closeLabel = '关闭', className, children, ...rest } = props;

  const dialogRef = useRef<HTMLDialogElement>(null);
  useImperativeHandle(ref, () => dialogRef.current as HTMLDialogElement, []);

  const autoId = useId();
  const titleId = `${autoId}-title`;

  const closeDrawer = () => dialogRef.current?.close();

  const rootClass = ['vm-drawer', `vm-drawer--${size}`, `vm-drawer--${side}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <dialog
      {...rest}
      ref={dialogRef}
      className={rootClass}
      aria-labelledby={(rest['aria-labelledby'] as string | undefined) ?? (title ? titleId : undefined)}
    >
      <div className="vm-drawer__header">
        {title !== undefined && title !== null ? (
          <h2 className="vm-drawer__title vm-type-heading-l" id={titleId}>
            {title}
          </h2>
        ) : null}
        <button
          type="button"
          className="vm-drawer__close"
          onClick={closeDrawer}
          aria-label={closeLabel}
        >
          {/* Figma: Filled icon / Property 1=cross_filled（图标 20×20，内部矢量 13.11×13.11，填充 #FFFFFF 未绑变量 = White/White-0） */}
          <svg
            width="13.11"
            height="13.11"
            viewBox="0 0 31.4627 31.4558"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M30.5772 0.87868C31.7487 2.05025 31.7487 3.94975 30.5772 5.12132L19.974 15.7245L30.5841 26.3345C31.7556 27.5061 31.7556 29.4056 30.5841 30.5772C29.4125 31.7487 27.513 31.7487 26.3414 30.5772L15.7314 19.9671L5.12132 30.5772C3.94975 31.7487 2.05025 31.7487 0.878679 30.5772C-0.292894 29.4056 -0.292892 27.5061 0.878679 26.3345L11.4887 15.7245L0.885585 5.12132C-0.285958 3.94978 -0.285901 2.05026 0.885585 0.87868C2.05716 -0.292893 3.95665 -0.292892 5.12823 0.87868L15.7314 11.4818L26.3345 0.87868C27.5061 -0.292893 29.4056 -0.292893 30.5772 0.87868Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      {children !== undefined && children !== null ? (
        <div className="vm-drawer__body vm-type-heading-body-m-regular">{children}</div>
      ) : null}
    </dialog>
  );
});
