import {
  forwardRef,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from 'react';
import './Breadcrumb.css';

/**
 * 折叠档位，对应 Figma 变体属性 `Type`。
 * `3levels` = 不折叠，完整列出所有层级；`collapsed` = 首项 + `…` + 末项。
 */
export type BreadcrumbType = '3levels' | 'collapsed';

/** 面包屑的一层。内容插槽对应 Figma 里的 TEXT 节点（`首页` / `分类名称` / `当前页面`）。 */
export interface BreadcrumbItem {
  /** 该层显示的文字/内容，对应 Figma 的 TEXT 节点内容。 */
  label: ReactNode;
  /** 该层的目标地址。不传表示该层不可跳转（渲染成 `<span>`，不假装成链接）。 */
  href?: string;
  /** 覆写原生点击行为；透传到 `<a>`。 */
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  /** `<a>` 的其余原生属性（`target` / `rel` / `aria-*` 等）。 */
  linkProps?: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick' | 'children'>;
  /**
   * 是否标记为当前位置（`aria-current="page"` + `--vm-text-primary`）。
   * 默认取数组最后一项，与 Figma 的 `当前页面` 一致；只有“当前页不是最后一项”时才需要显式传。
   */
  current?: boolean;
}

/** 面包屑 props。Figma 组件集只有 `Type` 一个属性轴，其余都是内容插槽与 a11y 关联。 */
export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /**
   * 折叠档位，映射 Figma 变体属性 `Type`（`3levels` / `collapsed`）。
   * `3levels` 里的 3 只是 Figma 的示例内容，语义是「不折叠」，层级多于 3 时全部渲染。
   * @default '3levels'
   */
  type?: BreadcrumbType;
  /**
   * 层级内容插槽（对应 Figma 的 TEXT 节点）。Figma 的 3 层只是示例，层级数与内容都由这里决定。
   * 缺省等于空数组：此时只渲染承载 `ref` / `className` / 原生属性的 `<nav>` 骨架，
   * **不**输出空的 `<ol>`，也不会有分隔符（分隔符是逐项生成的，没有项就没有分隔符）。
   * @default []
   */
  items?: BreadcrumbItem[];
  /**
   * 折叠态下省略号的展开回调。Figma 里 `…` 只是一个 TEXT 节点，
   * 但被折叠的层级对键盘/读屏用户不可达，所以传了本回调才把省略号升级成 `<button>`。
   * @default undefined
   */
  onExpand?: () => void;
}

/** 分隔符与省略号：Figma 里 `/` 与 `…` 都是 Text/Text-Tertiary 的固定文案，不可点。 */
const SEPARATOR = '/';
const ELLIPSIS = '…';

/**
 * 面包屑。事实来源：Figma 组件集 `Breadcrumb`（node `56064:6664`），2 个变体 = `Type`。
 *
 * - Figma **没有** `State` 轴（没有 hover / focus / disabled 变体），所以既没有 `state` 也没有
 *   `disabled` prop；hover 只换前景（`--vm-text-secondary` → `--vm-text-primary`），由 `:hover` 触发；
 * - props 只有三个：`type`（Figma `Type`）、`items`（Figma 的 TEXT 节点内容插槽）、
 *   `onExpand`（折叠态 a11y 所需的受控关联）。
 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(props, ref) {
  const { type = '3levels', items = [], onExpand, className, ...rest } = props;

  const lastIndex = items.length - 1;
  const collapsed = type === 'collapsed' && items.length > 2;

  /** 折叠时只保留首项与末项，中间层级收进省略号。 */
  const crumbs = items
    .map((item, index) => ({ item, index }))
    .filter(({ index }) => !collapsed || index === 0 || index === lastIndex);

  const rootClass = ['vm-breadcrumb', className ?? ''].filter(Boolean).join(' ');

  const renderCrumb = (item: BreadcrumbItem, index: number) => {
    const isCurrent = item.current ?? index === lastIndex;
    if (isCurrent) {
      // 当前位置不可点：即使调用方给了 href 也不生成 <a>（ARIA 面包屑硬要求）。
      return (
        <li className="vm-breadcrumb__item" key={`crumb-${index}`}>
          <span aria-current="page" className="vm-breadcrumb__current vm-type-heading-body-s-regular">
            {item.label}
          </span>
        </li>
      );
    }
    if (item.href === undefined) {
      return (
        <li className="vm-breadcrumb__item" key={`crumb-${index}`}>
          <span className="vm-breadcrumb__text vm-type-heading-body-s-regular">{item.label}</span>
        </li>
      );
    }
    return (
      <li className="vm-breadcrumb__item" key={`crumb-${index}`}>
        <a
          {...item.linkProps}
          className="vm-breadcrumb__link vm-type-heading-body-s-regular"
          href={item.href}
          onClick={item.onClick}
        >
          {item.label}
        </a>
      </li>
    );
  };

  const separator = (key: string, content: string = SEPARATOR) => (
    <li aria-hidden="true" className="vm-breadcrumb__separator vm-type-heading-body-s-regular" key={key}>
      {content}
    </li>
  );

  const nodes: ReactNode[] = [];
  crumbs.forEach(({ item, index }, position) => {
    if (position > 0) nodes.push(separator(`sep-${position}`));
    nodes.push(renderCrumb(item, index));
    if (collapsed && position === 0) {
      nodes.push(separator('sep-ellipsis'));
      nodes.push(
        onExpand ? (
          <li className="vm-breadcrumb__item" key="ellipsis">
            <button
              aria-label="展开隐藏的层级"
              className="vm-breadcrumb__ellipsis vm-type-heading-body-s-regular"
              onClick={onExpand}
              type="button"
            >
              {ELLIPSIS}
            </button>
          </li>
        ) : (
          separator('ellipsis', ELLIPSIS)
        ),
      );
    }
  });

  return (
    <nav aria-label="面包屑" className={rootClass} ref={ref} {...rest}>
      {/* items 为空（缺省即空数组）时整段不渲染 <ol>：空列表对读屏零信息量，
          根 <nav> 仍保留，ref / className / ...rest 照常可用。 */}
      {nodes.length > 0 ? <ol className="vm-breadcrumb__list">{nodes}</ol> : null}
    </nav>
  );
});
