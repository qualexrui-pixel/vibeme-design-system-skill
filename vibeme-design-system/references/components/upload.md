<!-- GEN:BEGIN 本段由 tools/gen-component-docs.py 依据 Figma 导出生成，勿手改；改 Figma 后重新生成 -->

## 概览

| 项 | 值 |
|---|---|
| Figma 组件集 | `Upload`（node `56059:6543`） |
| 分类 | 表单控件 |
| 变体数 | 5 |
| 默认变体 | `State=default` |
| 参考尺寸 | 320×160 px（默认变体） |
| 主题 | 主库（深色中性 + 品牌砂色） |
| 预览图 | [assets/previews/upload.png](../../assets/previews/upload.png) |
| 代码实现 | [`components/Upload/Upload.tsx`](../../components/Upload/Upload.tsx) |
| Figma 链接 | [在 Figma 打开](https://www.figma.com/design/ZO4WH3sbVCj7lZIFMpiwV9/VibeMe-App---Web-Design-%E5%A4%87%E4%BB%BD?node-id=56059-6543) |

![Upload 预览](../../assets/previews/upload.png)

## 变体与属性

| Figma 属性 | 类型 | 取值 | 默认 | 代码 prop |
|---|---|---|---|---|
| `State` | VARIANT | `default` / `hover` / `dragover` / `error` / `disabled` | `default` | `state` |

变体是属性轴的笛卡尔积：**5 = 5**（`State`）。

内嵌组件：`Property 1=icon, Property 2=import-line`×5

## 各变体的事实

> 填充栈按 Figma 图层顺序排列（**靠右的是上层**，hover/pressed 的叠加层在最后）。
> `⚠无cssVar` 表示该组件引用了历史遗留变量，代码里不要照抄，按 `foundations.md` 的规则换成语义 token。

| 变体 | 尺寸 | 填充栈 | 描边 | 圆角 | 内边距 上/右/下/左 | 不透明度 |
|---|---|---|---|---|---|---|
| `State=default` | 320×160 | `Background/bg-card` #202020 `--vm-bg-card` | `Background/border-default` #FFFFFF 12% `--vm-border-default` | 12 | 20/20/20/20 | — |
| `State=hover` | 320×160 | `Background/bg-card` #202020 `--vm-bg-card` | `White/White-4` #FFFFFF 30% `--vm-white-4` | 12 | 20/20/20/20 | — |
| `State=dragover` | 320×160 | `Background/bg-card` #202020 `--vm-bg-card` | `Brand/Brand` #FFCC90 `--vm-brand` | 12 | 20/20/20/20 | — |
| `State=error` | 320×160 | `Background/bg-card` #202020 `--vm-bg-card` | `状态色/Error` #FF3B30 `--vm-status-error` | 12 | 20/20/20/20 | — |
| `State=disabled` | 320×160 | `Background/bg-card` #202020 `--vm-bg-card` | `Background/border-default` #FFFFFF 12% `--vm-border-default` | 12 | 20/20/20/20 | 0.38 |

## 结构（默认变体）

### State=default

```text
`COMPONENT` State=default 320×160 VERTICAL gap 8 pad 20/20/20/20 填充 `Background/bg-card` #202020 `--vm-bg-card` 描边 `Background/border-default` #FFFFFF 12% `--vm-border-default` 圆角 12
└─ `INSTANCE` Line icon 24×24 实例=Property 1=icon, Property 2=import-line
  └─ `VECTOR` icon 18.5×18.5 填充 #FFFFFF
└─ `TEXT` 点击或拖拽文件到此处上传 168×20 填充 `Text/Text-Secondary` #FFFFFF 64% `--vm-text-secondary` 文字样式 `Heading/Body/S/Regular`（14 Regular /20） 内容 '点击或拖拽文件到此处上传'
```

### State=dragover

```text
`COMPONENT` State=dragover 320×160 VERTICAL gap 8 pad 20/20/20/20 填充 `Background/bg-card` #202020 `--vm-bg-card` 描边 `Brand/Brand` #FFCC90 `--vm-brand` 圆角 12
└─ `INSTANCE` Line icon 24×24 实例=Property 1=icon, Property 2=import-line
  └─ `VECTOR` icon 18.5×18.5 填充 #FFFFFF
└─ `TEXT` 点击或拖拽文件到此处上传 168×20 填充 `Text/Text-Action` #FFCC90 `--vm-text-action` 文字样式 `Heading/Body/S/Regular`（14 Regular /20） 内容 '点击或拖拽文件到此处上传'
```


## 设计 token

| Figma 变量 | CSS 变量 | 值 |
|---|---|---|
| `Background/bg-card` | `--vm-bg-card` | `#202020` |
| `Background/border-default` | `--vm-border-default` | `rgba(255, 255, 255, 0.12)` |
| `Brand/Brand` | `--vm-brand` | `#FFCC90` |
| `Semantic Radius/radius-card` | `--vm-radius-card` | `12px` |
| `Text/Text-Action` | `--vm-text-action` | `#FFCC90` |
| `Text/Text-Secondary` | `--vm-text-secondary` | `rgba(255, 255, 255, 0.64)` |
| `White/White-4` | `--vm-white-4` | `rgba(255, 255, 255, 0.3)` |
| `border/width/thin` | `--vm-border-width-thin` | `1px` |
| `opacity/disabled` | `--vm-opacity-disabled` | `0.38` |
| `space/space-2` | `--vm-space-2` | `8px` |
| `space/space-5` | `--vm-space-5` | `20px` |
| `状态色/Error` | `--vm-status-error` | `#FF3B30` |

<!-- GEN:END -->


## 交互与状态

Figma 把 5 档都放在 `State` 一个轴上，但代码里拆成「伪类 / prop / 原生属性」三类：

| 状态 | 代码里由什么触发 | 视觉变化（全部走 token） |
|---|---|---|
| `default` | 无 | 虚线框描边 `--vm-border-default`（`Background/border-default`，12% 白），说明文字 `--vm-text-secondary`；图标恒为 `--vm-white-0` |
| `hover` | `.vm-upload__box:hover` 伪类，**不是 prop** | 描边换成 `--vm-white-4`（`White/White-4`，30% 白），同时说明文字提到 `--vm-text-primary`；底色 `--vm-bg-card` 不变、不加任何叠加层 |
| `dragover` | `dragging` prop（应用态） | 描边换成 `--vm-brand`（`Brand/Brand`），说明文字换成 `--vm-text-action`；线宽仍是 1px |
| `error` | `error` prop（应用态） | 描边换成 `--vm-status-error`（`状态色/Error`），说明文字同色；**Upload 的 error 不加粗到 2px**（这点和 Input 不同，见各变体的事实里 `strokeWeight` 仍是 1） |
| `disabled` | 原生 `disabled`（落在内部 `input[type=file]` 上） | 整框 `opacity: var(--vm-opacity-disabled)`（0.38），说明文字换 `--vm-text-disable`，`cursor: not-allowed`；**不换灰色底** |

另外补了一档 Figma 里没有的状态：内部文件输入获得键盘焦点时，`.vm-upload__box:has(.vm-upload__input:focus-visible)`
把描边换成 `--vm-border-selected`（50% 白）并加 `0 0 0 var(--vm-focus-ring-width)` 的 ring —— 这是纯 a11y 补充，
因为 Figma 的 Upload 只有鼠标语义。过渡统一用 `--vm-duration-fast`，并在 `prefers-reduced-motion: reduce` 下关掉。

## 代码用法

```tsx
import { useState } from 'react';
import { Upload } from './components/Upload';

export function UploadDemo() {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(false);

  return (
    <Upload
      accept="image/png,image/jpeg"
      multiple
      dragging={dragging}
      error={error}
      errorMessage={error ? '只支持 PNG / JPG，单个文件不超过 10 MB' : undefined}
      onDragEnter={() => setDragging(true)}
      onDragLeave={() => setDragging(false)}
      onDrop={() => setDragging(false)}
      onChange={(e) => {
        const files = e.target.files;
        setError(!!files && Array.from(files).some((f) => f.size > 10 * 1024 * 1024));
      }}
    >
      点击或拖拽文件到此处上传
    </Upload>
  );
}
```

`Upload` 的 props 就是「Figma 应用态 + 内部 `<input type="file">` 的原生属性」：`dragging`、`error`、`errorMessage`、
`children`（对应 Figma 的 TEXT 内容插槽，不传则用 Figma 原文案），其余 `accept` / `multiple` / `onChange` /
`onDragEnter` 等一律透传给内部 input，`className` 合并到最外层 `.vm-upload`。样式来自 `import './Upload.css'`
（组件内部已 `import`，调用方不需要再引一次）。

## 可访问性

根节点是 `div`，但**真正可交互的控件是内部那个覆盖整框、`opacity: 0` 的 `<input type="file">`**：
它天然可 Tab 聚焦、可用 Enter/Space 触发系统选择器，不需要伪造 `role="button"` + 手写键盘事件。
`disabled` 直接落在 input 上（`cursor: not-allowed` 由 CSS 给出），`error` 同步成 `aria-invalid="true"`；
`errorMessage` 渲染成 `role="alert"` 的段落，并通过 `aria-describedby` 关联到 input，**不允许只靠红色描边表达错误**。
焦点样式挂在 `.vm-upload__box:has(.vm-upload__input:focus-visible)` 上（键盘焦点才出 ring，鼠标点击不出），
`outline: none` 之前必须已经有 `--vm-border-selected` 描边兜底。图标是 `aria-hidden="true"` 的内联 SVG，
不参与可访问性树；说明文字用真实文本节点，屏幕阅读器读到的是「点击或拖拽文件到此处上传」，
所以请不要用纯图标替代文案。禁用态虽然降到 38% 不透明度，但文字仍是可读文本而非 `visibility: hidden`。

## 不要这样做

1. **不要把 `hover` 做成 prop**。Figma 里 `State=hover` 只是一个视觉档位；代码里必须用 `:hover` 伪类。
   把它做成 `state="hover"` 会让「鼠标移入」和「拖拽悬停」两个语义混在一起，也无法和 `error` 组合。
2. **不要给 Upload 套 Button 的填充叠加手法**。Button 一族的 hover 是「底色 + `--vm-white-7`（8% 白）」的
   叠加层；Upload（和 Input / Search 同族）的 hover **只换描边** `--vm-white-4`，`--vm-bg-card` 一个字都不动。
3. **不要把 error 描边加粗成 2px**。这是从 Input 抄过来的常见错误：Input 的 error 是 `--vm-status-error` + 2px，
   而 Upload 在 Figma 里 5 档描边都是 `border/width/thin`（1px），只换颜色。
4. **不要用灰色冒充 disabled**。Figma 的 `State=disabled` 是「描边/底色都保持 default，只叠加 `opacity/disabled` 0.38」，
   代码里只能是 `opacity: var(--vm-opacity-disabled)`；另外单独把背景换成 `--vm-bg-panel` 之类的做法是错的。
5. **历史遗留：图标颜色没有绑变量**。Figma 里 `Line icon` 实例内部的 `icon` 矢量填充是写死的 `#FFFFFF`
   （导出里 `varName: null`），而同行文字却绑了 `Text/Text-Secondary` / `Text/Text-Action` /
   `状态色/Error`。落地时把图标颜色定为 `--vm-white-0`（纯白），**不要**让它跟着文字变成品牌色或错误色；
   如果产品确实希望图标跟随文字，请改 Figma 的绑定，而不是在 CSS 里 `color: inherit`。
6. **不要自己写虚线样式**。Figma 是 `strokeWeight: 1` + `dashPattern: [6, 6]`；CSS 侧只有结构性的
   `border: var(--vm-border-width-thin) dashed var(--vm-border-default)`，虚线节奏由浏览器决定，
   想要 6/6 就得用 `background-image` 自己画，那会绕开 token，不做。

## 相关组件

- **Button**：上传失败后的「重试 / 取消」用 Button（`type="secondary"`），不要另造一个上传专用按钮。
- **Input / Textarea**：同一族的表单控件，共享 `--vm-border-default`（默认）/ `--vm-white-4`（hover）/
  `--vm-border-selected`（focus）/ `--vm-opacity-disabled`（disabled）这套状态语言；但 **error 线宽不同**（Input 2px，Upload 1px）。
- **Toast**：文件上传的大多数错误反馈（体积超限、格式不支持）应该走 Toast 或表单级错误，
  框内的 `errorMessage` 只留一句话；Toast 与 Upload 的 `--vm-status-error` 是同一个 token。
- **Avatar / Card**：上传完成后的结果缩略图通常放进 Card，头像类结果放进 Avatar，Upload 自身不负责预览渲染。
- **Loading**：上传中把文案换成进度说明，用 Loading 表达「进行中」，不要让 Upload 变成 `loading` 变体（Figma 没有这一档）。
