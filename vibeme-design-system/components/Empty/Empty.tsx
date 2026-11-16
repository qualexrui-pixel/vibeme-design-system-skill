import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import './Empty.css';

/** 空状态类型，对应 Figma 变体属性 `Type`（`empty` / `search` / `error`）。 */
export type EmptyType = 'empty' | 'search' | 'error';

/**
 * 三档的默认文案，**逐字来自 Figma** 的文本层（`暂无内容` / `没有搜索结果` / `加载失败` …）。
 * 传了 `title` / `description` 就以调用方为准。
 */
const DEFAULT_COPY: Record<EmptyType, { title: string; description: string }> = {
  empty: { title: '暂无内容', description: '这里还没有任何内容，先去创建一个吧' },
  search: { title: '没有搜索结果', description: '换个关键词或调整筛选条件再试试' },
  error: { title: '加载失败', description: '网络或服务异常，请稍后重试' },
};

/**
 * Empty 的 props。事实来源：Figma 组件集 `Empty`（node `56061:6529`），3 个变体 = `Type`。
 *
 * `title` 覆盖的是**可见标题**，因此剔除了原生 `title`（tooltip）属性；需要 tooltip 请用 `aria-description` 或外层元素。
 */
export interface EmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * 空状态类型，映射 Figma 属性 `Type`。默认 `empty`（= Figma 的 `defaultVariant`）。
   * 三档只换图标（`folder-line` / `search-line` / `alert-line`）与默认文案，**颜色完全一样**。
   */
  type?: EmptyType;
  /** 标题文本，对应 Figma 文本层「暂无内容 / 没有搜索结果 / 加载失败」（`Heading/M` 16 SemiBold /24）。不传用该档默认文案。 */
  title?: ReactNode;
  /**
   * 说明文本，对应 Figma 文本层「这里还没有任何内容，先去创建一个吧」等
   * （`Heading/Body/S/Regular` 14 Regular /20）。不传用该档默认文案。
   */
  description?: ReactNode;
}

/**
 * Figma: `Line icon` 实例（48×48，内含一个居中的矢量）。
 * 三个矢量都从 Figma 导出（`download_assets` 的 svgAssets），只把 `fill="white"` 换成 `currentColor`。
 */
function EmptyIcon({ type }: { type: EmptyType }) {
  if (type === 'search') {
    return (
      /* Figma: Line icon / search-line（矢量 36.4998×36.4998） */
      <svg width="36.4998" height="36.4998" viewBox="0 0 36.4998 36.4998" fill="none" aria-hidden="true" focusable="false">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.5 0C25.6127 0 33 7.3873 33 16.5C33 20.5163 31.5639 24.1964 29.1787 27.0576L36.0605 33.9395C36.6462 34.5252 36.6463 35.4748 36.0605 36.0605C35.4748 36.6463 34.5252 36.6462 33.9395 36.0605L27.0576 29.1787C24.1964 31.5639 20.5163 33 16.5 33C7.3873 33 0 25.6127 0 16.5C0 7.3873 7.3873 0 16.5 0ZM16.5 3C9.04416 3 3 9.04416 3 16.5C3 23.9558 9.04416 30 16.5 30C23.9558 30 30 23.9558 30 16.5C30 9.04416 23.9558 3 16.5 3Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (type === 'error') {
    return (
      /* Figma: Line icon / alert-line（矢量 35×41.5） */
      <svg width="35" height="41.5" viewBox="0 0 35 41.5" fill="none" aria-hidden="true" focusable="false">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.5049 0C18.3333 2.7463e-07 19.0049 0.671573 19.0049 1.5V3.57715C26.3059 4.32999 32 10.5 32 18V32.5H33.5C34.3284 32.5 35 33.1716 35 34C35 34.8284 34.3284 35.5 33.5 35.5H23.9785C23.7231 38.8561 20.9216 41.5 17.5 41.5C14.0785 41.5 11.2769 38.8561 11.0215 35.5H1.5C0.671573 35.5 0 34.8284 0 34C0 33.1716 0.671573 32.5 1.5 32.5H3V18C3 10.4967 8.69921 4.32452 16.0049 3.57617V1.5C16.0049 0.671614 16.6765 6.59413e-05 17.5049 0ZM14.0361 35.5C14.2788 37.1961 15.7368 38.5 17.5 38.5C19.2632 38.5 20.7212 37.1961 20.9639 35.5H14.0361ZM17.5 6.5C11.1487 6.5 6 11.6487 6 18V32.5H29V18C29 11.6487 23.8513 6.5 17.5 6.5Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  return (
    /* Figma: Line icon / folder-line（矢量 38.2084×37） */
    <svg width="38.2084" height="37" viewBox="0 0 38.2084 37" fill="none" aria-hidden="true" focusable="false">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.5771 0C14.248 0 15.8283 0.759769 16.8721 2.06445L19.2207 5H27.5C30.5376 5 33 7.46243 33 10.5V12.0078C36.2844 12.1786 38.7141 15.2042 38.1182 18.4834L35.5732 32.4834C35.0978 35.0985 32.82 36.9998 30.1621 37H5.5C2.46243 37 0 34.5376 0 31.5V5.5C0 2.46243 2.46243 0 5.5 0H12.5771ZM8.83789 15C7.6299 15.0002 6.59505 15.8642 6.37891 17.0527L3.83301 31.0527C3.55399 32.5873 4.73322 34 6.29297 34H30.1621C31.3701 33.9998 32.4049 33.1358 32.6211 31.9473L35.167 17.9473C35.446 16.4127 34.2668 15 32.707 15H8.83789ZM5.5 3C4.11929 3 3 4.11929 3 5.5V18.8643L3.42676 16.5166C3.90222 13.9015 6.18 12.0002 8.83789 12H30V10.5C30 9.11929 28.8807 8 27.5 8H18.5C18.0445 8 17.6138 7.79303 17.3291 7.4375L14.5293 3.93848C14.0549 3.34547 13.3366 3 12.5771 3H5.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 空状态：`图标（48×48） + 标题 + 说明`，整体纵向居中（Figma `VERTICAL`、gap 12、padding 40）。
 *
 * 三档 `Type` 的**颜色完全相同**（标题 `--vm-text-primary`、说明 `--vm-text-secondary`、
 * 图标 `--vm-white-0`），`error` 档并不是红色的——区分靠图标与文案，所以文案必须写清楚「哪里错了」。
 */
export const Empty = forwardRef<HTMLDivElement, EmptyProps>(function Empty(
  { type = 'empty', title, description, className, ...rest },
  ref,
) {
  const copy = DEFAULT_COPY[type];
  const rootClass = ['vm-empty', `vm-empty--${type}`, className].filter(Boolean).join(' ');

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      {...rest}
      ref={ref}
      className={rootClass}
      data-type={type}
    >
      <span className="vm-empty__icon">
        <EmptyIcon type={type} />
      </span>
      <p className="vm-empty__title vm-type-heading-m">{title ?? copy.title}</p>
      <p className="vm-empty__description vm-type-heading-body-s-regular">
        {description ?? copy.description}
      </p>
    </div>
  );
});
