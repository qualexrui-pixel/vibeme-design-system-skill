# VibeMe 设计组件库 · AI Skill

把 VibeMe 的整套设计组件库打包成一个 **skill**，DeepSeek Harness（DSH）与 OpenAI Codex 都能直接调用：
设计同学用它查规格与取值，开发同学用它把设计稿落成代码。

- **48 个组件集 / 334 个变体** —— 全部逐组件写清 props 映射、变体事实、结构树、绑定 token、用法与坑
- **169 个设计 token** —— 颜色 / 间距 / 圆角 / 字号 / 阴影，Figma 变量名与 CSS 变量名一一对照
- **48 份 React + CSS 参考实现** —— 零第三方依赖，只吃 CSS 变量，可直接拷进项目
- **48 张组件预览图** —— 不打开 Figma 也能看组件长什么样
- **可校验、可刷新** —— 生成器 + 校验脚本 + 三层验证（类型检查 / SSR 渲染 / 真机计算样式），Figma 改了能重新同步，不靠手抄

真源是 Figma 文件 [`ZO4WH3sbVCj7lZIFMpiwV9`](https://www.figma.com/design/ZO4WH3sbVCj7lZIFMpiwV9/VibeMe-App---Web-Design-%E5%A4%87%E4%BB%BD?node-id=56054-5521)
的页面「全局」总组件库（node `56054:5521`）。**能访问 Figma 时以实时数据为准**，本仓库是它的可离线快照。

---

## 30 秒安装

```bash
mkdir -p ~/.agents/skills
cp -R vibeme-design-system ~/.agents/skills/
```

`~/.agents/skills/` 是 DSH 与 Codex **共同扫描**的用户级目录，装一次两边都能用。
项目级安装、`~/.dsh/skills` 与 `~/.codex/skills` 的差异、验证与卸载：见 **[INSTALL.md](INSTALL.md)**。

## 怎么用

装好之后直接对 agent 说人话就行，它会自己按 description 选中这个 skill：

| 场景 | 可以这样说 |
|---|---|
| 开发 | 「用 VibeMe 组件库把这个设计稿实现成 React 页面，只用现有组件和 token」 |
| 查规格 | 「VibeMe 的 Switch 有哪些尺寸和状态？绑定的是哪些 token？」 |
| 评审 | 「对一下这个页面的按钮和卡片，跟 VibeMe 组件库有没有漂移」 |
| 设计 | 「在 Figma 里用 VibeMe 组件搭一个设置弹窗，用真实组件实例」 |
| 取 token | 「VibeMe 的次要文字色、卡片底色、按钮圆角分别是什么值？」 |

显式调用：Codex 里输入 `$vibeme-design-system`（或 `/skills` 选择）；DSH 会话里 skill 会自动出现在可用列表中。

## 仓库结构

```text
设计组件库/
├── INSTALL.md                  # 安装、验证、卸载
├── LICENSE
├── vibeme-design-system/       # ← 这个目录就是 skill 本体，复制到 skills 根目录即可
│   ├── SKILL.md                # agent 入口：路由 + 硬规则 + 最小工作流
│   ├── agents/openai.yaml      # Codex 界面元数据（可选）
│   ├── references/
│   │   ├── foundations.md      # 人写的设计不变量（字体/品牌色/状态手法/间距/圆角/海拔/无障碍）
│   │   ├── tokens.md           # 生成：169 个 token 完整表 + 19 个文字样式 + 栅格
│   │   ├── components.md       # 生成：48 个组件索引（属性轴 = 代码 props）
│   │   ├── components/*.md     # 每个组件一份：变体事实 + 结构树 + token + 用法 + 坑
│   │   ├── patterns.md         # 页面级组合模式
│   │   ├── figma-design.md     # 在 Figma 里做设计的工作流
│   │   └── implementation.md   # 写代码 / 评审的通用规范
│   ├── components/             # 参考实现（React TSX + CSS）
│   │   ├── tokens.css          # 生成：CSS 变量 + .vm-type-* 文字样式类
│   │   ├── index.ts            # 生成：桶文件
│   │   └── <Name>/             # 每个组件：<Name>.tsx / <Name>.css / index.ts
│   ├── assets/previews/*.png   # 48 张组件预览图
│   └── data/                   # 机器可读：组件索引、token 表、Figma 原始导出
└── tools/                      # 生成器、校验器、维护手册（不会被 skill 加载）
```

## 内容长什么样

每个组件的规格文档里，**事实部分由脚本从 Figma 导出生成**，讲解部分由人写，两者用标记分开、互不覆盖：

- `## 概览` / `## 变体与属性` / `## 各变体的事实` —— 每个变体的真实尺寸、填充栈、描边、圆角、内边距、不透明度，
  以及每一项绑定的是哪个 Figma 变量（含解析后的值）
- `## 结构（默认变体）` —— 从 Figma 导出的层级树，标了 Auto Layout、尺寸、token 与内嵌实例
- `## 设计 token` —— 该组件用到的全部变量，Figma 名 ↔ CSS 变量 ↔ 值
- `## 交互与状态` / `## 代码用法` / `## 可访问性` / `## 不要这样做` / `## 相关组件` —— 人写的实操说明

代码侧的重点约定（完整规则见 [references/implementation.md](vibeme-design-system/references/implementation.md)）：

- Figma 的 **VARIANT 属性 = 代码里的 prop**，取值小写；`label`/`placeholder` 这类 **TEXT 属性是内容插槽**，不是枚举；
- **交互态不做 prop**：hover / pressed / focus 用 `:hover` / `:active` / `:focus-visible`；
  `disabled` / `error` / `open` / `checked` / `selected` 才是 prop；
- 颜色、圆角、间距、字号、阴影**全部走 CSS 变量**，校验脚本会拦下硬编码色值；
- 用真实语义元素（`button` / `input` / `select` / `dialog` / `table`…），零第三方依赖。

## 维护

```bash
python3 tools/gen-tokens.py        # 由 Figma 变量/样式导出 → tokens.css / tokens.json / tokens.md
python3 tools/gen-component-docs.py --all      # 由 Figma 组件导出 → 每个组件的规格文档事实段
python3 tools/gen-component-docs.py --index --barrel
python3 tools/validate.py          # 全量一致性校验（索引/文档/代码/预览图/导出五处对齐）
python3 tools/gen-tokens.py --check            # 生成物是否与真源一致
```

- **刷新流程（Figma 改动后怎么同步）**：[tools/REFRESH.md](tools/REFRESH.md)
- **写文档与实现的规范**：[tools/AUTHORING-CONVENTIONS.md](tools/AUTHORING-CONVENTIONS.md)
- **单个组件的标准作业书（给 agent 用）**：[tools/COMPONENT-AGENT-PROMPT.md](tools/COMPONENT-AGENT-PROMPT.md)
- **Figma 导出器用法与坑**：[tools/figma-extract.md](tools/figma-extract.md)
- **安装机制调研（DSH/Codex 各自的 skill 目录与 frontmatter 规则）**：[tools/INSTALL-RESEARCH.md](tools/INSTALL-RESEARCH.md)

## 验证

静态校验之外，参考实现还过了三层真实验证（方法与命令见 [tools/verify-implementations.md](tools/verify-implementations.md)）：

| 层 | 工具 | 结果 |
|---|---|---|
| 类型检查 | TypeScript `tsc`（strict） | 48 个组件 **0 error** |
| 渲染冒烟 | `react-dom/server`，每个组件真渲染一次 | **49/49 渲染成功**（含 `SidebarItem` 子组件），0 崩溃 |
| 计算样式审计 | `puppeteer-core` + 本机 Chrome | **45/45 断言通过**（尺寸 / 圆角 / 填充 / 描边 / hover 叠加层 / focus ring / disabled 不透明度），另有 49 个导出 × 93 个实例的全量扫描 |

审计报告与过程中发现并修掉的问题（含一个 `:hover` 压过 `:focus-visible` 的优先级 bug、4 个组件的必填 prop 崩溃）记录在
[tools/style-audit-report.md](tools/style-audit-report.md)。

## 已知限制

- **快照会过期**：Figma 是唯一真源，本仓库是某个时间点的导出。判定优先级：Figma 实时数据 > 本仓库文档。
- **`VibeMe AI / *` 是另一套主题**（紫 `#8547FF` / 粉 `#FF57AD` / 底色 `#080A11`，CSS 变量前缀 `--vm-ai-`），
  不要与主库的中性 + 砂色体系混用。
- **历史遗留变量不要引用**：`主色/Main Orange`（命名错误，值其实是品牌砂色）、`后台主色`、`Color 3/4`、
  `Text/灰/*`、`按钮`、`分割线` 等 22 个，清单见 [references/tokens.md](vibeme-design-system/references/tokens.md) 末尾。
- **3 个文字样式的名字与真实字重不符**：`Heading/Body/L/Medium`、`Heading/Body/M/Medium`、
  `Heading/Body/S/SemiBold` 实际都是 Regular，`tokens.md` 里已标注。
- **参考实现不是 npm 包**：`components/` 是「可直接复制进项目」的参考实现，没有打包配置、没有依赖管理，
  也不包含 Figma Code Connect 映射。需要 Dev Mode 里显示代码片段另见 `SKILL.md` 的说明。
- **`VibeMe AI / *` 的 5 个组件**只做了规格与实现，没有单独的深色/浅色主题切换 —— 因为 Figma 里这套变量只有 `Dark` 一个 mode。

## 许可

[MIT](LICENSE)。设计 token 与组件规格的事实来源是 VibeMe 的 Figma 设计文件；预览图为该文件的渲染导出，仅用于文档展示；
字体 Poppins 采用 SIL Open Font License 1.1。
