<!-- GEN:BEGIN 本段由 tools/gen-component-docs.py 依据 Figma 导出生成，勿手改；改 Figma 后重新生成 -->

## 概览

| 项 | 值 |
|---|---|
| Figma 组件集 | `Progress`（node `56063:6832`） |
| 分类 | 反馈类 |
| 变体数 | 4 |
| 默认变体 | `Value=25` |
| 参考尺寸 | 320×6 px（默认变体） |
| 主题 | 主库（深色中性 + 品牌砂色） |
| 预览图 | [assets/previews/progress.png](../../assets/previews/progress.png) |
| 代码实现 | [`components/Progress/Progress.tsx`](../../components/Progress/Progress.tsx) |
| Figma 链接 | [在 Figma 打开](https://www.figma.com/design/ZO4WH3sbVCj7lZIFMpiwV9/VibeMe-App---Web-Design-%E5%A4%87%E4%BB%BD?node-id=56063-6832) |

![Progress 预览](../../assets/previews/progress.png)

## 变体与属性

| Figma 属性 | 类型 | 取值 | 默认 | 代码 prop |
|---|---|---|---|---|
| `Value` | VARIANT | `25` / `50` / `75` / `100` | `25` | `value` |

变体是属性轴的笛卡尔积：**4 = 4**（`Value`）。

## 各变体的事实

> 填充栈按 Figma 图层顺序排列（**靠右的是上层**，hover/pressed 的叠加层在最后）。
> `⚠无cssVar` 表示该组件引用了历史遗留变量，代码里不要照抄，按 `foundations.md` 的规则换成语义 token。

| 变体 | 尺寸 | 填充栈 | 描边 | 圆角 | 内边距 上/右/下/左 | 不透明度 |
|---|---|---|---|---|---|---|
| `Value=25` | 320×6 | — | — | — | — | — |
| `Value=50` | 320×6 | — | — | — | — | — |
| `Value=75` | 320×6 | — | — | — | — | — |
| `Value=100` | 320×6 | — | — | — | — | — |

## 结构（默认变体）

### Value=25

```text
`COMPONENT` Value=25 320×6
└─ `FRAME` Frame 320×6 填充 `White/White-6` #FFFFFF 12% `--vm-white-6` 圆角 999
└─ `FRAME` Frame 80×6 填充 `Brand/Brand` #FFCC90 `--vm-brand` 圆角 999
```


## 设计 token

| Figma 变量 | CSS 变量 | 值 |
|---|---|---|
| `Brand/Brand` | `--vm-brand` | `#FFCC90` |
| `Radious/radius-full` | `--vm-radius-full` | `999px` |
| `White/White-6` | `--vm-white-6` | `rgba(255, 255, 255, 0.12)` |

<!-- GEN:END -->

## 交互与状态

Progress 在 Figma 里**没有交互状态**：4 个变体只按 `Value` 分档，没有 `State` 轴，没有 hover / pressed / focus / disabled 变体，
也没有 38% 不透明度的禁用表现。所以代码里**一个交互伪类都没有**（`.vm-progress` 里不出现 `:hover` / `:active` / `:focus-visible`），
也没有 `disabled` / `error` 这类 prop —— 不要为了「统一」给它补状态。

唯一的「状态」是数值，由 prop `value` 表达，映射 Figma 的 `Value`：

| 代码 | Figma 事实 | 视觉结果 |
|---|---|---|
| `value={25}`（默认） | `Value=25` 变体，进度段实测 80×6，轨道 320×6 | 进度段宽 25%，品牌色 `--vm-brand`（`Brand/Brand` #FFCC90） |
| `value={50}` / `75` / `100` | 同结构变体，只有进度段宽度不同 | 50% / 75% / 100% 宽，颜色与圆角三档完全一致 |
| `value` 越界 | Figma 未画 | 小于 0 钳到 0，大于 100 钳到 100，`NaN` / `Infinity` / 缺省按 0（默认值除外，默认给 25） |

轨道永远是 `--vm-white-6`（`White/White-6` 12% 白），不随 `value` 变化；两端圆角 `--vm-radius-full`（`Radious/radius-full` 999px），
由根节点的 `overflow: hidden` 保证进度段不会溢出轨道圆角。宽度变化用 `width var(--vm-duration-fast) ease-out` 过渡，
`prefers-reduced-motion: reduce` 时该过渡被关掉（`.vm-progress__fill { transition: none }`）。

## 代码用法

```tsx
import { useEffect, useState } from 'react';
import { Progress } from '../components/Progress';

export function Example() {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPercent((p) => (p >= 100 ? 0 : p + 25)), 800);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ width: 320 }}>
      {/* 默认值 25，等价于 Figma 的 Value=25 变体 */}
      <Progress aria-label="上传进度" />

      {/* 传真实百分比；越界会被钳制 */}
      <Progress value={percent} aria-label="上传进度" />

      {/* className 与 style 与内部类合并且不覆盖，多余属性（data-*、aria-*）原样落到根节点 */}
      <Progress value={133} className="my-progress" style={{ width: 240 }} aria-label="已钳制到 100" />
    </div>
  );
}
```

CSS 引入方式：组件内部已 `import './Progress.css'`，调用方只需 `import { Progress } from '../components/Progress'`
（或从桶文件 `import { Progress } from '../components'`，桶文件会连 `tokens.css` 一起加载）。根节点宽度是 `100%`，
Figma 的 320 只是参考宽度 —— 用外层容器或 `style={{ width }}` 给宽度即可，组件不写死宽。

## 可访问性

- 根节点是 `<div role="progressbar">`，带 `aria-valuemin={0}` / `aria-valuemax={100}` / `aria-valuenow={percent}`；
  **必须有可访问名称**：调用方要传 `aria-label`（如「上传进度」）或 `aria-labelledby` 指向同页的可见文字，组件不猜文案。
- 进度是**确定值**语义，所以 `aria-valuenow` 一直输出（包括 0）；如果将来要做不确定进度（Figma 里没有这个变体），
  正确做法是去掉 `aria-valuenow` 而不是造一个 `indeterminate` prop。
- 纯展示、不可聚焦：根节点没有 `tabIndex`，键盘 `Tab` 不会停在进度条上；进度更新属于状态变化，
  真正需要播报「已完成 100%」的场景请由调用方在容器上加 `aria-live="polite"`，或者直接读进度旁边的文字，不要给进度条本体加 `role="alert"`。
- 不依赖颜色单独传意：进度段与轨道都是纯色块，色盲用户靠宽度差就能判断进度；颜色对比度上轨道是 12% 白、进度段是 `--vm-brand`，
  在 `--vm-bg-app` / `--vm-bg-card` 上都能看出边界。必要时在进度条旁给出百分比文字（那是 `<Statistic>` / 普通文本的事，不是本组件的事）。
- 触摸与命中：进度条不是交互目标，`height: 6px` 细条不影响可点区域；不要在它上面挂点击跳转。

## 不要这样做

1. **不要给 Progress 造 hover / disabled / error 状态**。Figma 的 4 个变体只有 `Value`，没有 `State` 轴。
   加 `:hover` 叠加层会与 `--vm-white-6` 轨道叠出别人设计稿里不存在的颜色；`disabled` 也没有来源（既没有 38% 不透明度的变体，也没有灰色轨道变体）。
2. **不要用 `--vm-border-default` 当轨道色**。它的解析值恰好也是 12% 白（`Background/border-default → White/White-6`），
   与轨道的 `White/White-6` 数值相同，但一个是描边语义、一个是填充语义；写 `background-color: var(--vm-border-default)` 会让后人以为轨道是描边派生出来的。
3. **不要把 `value` 限死在 25/50/75/100**。Figma 的四个值只是视觉样本，组件按 0–100 的实数百分比工作并做钳制；
   写 `value <= 100 ? value : 100` 之外的自定义映射（比如把 0–1 当 100%）会让文档与实现不一致。
4. **不要手写颜色或圆角**。`#FFCC90`、`rgba(255,255,255,0.12)`、`999px` 都必须走 `--vm-brand` / `--vm-white-6` / `--vm-radius-full`；
   尤其不要把品牌色换成橙色系（`foundations.md` 明令禁止橙色）。
5. **不要给进度段自己算 px 宽**（如 `width: 80px`）。Figma 的 `Value=25` 只是 320 轨道下的 80px，容器一换就错；
   组件用百分比宽度 `width: value%` 才能跟随容器。
6. **`Radious/radius-full` 里 Figma 变量名本身拼错了**（`Radious`），改名会破坏与 Figma 的对应关系 —— 保留原始拼写，只在文档里标注。

## 相关组件

- **Loading**：同属反馈类，但 Loading 是**不确定进度**的环形指示器（Figma 里只有 `Size` 轴）。明确知道百分比时用 Progress，
  不知道总时长/总量时用 Loading；两者不要叠在同一个位置。
- **Skeleton**：页面首次加载、还没有任何数据时用 Skeleton 撑住版式；已有数据、正在写回后端时用 Progress。
- **Upload**：上传任务里「已上传 3/5 个」的总进度用 Progress，单文件进度也用它；Upload 负责选择与列表，Progress 只负责画进度。
- **Toast / Notification**：长任务完成时用它们做结果提示，Progress 自身不做完成播报（没有 `onComplete` 之类的事件）。
- **card / container / stack**：Progress 宽度 `100%`，放在卡片内容区会自然撑满；细条建议上下留 `--vm-space-*` 间距，不要贴边。
- **Statistic**：需要同时显示「75%」这类数字时，用 Statistic 显示数字、Progress 显示进度，二者是并列关系而不是嵌套关系。
