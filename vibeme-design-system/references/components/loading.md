<!-- GEN:BEGIN 本段由 tools/gen-component-docs.py 依据 Figma 导出生成，勿手改；改 Figma 后重新生成 -->

## 概览

| 项 | 值 |
|---|---|
| Figma 组件集 | `Loading`（node `56063:6842`） |
| 分类 | 反馈类 |
| 变体数 | 3 |
| 默认变体 | `Size=sm` |
| 参考尺寸 | 16×16 px（默认变体） |
| 主题 | 主库（深色中性 + 品牌砂色） |
| 预览图 | [assets/previews/loading.png](../../assets/previews/loading.png) |
| 代码实现 | [`components/Loading/Loading.tsx`](../../components/Loading/Loading.tsx) |
| Figma 链接 | [在 Figma 打开](https://www.figma.com/design/ZO4WH3sbVCj7lZIFMpiwV9/VibeMe-App---Web-Design-%E5%A4%87%E4%BB%BD?node-id=56063-6842) |

![Loading 预览](../../assets/previews/loading.png)

## 变体与属性

| Figma 属性 | 类型 | 取值 | 默认 | 代码 prop |
|---|---|---|---|---|
| `Size` | VARIANT | `sm` / `md` / `lg` | `sm` | `size` |

变体是属性轴的笛卡尔积：**3 = 3**（`Size`）。

## 各变体的事实

> 填充栈按 Figma 图层顺序排列（**靠右的是上层**，hover/pressed 的叠加层在最后）。
> `⚠无cssVar` 表示该组件引用了历史遗留变量，代码里不要照抄，按 `foundations.md` 的规则换成语义 token。

| 变体 | 尺寸 | 填充栈 | 描边 | 圆角 | 内边距 上/右/下/左 | 不透明度 |
|---|---|---|---|---|---|---|
| `Size=sm` | 16×16 | — | — | — | — | — |
| `Size=md` | 24×24 | — | — | — | — | — |
| `Size=lg` | 32×32 | — | — | — | — | — |

## 结构（默认变体）

### Size=sm

```text
`COMPONENT` Size=sm 16×16
└─ `FRAME` Frame 16×16 描边 `White/White-6` #FFFFFF 12% `--vm-white-6` 圆角 999
└─ `VECTOR` Vector 13×13 描边 `Brand/Brand` #FFCC90 `--vm-brand`
```

### Size=lg

```text
`COMPONENT` Size=lg 32×32
└─ `FRAME` Frame 32×32 描边 `White/White-6` #FFFFFF 12% `--vm-white-6` 圆角 999
└─ `VECTOR` Vector 29×29 描边 `Brand/Brand` #FFCC90 `--vm-brand`
```

### Size=md

```text
`COMPONENT` Size=md 24×24
└─ `FRAME` Frame 24×24 描边 `White/White-6` #FFFFFF 12% `--vm-white-6` 圆角 999
└─ `VECTOR` Vector 21×21 描边 `Brand/Brand` #FFCC90 `--vm-brand`
```


## 设计 token

| Figma 变量 | CSS 变量 | 值 |
|---|---|---|
| `Brand/Brand` | `--vm-brand` | `#FFCC90` |
| `Radious/radius-full` | `--vm-radius-full` | `999px` |
| `White/White-6` | `--vm-white-6` | `rgba(255, 255, 255, 0.12)` |
| `border/width/ring` | `--vm-border-width-ring` | `3px` |

<!-- GEN:END -->

## 交互与状态

Loading 在 Figma 里**没有状态轴**：3 个变体只有 `Size`，没有 hover / pressed / focus / error / disabled 变体，
所以代码里没有任何交互伪类、也没有 `disabled` 之类的 prop。唯一的「变化」是尺寸和自转：

| 代码 | Figma 事实 | 视觉结果 |
|---|---|---|
| `size="sm"`（默认） | `Size=sm`，实例 16×16，弧的 Vector 13×13 | 直径 16px，弧长 270° |
| `size="md"` / `"lg"` | `Size=md` 24×24（Vector 21×21）／`Size=lg` 32×32（Vector 29×29） | 直径 24 / 32px，其余完全一致 |
| 自转（无 prop） | Figma 是静态设计稿，没有动效说明 | 弧所在的 `<g>` 900ms 匀速顺时针转一圈 |

颜色与线宽**三档完全一致**，不要把线宽按尺寸缩放：底环是 `--vm-white-6`（`White/White-6` 12% 白），
弧是 `--vm-brand`（`Brand/Brand` #FFCC90），线宽是 `--vm-border-width-ring`（`border/width/ring` 3px，三档共用同一个变量），
线帽是圆的（Figma `strokeCap = ROUND`）。弧是 270°＝3/4 圈：`stroke-dasharray: 0.75C 0.25C`（C 为周长）＋
`rotate(-90)` 让弧从 12 点开始、顺时针画到 9 点，与 Figma 里 `Vector` 的 path（`M 6.5 0 … 0 6.5`）一致。

动效必须尊重系统设置：`prefers-reduced-motion: reduce` 时 `.vm-loading__spin { animation: none }`，
此时静态显示 270° 弧，仍能看出是加载指示器而不是装饰图形。

## 代码用法

```tsx
import { Loading } from '../components/Loading';

export function Example() {
  return (
    <>
      {/* 默认 sm：16px，等价于 Figma 的 Size=sm 变体 */}
      <Loading />

      {/* 明确尺寸档位；aria-label 默认「加载中」 */}
      <Loading size="md" />

      {/* 自定义播报文案：label 会落到 aria-label（第二优先级低于调用方直接传的 aria-label） */}
      <Loading size="lg" label="正在生成文案" />

      {/* 纯装饰：按钮里已经有可见文字时不要再播报一次 */}
      <button type="button" disabled>
        <Loading size="sm" aria-hidden /> 正在保存…
      </button>

      {/* className / style / data-* 仍然透传；width、height 已从 props 中剔除，只认 size */}
      <Loading size="md" className="toolbar-loading" data-testid="loading" />
    </>
  );
}
```

CSS 引入方式：组件内部已 `import './Loading.css'`，调用方只需 `import { Loading } from '../components/Loading'`
（或从桶文件 `import { Loading } from '../components'`，桶文件会连 `tokens.css` 一起加载）。
组件默认 `display: inline-block; vertical-align: middle`，可以直接塞进按钮、标签行或表格单元格；它在 flex 行里
带 `flex: none`，不会被拉伸变形。

## 可访问性

- 根节点是真的 `<svg>`，带 `role="status"`（隐含 `aria-live="polite"`）＋ `aria-label`，默认文案「加载中」；
  想换文案用 `label`，或在调用处直接传 `aria-label` / `aria-labelledby`（直接传的优先级更高）。
- **不进入 Tab 序列**：没有 `tabIndex`，SVG 也不可聚焦；加载指示器不是交互目标，键盘不会停在它上面。
- 装饰性用法要显式降噪：按钮里已经写着「正在保存…」时，再播报一次「加载中」是噪音，应传 `aria-hidden`
  或 `label=""`；反过来，整页加载只有一个 spinner 时，必须给它可读文案。
- 动效可关闭：`@media (prefers-reduced-motion: reduce)` 关掉自转，动画用 `animation` 而不是 `transition`
  持续旋转，不会因为焦点、hover 变化而闪烁。
- 不要在 spinner 上挂 `role="alert"`：加载开始/结束属于状态变化，而不是需要打断用户的告警；
  加载失败请用 `Toast` 或 `Notification` 播报。
- 不要只靠「转圈」传达结果：加载完成、加载失败都要有文字或状态变化，色盲用户与读屏用户拿不到「还在转」这个信息。

## 不要这样做

1. **不要按尺寸缩放线宽**。`sm` / `md` / `lg` 的环线都是 3px，因为三者绑定的是同一个变量 `border/width/ring`
   （`--vm-border-width-ring`）；写 `stroke-width: 2px`（sm）/ `4px`（lg）就不是这套设计了。
2. **不要把弧画成整圈或改成别的比例**。Figma 的 `Vector` path 是 270°（从 12 点到 9 点），
   改成 360° 就退化成「一个白圈 + 一个没有任何起止点的品牌色圈」，失去加载语义。
3. **不要照抄 Figma 里 Vector 的摆放坐标**。`Size=sm` 的 `Vector` 是 13×13、位置在 16×16 容器的 `(0, 0)`
   （即贴在左上角），而底环是 16×16 的 INSIDE 3px 描边；两者视觉带宽都是 5–8px，但只要把 Vector 放回
   `(0, 0)`，弧的圆心就会比环的圆心偏 1.5px。代码里两者共用 `cx = cy = size / 2`、`r = (size - 3) / 2` 才同心。
4. **不要给 Loading 造 hover / disabled 状态**。它没有 `State` 变体；不要叠加 `--vm-white-7`、
   不要用 `opacity: var(--vm-opacity-disabled)` 假装禁用，需要隐藏就直接不渲染。
5. **不要写死颜色或线宽**。`#FFCC90`、`rgba(255,255,255,0.12)`、`3px` 都要走 `--vm-brand` / `--vm-white-6` / `--vm-border-width-ring`，
   也不要用 `currentColor` 让父级文字色改掉品牌色弧。
6. **不要用图片、GIF 或 emoji 代替这个 SVG**，也不要给 `<svg>` 传 `width` / `height`
   （已从 props 剔除）：尺寸只由 `size` 控制，否则三档尺寸和文档对不上。
7. **不要忽略 `prefers-reduced-motion`**。前庭敏感用户会被无限旋转的动画影响，必须给出关闭动画的静态版本。

## 相关组件

- **Progress**：同属反馈类。知道百分比（上传/生成到 60%）用 Progress；不知道要多久用 Loading。两者不要同位置叠放。
- **Skeleton**：整块内容**首次**加载时用 Skeleton 撑住版式；局部刷新、按按钮后的等待用 Loading（`sm` 内联最合适）。
- **Button / VibeAiTriggerButton**：按钮进入提交中状态时，把 `size="sm"` 的 Loading 放在文字前，
  并给按钮自身加原生 `disabled`；Loading 只负责转，不负责禁用按钮。
- **Table / ListItem / Card**：局部刷新时用 `sm`/`md` 放在行内或卡片角落，不要用 `lg` 盖住内容。
- **VibeAiGenerationStatus**：AI 生成中属于该组件的语义范围，Loading 只作为它的内嵌指示器出现，避免两处都播报「加载中」。
- **Empty**：加载结束后没有数据要切到 Empty，不要让 Loading 一直转下去。
- **Tooltip / Popover**：浮层里如果有异步内容，用 `sm` 的 Loading 放在浮层内，不要让浮层跟着转。
