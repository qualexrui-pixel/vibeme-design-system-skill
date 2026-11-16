---
name: vibeme-design-system
description: VibeMe 设计组件库与设计 token 的权威参考和实现契约。当需要按 VibeMe 的设计稿或组件库编写、重构、评审前端 UI（React/TSX + CSS）、把 Figma 设计落成代码、在 Figma 里用 VibeMe 组件搭页面、查询 VibeMe 的设计 token（颜色/字体/间距/圆角/阴影）取值、或确认某个组件（Button、Input、Select、Table、Modal、Drawer、Tabs、Tag 等 48 个组件集 / 334 个变体）有哪些 props、变体与状态时使用。包含逐组件规格、169 个 token 的 Figma 变量与 CSS 变量对照、以及可复制的 React + CSS 参考实现。不要用于非 VibeMe 的产品；没有 VibeMe 设计稿时也不要凭它发明一套新组件体系。
license: MIT
metadata:
  owner: VibeMe
  figmaFileKey: ZO4WH3sbVCj7lZIFMpiwV9
  figmaPage: "56054:5521"
  componentSets: 48
  variants: 334
  tokens: 169
---

# VibeMe 设计系统

**这份 skill 是 VibeMe 组件库的真源副本**：48 个组件集 / 334 个变体 / 169 个设计 token / 19 个文字样式，
覆盖「设计怎么做」和「代码怎么落」两侧，两边共用同一套命名。

真源是 Figma 文件 `ZO4WH3sbVCj7lZIFMpiwV9` 的页面 [`56054:5521`「全局」总组件库](https://www.figma.com/design/ZO4WH3sbVCj7lZIFMpiwV9/VibeMe-App---Web-Design-%E5%A4%87%E4%BB%BD?node-id=56054-5521)。
**能访问 Figma MCP 时以 Figma 实时数据为准**；不能访问时（例如只有代码仓库的开发同学），本目录的快照就是权威。

## 一、先判断你在做哪件事

| 你要做的事 | 按顺序读 |
|---|---|
| 写/改 VibeMe 前端 UI（React、CSS、任意框架） | [references/foundations.md](references/foundations.md) → [references/components.md](references/components.md) → 对应组件的 `references/components/<slug>.md` → [components/](components/) 里的参考实现 |
| 在 Figma 里设计或修改 VibeMe 页面 | [references/figma-design.md](references/figma-design.md) + [references/foundations.md](references/foundations.md) |
| 评审：对齐设计稿与代码、查漂移 | [references/implementation.md](references/implementation.md) + 涉及组件的规格文档 |
| 只要 token 取值（颜色/间距/圆角/字号/阴影） | [references/tokens.md](references/tokens.md)（人读）或 [data/tokens.json](data/tokens.json)（机器读） |
| 组合页面（首页、列表页、表单页、详情页…） | [references/patterns.md](references/patterns.md) |
| 用现成代码 | [components/](components/)：`tokens.css` + 每个组件一个目录，零第三方依赖 |
| 看组件长什么样 | [assets/previews/](assets/previews/)（每个组件集一张图） |
| Figma 改了，要刷新快照 | [`../tools/REFRESH.md`](../tools/REFRESH.md)（仓库级维护手册，不随 skill 一起安装） |

## 二、硬规则（违反就是错，细节见 foundations.md）

1. **字体只有 Poppins**（中文回退 PingFang SC / Microsoft YaHei），用 `var(--vm-font-family)` 或 `.vm-type-*`。
2. **品牌色只有 `--vm-brand` = #FFCC90**；**禁止引入橙色系**。
3. **只有深色一套主题**：`--vm-bg-app` / `--vm-bg-panel` / `--vm-bg-card`；文件里没有 light 模式。
4. **颜色、圆角、间距、字号、阴影一律引 token**（`var(--vm-*)`），不硬编码。
5. **状态不另造实体色**：填充类组件 hover = 底色 + `--vm-white-7`、pressed = 底色 + `--vm-white-6`；
   输入/导航类组件按 Figma 事实**换描边**（hover `--vm-white-4`、focus `--vm-border-selected` + 2px）。
   disabled 一律 `opacity: var(--vm-opacity-disabled)`（0.38），底色/描边/文字色都不换。
   **两种手法在同一个体系里并存，以 `references/components/<slug>.md` 记录的事实为准，不要互相套用。**
6. **交互态不做 prop**：`hover` / `pressed` / `focus` 用 CSS 伪类；`disabled` / `error` / `open` / `checked` / `selected` 才是 prop。
7. **用真实语义元素**（`button` / `input` / `select` / `dialog` / `table`…），不要把 `div` 样式化成控件。
8. **优先用语义 token**（`--vm-bg-card`、`--vm-text-secondary`、`--vm-radius-button`），
   语义缺失时才用原始层（`--vm-neutral-750`、`--vm-space-4`）并在文档里说明理由。
9. **`VibeMe AI / *` 是另一套主题**（紫 `#8547FF` / 粉 `#FF57AD` / 底色 `#080A11`，token 前缀 `--vm-ai-`），
   **不要与主库的中性 + 砂色体系混用**；`references/tokens.md` 末尾列出的**历史遗留变量一律不要引用**。

## 三、最小工作流（agent 照这个做）

1. **定位组件**：在 [references/components.md](references/components.md) 里按中文/英文名找，
   拿到 slug、Figma 属性轴、默认尺寸、以及它内嵌了哪些其他组件。
2. **读规格**：打开 `references/components/<slug>.md`。它给出：每个变体的真实尺寸与绑定变量、
   结构树、该组件用到的全部 token（Figma 变量 ↔ CSS 变量 ↔ 值）。
3. **取 token**：只从 [components/tokens.css](components/tokens.css) 里取；需要取值含义时查 [references/tokens.md](references/tokens.md)。
4. **复用实现**：`components/<Pascal>/` 下有 `.tsx` + `.css` + `index.ts`，零依赖、可直接拷进项目；
   拷贝后把 `import './tokens.css'` 指到你自己项目里的 token 文件即可。
5. **落代码时把 Figma 变体映射成 props**：属性值小写当枚举（`Type=primary` → `type="primary"`）；
   TEXT 属性（`label`/`placeholder`/`value`/`initial`/`count`）是内容插槽，不是枚举。
6. **自检**：跑 `python3 tools/validate.py --slug <slug>`；不要硬编码色值，不要漏掉 `disabled`/`focus` 态。

## 四、设计同学怎么用

- **不打开 Figma 也能看组件长什么样**：`assets/previews/` 里每个组件集一张预览图。
- **取值**：`references/tokens.md` 是完整 token 表（含每个变量的解析值与别名关系）；
  组件级的「该用哪个 token」写在对应的 `references/components/<slug>.md`。
- **要改设计**：先看 [references/figma-design.md](references/figma-design.md) 的工作流 —— 用真实组件实例与绑定变量搭页面，
  不要把 UI 拍平成图片或画成相似但独立的 frame。
- **发现不一致**：先确认 Figma 是唯一真源，然后按 [`../tools/REFRESH.md`](../tools/REFRESH.md) 刷新快照，而不是改文档里的数字。

## 五、边界与免责

- 只适用于 VibeMe 产品线；其他产品的设计系统请勿套用本 skill 的 token 与组件命名。
- 页面 `56054:5521` 上除了这 48 个组件集，还有团队成员自己的试验 frame（`Button`、`Home`、`CreateMV`、`Modal_*` 等），
  它们**不属于**本组件库，不要当成组件集引用。
- 组件预览图是从 Figma 导出的渲染图，仅供文档展示；像素级还原请回到 Figma 原件。
- 内容可能滞后于 Figma。判定优先级：**Figma 实时数据 > 本目录快照**。
