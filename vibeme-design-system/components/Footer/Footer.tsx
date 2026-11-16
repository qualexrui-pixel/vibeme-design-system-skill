import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react';
import { Divider } from '../Divider';
import './Footer.css';

/** 版式，对应 Figma 变体属性 `Type`。 */
export type FooterType = 'simple' | 'columns';

/** 一列里的一条链接（Figma 里是 `Caption/Caption` 的 `Text/Text-Secondary` 文字）。 */
export interface FooterLink {
  /** 链接文字。 */
  label: ReactNode;
  /** 链接地址，落到原生 `<a href>`。 */
  href: string;
}

/** 一列链接（Figma `Type=columns` 里是 4 个等宽列，每列 = 1 个 `Heading/S` 标题 + 3 条链接）。 */
export interface FooterColumn {
  /** 列标题，Figma 里是 `Heading/S`（14 SemiBold /20）、`Text/Text-Primary`。 */
  title: ReactNode;
  /** 该列的链接列表。 */
  links: FooterLink[];
}

/**
 * 页脚 props。原生属性（`id` / `aria-*` / `role` 等）通过 `...rest` 透传到 `<footer>` 根节点。
 * 组件本身没有交互态，因此不接收 `State` 之类的 prop。
 */
export interface FooterProps extends HTMLAttributes<HTMLElement> {
  /**
   * 版式，映射 Figma 变体属性 `Type`。
   * `simple` 只有品牌行 + 版权行；`columns` 多出四列链接与其后的 `Divider` 实例。
   * @default 'simple'
   */
  type?: FooterType;
  /** 品牌位文字，对应 Figma TEXT 节点 `VibeMe`（`Heading/S` + `--vm-text-primary`）。 */
  brand?: ReactNode;
  /** 版权行文字，对应 Figma TEXT 节点 `© 2026 VibeMe. All rights reserved.`（`Caption/Caption` + `--vm-text-tertiary`）。 */
  copyright?: ReactNode;
  /**
   * 四列链接内容，只在 `type="columns"` 时渲染（Figma 的 `Type=columns` 变体里就是这四列）。
   * Figma 没有 TEXT 属性承载它，所以用结构化数据传入；为空数组时只渲染 `Divider` 与底部行。
   * @default []
   */
  columns?: FooterColumn[];
}

/**
 * 页脚。事实来源：Figma 组件集 `Footer`（node `56066:6407`），2 个变体 = `Type`(simple / columns)。
 *
 * - 容器：`--vm-bg-panel` 实底 + 1px 顶部描边（`--vm-border-default`，Figma 的 `strokeTopWeight=1`，
 *   其余三边为 0）、内边距 `--vm-space-10`（40）、纵向 gap `--vm-space-6`（24）；
 * - `Type=columns`：四等分列（列内 gap `--vm-space-2` = 8）、`Divider` 实例（`Orientation=horizontal,
 *   Style=solid`）、底部行（gap `--vm-space-4` = 16，品牌居左、版权居右）；
 * - 没有 `State` 轴：组件不写任何交互/禁用态，只有链接的 `:hover` 与 `:focus-visible` 兜底。
 */
export const Footer = forwardRef<HTMLElement, FooterProps>(function Footer(
  {
    type = 'simple',
    brand = 'VibeMe',
    copyright = '© 2026 VibeMe. All rights reserved.',
    columns = [],
    className,
    ...rest
  },
  ref,
) {
  const baseId = useId();

  const rootClass = ['vm-footer', `vm-footer--${type}`, className ?? ''].filter(Boolean).join(' ');

  return (
    <footer {...rest} ref={ref} className={rootClass} data-type={type}>
      {type === 'columns' ? (
        <>
          {columns.length > 0 ? (
            <div className="vm-footer__columns">
              {columns.map((column, columnIndex) => {
                const titleId = `${baseId}-column-${columnIndex}`;
                return (
                  // Figma: Type=columns 里的四个列分组，各自是一组标题 + 链接
                  <nav className="vm-footer__column" key={titleId} aria-labelledby={titleId}>
                    <h2 className="vm-footer__column-title vm-type-heading-s" id={titleId}>
                      {column.title}
                    </h2>
                    <ul className="vm-footer__links">
                      {column.links.map((link, linkIndex) => (
                        <li key={`${columnIndex}-${linkIndex}`}>
                          <a className="vm-footer__link vm-type-caption-caption" href={link.href}>
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                );
              })}
            </div>
          ) : null}
          {/* Figma: Type=columns 内嵌一个 Divider 实例（Orientation=horizontal, Style=solid） */}
          <Divider className="vm-footer__divider" />
        </>
      ) : null}

      {/* Figma: 两种变体共有的底部行 —— 品牌（Heading/S）+ 版权（Caption/Caption） */}
      <div className="vm-footer__bar">
        <span className="vm-footer__brand vm-type-heading-s">{brand}</span>
        <span className="vm-footer__copyright vm-type-caption-caption">{copyright}</span>
      </div>
    </footer>
  );
});
