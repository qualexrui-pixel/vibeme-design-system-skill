import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import './Dropdown.css';

/**
 * 下拉菜单 props。事实来源：Figma 组件集 `Dropdown`（node `56064:6813`），
 * 2 个变体 = `State`（`closed` / `open`）。
 *
 * `open` 对应 Figma 的 `State=open`，是**应用态**所以做成 prop：不传时组件自己管理开合
 * （点触发器切换、`Esc` / 点面板外 / 选中一项后关闭），传了就是受控，必须同时用
 * `onOpenChange` 接收变化。面板内容走 `children`（放 `MenuItem`），触发器文字走 `label`。
 */
export interface DropdownProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'children'> {
  /**
   * 触发器上的文字，对应 Figma 触发器 Frame 里的 TEXT 层「菜单」
   * （文字样式 `Heading/S`，Poppins SemiBold 14/20 → `.vm-type-heading-s`）。
   * 可选：缺省时标签位留空，触发器（40px 高、`aria-haspopup` ＋ chevron）照常渲染，**不会消失**。
   * 注意 `children` 是**面板内容**（`MenuItem`），不是标签来源，所以不拿它兜底；
   * 只放图标的场景请自行传 `aria-label` 给触发器补可访问名。
   * @default ''
   */
  label?: ReactNode;
  /**
   * 受控开合状态，映射 Figma 变体 `State`（`open` = 展开面板，`closed` = 只有触发器）。
   * 不传则由组件内部维护（非受控）。默认 `undefined`。
   */
  open?: boolean;
  /**
   * 非受控模式下的初始开合状态（对应 Figma 默认变体 `State=closed`）。默认 `false`。
   */
  defaultOpen?: boolean;
  /** 开合状态变化回调；受控模式下必须在这里回写 `open`。 */
  onOpenChange?: (open: boolean) => void;
  /**
   * 面板内容，对应 Figma `State=open` 变体里那个 180×130 的面板
   * （`Background/bg-panel` ＋ `Elevation/3` ＋ 8px 内边距）里的三个 `MenuItem` 实例。
   */
  children?: ReactNode;
}

const ITEM_SELECTOR = '[role="menuitem"]:not([disabled])';

/**
 * 下拉菜单：`触发器（文字 + chevron-down_filled）` ＋ 展开时贴在下方 8px 的菜单面板。
 *
 * - 触发器是真的 `<button type="button">`，`...rest`（`disabled` / `onClick` / `aria-*` …）
 *   与 `ref` 都落在它身上；`className` 落在最外层容器上。
 * - 面板是 `<ul role="menu">`，直接放 `MenuItem`（它自带 `<li role="none">` ＋ `role="menuitem">`）。
 * - `State` 是开合这种应用态，所以是 `open` prop；hover / focus 是伪类。
 */
export const Dropdown = forwardRef<HTMLButtonElement, DropdownProps>(function Dropdown(
  {
    label = '',
    open,
    defaultOpen = false,
    onOpenChange,
    children,
    className,
    disabled,
    onClick,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const expanded = isControlled ? open : uncontrolledOpen;

  const reactId = useId();
  const triggerId = `${reactId}-trigger`;
  const panelId = `${reactId}-panel`;

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  /** 打开后要把焦点放到哪一项（键盘 ArrowDown / ArrowUp 打开时才不是 null）。 */
  const pendingFocus = useRef<'first' | 'last' | null>(null);

  const setTriggerRef = useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as MutableRefObject<HTMLButtonElement | null>).current = node;
    },
    [ref],
  );

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const closeAndRestoreFocus = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, [setOpen]);

  /** 焦点在面板内按方向键移动；roving focus 由容器负责，MenuItem 自己不抢焦点。 */
  const focusItemAt = useCallback((index: number) => {
    const items = panelRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR);
    if (!items || items.length === 0) return;
    const next = ((index % items.length) + items.length) % items.length;
    items[next].focus();
  }, []);

  // 打开后把焦点交给第一项/最后一项（只有键盘打开才会排队）
  useEffect(() => {
    if (!expanded) return;
    const where = pendingFocus.current;
    pendingFocus.current = null;
    if (where) focusItemAt(where === 'first' ? 0 : -1);
  }, [expanded, focusItemAt]);

  // 点面板外部关闭（不抢焦点）
  useEffect(() => {
    if (!expanded) return undefined;
    const onPointerDown = (event: MouseEvent) => {
      const root = rootRef.current;
      if (root && event.target instanceof Node && !root.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [expanded, setOpen]);

  const handleTriggerClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) return;
    setOpen(!expanded);
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!expanded) {
        pendingFocus.current = event.key === 'ArrowDown' ? 'first' : 'last';
        setOpen(true);
      } else {
        focusItemAt(event.key === 'ArrowDown' ? 0 : -1);
      }
    }
  };

  const handlePanelKeyDown = (event: ReactKeyboardEvent<HTMLUListElement>) => {
    const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? []);
    const current = items.indexOf(document.activeElement as HTMLElement);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusItemAt(current + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusItemAt(current - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusItemAt(0);
        break;
      case 'End':
        event.preventDefault();
        focusItemAt(-1);
        break;
      default:
        break;
    }
  };

  const handlePanelClick = (event: ReactMouseEvent<HTMLUListElement>) => {
    const target = event.target as HTMLElement | null;
    // 选中一项后关闭菜单（菜单是「选一个就收起」的语义），并把焦点还给触发器
    if (target?.closest('[role="menuitem"]')) closeAndRestoreFocus();
  };

  const rootClass = ['vm-dropdown', expanded ? 'vm-dropdown--open' : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={rootClass}
      ref={rootRef}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && expanded) {
          event.stopPropagation();
          closeAndRestoreFocus();
        }
      }}
    >
      <button
        {...rest}
        ref={setTriggerRef}
        id={triggerId}
        type="button"
        className="vm-dropdown__trigger"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={expanded}
        aria-controls={expanded ? panelId : undefined}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
      >
        {/* Figma: TEXT「菜单」—— Heading/S（Poppins SemiBold 14/20）；label 缺省时这里是空字符串，
            触发器本身（高 40px 的 <button> ＋ chevron）照常渲染。 */}
        <span className="vm-dropdown__label vm-type-heading-s">{label}</span>
        <span className="vm-dropdown__chevron" aria-hidden="true">
          {/* Figma: chevron-down_filled（Filled icon 实例 16×16，矢量 7.52×12.12，Text/Text-Secondary）。
              此处用同一族的 chevron 矢量旋转 90° 示意，建议从 Figma 取原始矢量。 */}
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path
              d="M4.24 1.94 L11.76 8 L4.24 14.06 L4.24 10.4 L8 8 L4.24 5.6 Z"
              fill="currentColor"
              transform="rotate(90 8 8)"
            />
          </svg>
        </span>
      </button>

      {expanded ? (
        <ul
          className="vm-dropdown__panel"
          id={panelId}
          role="menu"
          aria-labelledby={triggerId}
          ref={panelRef}
          onKeyDown={handlePanelKeyDown}
          onClick={handlePanelClick}
        >
          {children}
        </ul>
      ) : null}
    </div>
  );
});
