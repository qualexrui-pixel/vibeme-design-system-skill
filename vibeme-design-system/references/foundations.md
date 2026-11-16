# 设计基础（Foundations）

这份文件是**人写的不变量**：什么时候用哪个 token、哪些做法禁止。
**取值一律以 [tokens.md](tokens.md) 为准**（那是从 Figma 自动生成的完整表），本文件不重复罗列取值，只讲规则与选择依据。

---

## 1. 五条硬规则

1. **字体只有 Poppins**，中文回退 `PingFang SC` / `Microsoft YaHei`。
   用 `var(--vm-font-family)` 或 `.vm-type-*` 工具类，**不要**手写 `font-family`，不要用 Inter / MiSans / Roboto。
2. **品牌色只有 `--vm-brand` = `#FFCC90`**（hover `--vm-brand-hover`，禁用 `--vm-brand-disable`）。
   **禁止引入橙色系**（#FF6E20 之类的橙不属于这套体系）。
3. **只有深色一套主题**。页面底 `--vm-bg-app`、面板 `--vm-bg-panel`、卡片 `--vm-bg-card`。
   文件里的变量都只有一个 mode，没有 light/dark 切换；不要自行发明浅色变体。
4. **颜色 / 圆角 / 间距 / 字号 / 阴影一律引 token**，不许硬编码值。
   CSS 用 `var(--vm-*)`；代码里没有 CSS 变量的场合（Canvas、原生端）读 `data/tokens.json` 里的 `cssValue`。
5. **状态不另造实体色，按 Figma 记录的两种手法之一**（**具体到某组件时，以它的
   `references/components/<slug>.md`「各变体的事实」为准** —— 那是从 Figma 导出的原始绑定）：
   - **填充叠加**（Button、Card、MenuItem、List…）：hover = 底色 + `--vm-white-7`（8% 白），
     pressed = 底色 + `--vm-white-6`（12% 白），底色变量本身不变；
   - **前景/描边换 token**（Input、Search、Select、Tabs…）：hover 把描边从 `--vm-border-default`（12% 白）
     换成 `--vm-white-4`（30% 白）；focus 用 `--vm-border-selected`（50% 白）+ `--vm-border-width-thick`（2px）+ ring。
   disabled 两种手法下都一样：只加 `opacity: var(--vm-opacity-disabled)`（0.38），
   **不换**底色、描边与文字色。

> 证据：Button 的 `State=hover` 变体是同一填充栈上追加 `White/White-7`；而 Input 的 `State=hover` 变体
> `fills` 只改了描边（`White/White-4`），没有任何叠加层。**同一个设计体系里这两种手法并存，不要互相套用。**

## 2. token 分两层，组件只用第二层

| 层 | 例子 | 什么时候用 |
|---|---|---|
| **Primitive（原始值）** | `--vm-neutral-750`、`--vm-white-7`、`--vm-space-4`、`--vm-radius-lg`、`--vm-brand` | 只在语义 token 缺失、且需要在文档里说明理由时使用 |
| **Semantic（语义）** | `--vm-bg-card`、`--vm-text-secondary`、`--vm-border-default`、`--vm-radius-button`、`--vm-padding-card-md`、`--vm-status-error` | **组件实现与页面都优先用这一层** |

判断口诀：**这个值描述的是「长什么样」还是「干什么用」？** 描述用途的（卡片底、次要文字、按钮圆角）就是语义 token。

语义 token 在 Figma 里本身就是别名（`VARIABLE_ALIAS`），tokens.md 里用 `→ 目标` 标出，落地时已解析成最终值。

## 3. 颜色怎么选

| 场景 | token |
|---|---|
| 页面底 / 面板 / 卡片 / 浮层 | `--vm-bg-app` / `--vm-bg-panel` / `--vm-bg-card` / `--vm-bg-toast` |
| 悬停 / 选中 / 按下的**实体**表面 | `--vm-surface-hover` / `--vm-surface-selected` / `--vm-surface-pressed` |
| 默认描边 / 聚焦描边 | `--vm-border-default`（12% 白） / `--vm-border-selected`（50% 白） |
| 正文 / 次要 / 三级 / 禁用文字 | `--vm-text-primary` / `--vm-text-secondary` / `--vm-text-tertiary` / `--vm-text-disable` |
| 可点文字（链接、动作） | `--vm-text-action` = 品牌色 |
| 成功 / 错误 / 警告 / 信息 | `--vm-status-success` / `--vm-status-error` / `--vm-status-warning` / `--vm-status-info` |
| 弹窗遮罩 | `--vm-scrim-modal`（#000 @56%） |

- **文字对比度**：正文用 `--vm-text-primary`（92% 白）在 `--vm-bg-app` 上约 15:1；`--vm-text-secondary`（64%）约 8:1；
  `--vm-text-tertiary`（30%）**只用于非关键信息**（时间戳、辅助说明），不要用在需要阅读的正文上。
- **状态色不等于文字色**：`--vm-status-error` 是给图标、描边、填充用的；红底上的文字仍用 `--vm-text-primary`。
- **不要用颜色单独表达状态**（错误/成功要同时有图标或文案）。

## 4. 间距与内边距

- 间距阶梯是 4 的倍数：`--vm-space-1` 4 / `-2` 8 / `-3` 12 / `-4` 16 / `-5` 20 / `-6` 24 / `-8` 32 / `-10` 40 / `-12` 48 / `-16` 64，
  另有半档 `--vm-space-0-5` 2 / `--vm-space-1-5` 6 / `--vm-space-2-5` 10。
- **组件内边距走 `--vm-padding-*`**（按组件语义命名）：`padding-button-{sm|md|lg}-{x|y}`、`padding-input-{x|y}`、
  `padding-card-{sm|md|lg}`、`padding-modal-{x|y}`、`padding-badge-{x|y}`、`padding-toast-{x|y}`、`padding-popover`。
- 组件之间的**外部**间距用 `--vm-space-*`；组件**内部**用 `--vm-padding-*`。不要在组件内部硬编码 16px。

## 5. 圆角

| 用途 | token | 值 |
|---|---|---|
| 按钮 / 输入框 / 卡片 / Toast | `--vm-radius-button`｜`--vm-radius-input`｜`--vm-radius-card`｜`--vm-radius-toast` | 12px |
| 标签 | `--vm-radius-badge` | 4px |
| 头像 / 开关 / 进度条 / 胶囊 | `--vm-radius-avatar` | 999px |
| 需要其他档位时 | `--vm-radius-{none,xs,sm,md,lg,xl,2xl,3xl,full}` | 0/4/6/8/12/16/24/32/999 |

⚠️ **文件里另有一个旧版胶囊按钮组件（圆角 999、蓝底、MiSans）**，不要照它写代码。本库按钮圆角是 12px。

## 6. 海拔与动效

- 阴影用 `--vm-elevation-1` … `--vm-elevation-4`：卡片/输入浮层用 1；通知、Popover 用 2–3；Modal、Drawer 用 4。
  不要自己拼 `box-shadow`。
- 动效时长：`--vm-duration-fast` 100ms（hover/pressed 反馈）、`--vm-duration-normal` 200ms（展开/收起）、
  `--vm-duration-slow` 300ms（Modal/Drawer 进出）。
- **Figma 没有定义缓动曲线**，实现里统一用 `ease-out`（进场）/ `ease-in`（退场），并在同一产品里保持一致。
- 必须尊重 `@media (prefers-reduced-motion: reduce)`：把时长降到 0 或改成透明度切换。

## 7. 布局与栅格

- 容器宽度是**最大宽度档位**，不是固定视口宽：`Container` 的 narrow/default/wide/full = 720 / 1200 / 1440 / 1560。
  小屏时保留页面左右留白，不要横向溢出。
- Figma 里定义了 4 套栅格样式（4 列 16 gutter、4 列宽松 16/16、12 列 32/16、12 列 32/20），
  取值见 [tokens.md](tokens.md) 的「栅格样式」一节。落地时映射到你所用框架的断点系统，不要照抄固定列宽。
- 表格允许横向滚动或切换到窄屏布局，**不要静默丢列**。

## 8. 无障碍底线

- 所有可交互元素：键盘可达、`Enter`/`Space`/方向键/`Esc` 行为符合平台惯例，焦点不逃出 Modal/Drawer。
- 焦点可见：用 `--vm-border-selected` 描边 + `--vm-focus-ring-width`（2px），不要 `outline: none` 了事。
- 图标按钮必须有可访问名称（`aria-label` 或可见文字），图标本身 `aria-hidden="true"`。
- 触控目标：视觉可以紧凑，但可点区域不小于 40×40（时间紧时至少 32×32 且四周有留白）。
- 表单：持久 label、错误用 `aria-invalid` + 文本说明关联（不要只靠红框）。
- 加载/结果变化用合适的 live region 播报，避免刷屏；纯装饰的骨架屏对辅助技术隐藏。

## 9. 和 Figma / 代码的对应关系

| 概念 | Figma | 代码 |
|---|---|---|
| 变体属性 | `Type` / `Size` / `State` / `Tone` … | props（值一律小写） |
| 交互态变体 | `State=hover` / `pressed` / `focus` | CSS 伪类 `:hover` / `:active` / `:focus-visible`，**不做成 prop** |
| 应用态变体 | `State=disabled` / `error` / `open`、`Checked` / `Selected` | props：`disabled` / `error` / `open` / `checked` / `selected` |
| 文本属性 | `label` / `placeholder` / `value` / `initial` / `count` | 内容插槽（children 或对应 prop），不是枚举 |
| 变量 | Variables | `var(--vm-*)` |
| 文字样式 | Text Styles | `.vm-type-*` 工具类 |
| 效果样式 | Effect Styles | `--vm-elevation-*` |

完整映射见 `references/components/<组件>.md`；索引见 [components.md](components.md)。

## 10. 这套 token 从哪来、怎么刷新

- 真源是 Figma 文件 `ZO4WH3sbVCj7lZIFMpiwV9` 的页面 `56054:5521`（「全局」总组件库）。
- `tools/gen-tokens.py` 读 `data/figma-export/{variables,styles}.json` 生成 `tokens.css` / `tokens.json` / `tokens.md`；
  命名规则集中在 `tools/token-map.json`。
- 刷新流程与校验见 `tools/REFRESH.md`。**改了 Figma 就重跑生成器**，不要手改生成物。
- 有 Figma MCP 的环境里，以 Figma 实时数据为准；没有 Figma 的环境里，本目录的文档就是权威。
