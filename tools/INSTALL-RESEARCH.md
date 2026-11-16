# Skill 安装调研：怎样装一个目录，让 DSH 和 Codex 都能发现并调用

> **一句话结论**：把 skill 放成 **`<root>/.agents/skills/<name>/SKILL.md`** —— 用户级用 `~/.agents/skills/`，项目级用仓库根（或任意祖先目录）的 `.agents/skills/`。这是 DeepSeek Harness 与 OpenAI Codex **双方共同扫描的唯一目录**，其余路径都只有一边认。

---

## 0. 调研范围与被验证的版本

| 项 | 值 | 证据 |
|---|---|---|
| DeepSeek Harness CLI | `@deepseek-ai/dsh` **0.2.2-rc.3**（Desktop / profile `desktop`） | `app.asar/dsh/node_modules/@deepseek-ai/dsh/package.json` |
| DSH skill 相关包 | `dsh-skill` / `dsh-skill-filesystem` / `dsh-tool-skill` 均 0.2.2-rc.3 | 同目录各 `package.json` |
| OpenAI Codex CLI | `codex-cli 0.167.0-alpha.3.2` | `/Applications/ChatGPT.app/Contents/Resources/codex-cli/CodexCLI.app/Contents/MacOS/codex --version` |
| Codex 内置 skill 包 | `.system/skill-creator`（含 openai.yaml 规范与校验脚本） | `~/.codex/skills/.system/skill-creator/` |
| 调研时间 | 2026-11-16 | — |

**DSH 安装根**：`/Applications/DeepSeek Harness.app/Contents/Resources/app.asar/dsh/node_modules/@deepseek-ai/`
（下文简写为 `<DSH>/`。注意：app.asar 内 `ls`/`cat`/`grep`/`node` 均不可用，本文所有 DSH 源码引用均通过宿主 file-read 工具或 `ELECTRON_RUN_AS_NODE=1 "$DSH_NODE_EXECUTABLE"` 读取。）

**证据等级标注**：`【源码】`= 读实现；`【官方文档】`= 安装包内/官网文档；`【实测】`= 本次真机跑出来的行为；`【第三方】`= 非官方来源，仅作参考。

---

## 1. DeepSeek Harness（DSH）

### 1.1 发现路径与优先级

DSH 的本地 provider 按 **rank 升序**扫描下列根目录，rank 数字小者优先：

| Rank | source | 根目录 | 说明 |
|---|---|---|---|
| 100 | `project-dsh` | `<projectRoot>/.dsh/skills` | 项目级（DSH 私有） |
| 200 | `project-agents` | `<projectRoot>/.agents/skills` | 项目级（跨 agent 工具共享） |
| 300 | `custom` | `Config.customSkillDirs`（用户配置的额外根） | 需显式配置 |
| 400 | `user-dsh` | `<dshHome>/skills`，默认 `~/.dsh/skills` | 用户级（DSH 私有）；**跳过其下的 `.system` 子目录** |
| 500 | `user-agents` | `<agentsHome>/skills`，默认 `~/.agents/skills` | 用户级（跨 agent 工具共享） |
| 600 | `bundled` | `Config.bundledSkillDir` / `$DSH_BUNDLED_SKILL_DIR` | 随发行版附带的 skill |

【源码】`<DSH>/dsh-skill-filesystem/src/index.ts:35-39`（rank 常量）与 `:251-271`（`roots()` 组装顺序）
【官方文档】`<DSH>/dsh/docs/subsystems/skills.md:64-77`（"Local discovery priority" 表，与源码一致）

**关键规则（均有源码依据）**

- **projectRoot 的定义**：从 cwd 向上找**最近一个含 `.git` 的祖先目录**；一路到根都没有 `.git` 时，**直接用 cwd 本身**作为 projectRoot。
  【源码】`dsh-skill-filesystem/src/index.ts:959-969`（`findProjectRoot`）
  【官方文档】`docs/subsystems/skills.md:77`："The project root is the nearest ancestor containing `.git`; without one, the current cwd is used."
- **项目级只扫 projectRoot 一处**，不会逐层向上收集中间目录的 `.agents/skills`（这点与 Codex 不同，见 §2.1）。
- **家目录解析优先级**：显式配置 > `$DSH_HOME` > `~/.dsh`；`$DSH_AGENTS_HOME` > `~/.agents`。
  【源码】`<DSH>/dsh-home-paths/src/index.ts:12-27, 127-148`
- **覆盖规则分两层**：
  1. **层（layer）优先**：注册表是"全局层 + 每个 scope 层"的分层结构。读取时合并全局层与当前 viewing scope 的链，**最近的层直接压过重名 skill**。
  2. **层内才看 rank**：同一层内重名按 `rank` → provider 注册顺序 → 本地顺序决定胜者。
  【官方文档】`docs/subsystems/skills.md:13`、`:270`
  【官方文档】`docs/subsystems/skills.md:147`（`SkillCandidate.rank` 的 JSDoc："Lower ranks win duplicate skill names before provider registration order is considered."）
- **平级同名不合并**：DSH 择一胜出（与 Codex 的"两个都出现"相反）。
- 某个根读取失败时不产生候选，**低优先级的同名 skill 会顶上来**（直到该根恢复）。
  【官方文档】`docs/subsystems/skills.md:77`

### 1.2 SKILL.md frontmatter 规范

**必填字段**

| 字段 | 约束 |
|---|---|
| `name` | 非空字符串，且必须匹配 kebab-case 正则 `^[a-z0-9]+(?:-[a-z0-9]+)*$` |
| `description` | 非空字符串 |

缺任一字段、name 不合法、YAML 解析失败、或首行不是 `---` → **该 skill 被整条忽略并记一条 warn 日志**。
【源码】`dsh-skill-filesystem/src/index.ts:811-854`（`parseSkillFile`：`:824-837` 是上述判断）
【源码】`<DSH>/dsh-skill/src/index.ts:21`（`const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/`）

**可选字段**

| 字段 | 类型 | 作用 |
|---|---|---|
| `whenToUse` | 非空字符串 | 额外路由提示（`SkillSummary.whenToUse`） |
| `disable-model-invocation` | 布尔 | `true` → 不进模型目录（`modelInvocable=false`），只能被用户/受信调用方加载 |
| `user-invocable` | 布尔 | `false` → 不进人类命令目录 |
| `metadata` | 对象 | provider 自定义元数据，原样透传 |

【源码】`dsh-skill-filesystem/src/index.ts:1014-1024`（`parseInvocationPolicy`）、`:1053-1059`（`optionalMetadata`）、`:848`（`whenToUse`）
【官方文档】`docs/subsystems/skills.md:128`（两个 kebab-case key，省略默认 `true`）

- **布尔值宽容**：接受 `true/false`、`1/0`、`"yes"/"no"/"on"/"off"` 等；其他值抛错 → skill 被忽略。
  【源码】`dsh-skill-filesystem/src/index.ts:1032-1051`
- **旧键名会被硬拒绝**：`disableModelInvocation`、`modelInvocable`、`userInvocable` 出现即报错。
  【源码】`dsh-skill-filesystem/src/index.ts:1014-1030`
- **未识别的额外 key 不会导致失败** —— 解析器只挑它认识的字段，其余忽略（但只有 `metadata` 会被保留）。
  【源码】`dsh-skill-filesystem/src/index.ts:845-853`

**名称是否必须与目录名一致？—— 不需要。**

目录名只用于"去哪里找文件"，catalog 里的 skill 身份完全来自 frontmatter 的 `name`。
【源码】`dsh-skill-filesystem/src/index.ts:737-765`：`discoverRoot()` 只用 `entry.name` 做排序和 `.md` 判断，`{ path: join(entry.path, 'SKILL.md'), ... }` 作为 locator；候选的 `name` 取自 `parsed.name`。
【实测】本次在 `~/.agents/skills/dir-mismatch/SKILL.md` 写入 `name: probe-dsh-mismatch`，会话 catalog 里出现的是 **`probe-dsh-mismatch`**（目录名 `dir-mismatch` 未出现）。

**是否允许中文 description？—— 允许。**

`stringField()` 只要求"是字符串且长度 > 0"，没有任何字符集限制；YAML 本身是 UTF-8。
【源码】`dsh-skill-filesystem/src/index.ts:1004-1007`
【实测】`~/.dsh/skills/vibeme-design-system/SKILL.md:3` 就是中文 description，且它确实出现在本会话 catalog 中。

**字符数限制**

- **解析层没有长度上限**（`description` 只校验非空）。
  【源码】`dsh-skill-filesystem/src/index.ts:1004-1007`
- **渲染层会截断**：写进会话 catalog 的 description 会被归一化并截到 `catalogDescriptionMaxLength`，**默认 500**，最小值 3；超长时截成 `前(N-3)字符 + "..."`。
  【源码】`<DSH>/dsh-tool-skill/src/index.ts:28`（`const DEFAULT_CATALOG_DESCRIPTION_MAX_LENGTH = 500`）
  【源码】`dsh-tool-skill/src/index.ts:81-82, 411-413`
  【官方文档】`docs/subsystems/skills.md:229`

**frontmatter 解析细节**：必须首行正好是 `---`，随后以单独一行 `---` 结束；中间是 YAML 映射（非映射则忽略）。body 会 `trim()` 后作为指令正文。
【源码】`dsh-skill-filesystem/src/index.ts:931-957`、`:852`

### 1.3 加载机制

**按需 + 会话级摘要，两者都有：**

1. **首次注入摘要（catalog）**：`dsh-tool-skill` 在 live session 的**第一个 `agent/pre-step`** 注入一条 durable 的 user-role `<system-reminder>`，里面是排序后的 `name` + 归一化（XML 转义）后的 `description`。
   **只含 name 和 description** —— 不含 body、路径、source、provider、`whenToUse`。
   【官方文档】`docs/subsystems/skills.md:229`："The catalog contains sorted skill `name` and normalized, XML-escaped `description` only; it omits bodies, paths, sources, providers, and routing hints."
   【实测】本会话的 `<available_skills>` 块即为该 catalog，条目只有 name 和中文 description。
2. **目录变更时替换**：每个后续 step 会比较最新可见 catalog，有变化就追加一条 durable replacement；全部删除会追加一条显式空 replacement；compaction 把历史 catalog 都藏掉时，下一次观测会重建。
   【官方文档】`docs/subsystems/skills.md:231`
3. **正文按需加载**：模型调用 `skill({ name })` 时才 `ctx.skills.get()`，返回 `<skill_content name="...">` + `<skill_resources>` + `<skill_instructions>`。**registry 不缓存完整定义**，每次 get 都重读文件。
   【官方文档】`docs/subsystems/skills.md:192, 233`
   【源码】`dsh-skill/src/index.ts:170-183`（`renderSkillContent`）

**references/ 子目录会被自动发现吗？—— 不会。**

- 发现逻辑只认两种条目：目录下的 `SKILL.md`，或根本身下的 `<name>.md` 平铺文件。
  【源码】`dsh-skill-filesystem/src/index.ts:737-765`
- **不支持嵌套递归 `**/SKILL.md`**。
  【官方文档】`docs/subsystems/skills.md:85`："The local provider accepts directory bundles (`<name>/SKILL.md`) and flat Markdown files (`<name>.md`). Nested recursive `**/SKILL.md` discovery is not supported."
- watcher 也只订阅深度 1，且只把 `<root>/<entry>/SKILL.md` 视为目录型 skill 的变更。
  【源码】`dsh-skill-filesystem/src/index.ts:497-512`（`depth: 1`）、`:676-702`（`isRelevantWatchEvent` / `isPotentialSkillPath`）
- `references/` 的作用是**被 body 显式引用后按需读取**：加载时 `resourceBase = { kind: 'directory', path: locator.directory }`，工具结果里提示"Base directory for this skill: …；Resolve relative paths mentioned by this skill against the base directory"，且**不会枚举目录内容**。
  【源码】`dsh-skill-filesystem/src/index.ts:227`、`dsh-skill/src/index.ts:193-198`
  【官方文档】`docs/subsystems/skills.md:233`："`resourceBase` resolves explicitly referenced scripts, references, and assets only as needed; the loaded result does not enumerate a skill directory."

**热更新**：Chokidar 监听已存在的根，新增/删除/改动会通过 `skills/change` 让 catalog 失效并重发。
【官方文档】`docs/subsystems/skills.md:81`；【源码】`dsh-skill-filesystem/src/index.ts:497-573`

### 1.4 DSH 侧实测记录（本次真机）

在 `~/.agents/skills/` 下放置 4 个探针，本会话 catalog 的变化：

| 探针 | 布局 | catalog 结果 | 结论 |
|---|---|---|---|
| `probe-dsh-mismatch` | `dir-mismatch/SKILL.md` | **出现** | 目录名 ≠ frontmatter name 可以 |
| `probe-dsh-flat` | `probe-dsh-flat.md`（平铺） | **出现** | 平铺 `<name>.md` 可用 |
| `probe-dsh-nested` | `nested-outer/sub/SKILL.md` | **未出现** | 嵌套两层不发现 |
| `probe-dsh-nomodel` | `nomodel-dir/SKILL.md` + `disable-model-invocation: true` | **未出现** | 该键确实从模型 catalog 隐藏 |
| （`references/extra.md`） | `dir-mismatch/references/extra.md` | 未产生条目 | references 不自动发现 |

另外，写入后 **约 3–4 秒内** catalog 自动更新，删除后同样自动复原 —— watcher 生效。
（被测目录已在调研结束后删除，`~/.agents` 已恢复为不存在。）

---

## 2. OpenAI Codex

### 2.1 发现路径

官方文档给的表：

| Scope | 位置 | 用途 |
|---|---|---|
| `REPO` | `$CWD/.agents/skills` | 启动 Codex 的当前目录 |
| `REPO` | `$CWD/../.agents/skills` | 在 git 仓库内，向上每一层 |
| `REPO` | `$REPO_ROOT/.agents/skills` | 仓库根 |
| `USER` | `$HOME/.agents/skills` | 个人、跨仓库 |
| `ADMIN` | `/etc/codex/skills` | 机器/容器级 |
| `SYSTEM` | 随 Codex 附带（`skill-creator`、`skill-installer`） | 默认启用 |

【官方文档】<https://learn.chatgpt.com/docs/build-skills>（`developers.openai.com/codex/skills` 会 302 到这里）
原文："For repositories, Codex scans `.agents/skills` in every directory from your current working directory up to the repository root. If two skills share the same `name`, Codex doesn't merge them; both can appear in skill selectors." 以及 "Codex supports symlinked skill folders and follows the symlink target when scanning these locations."

**另一条 `$CODEX_HOME/skills`**（= 默认 `~/.codex/skills`）也同样是用户级根，末尾/系统 skill 都在这里：

```text
Ask clarifying questions only when the missing information matters and cannot reasonably be inferred.
Respect a user-specified location; otherwise create discoverable skills in `$CODEX_HOME/skills`,
or `~/.codex/skills` when `CODEX_HOME` is unset.
```
【官方文档】`~/.codex/skills/.system/skill-creator/SKILL.md:151`（同一句也被编译进 CLI 二进制）

**实测（`codex debug prompt-input`，从 `/tmp/codex-probe2/sub` 启动，仓库根为 `/tmp/codex-probe2`）**
实际渲染出的 Skill roots 表：

```text
- `r0` = `/Users/Zhuanz/.codex/skills`
- `r1` = `/Users/Zhuanz/.agents/skills`
- `r2` = `/Users/Zhuanz/.codex/skills/.system`
- `r3` = `/Users/Zhuanz/.codex/plugins/cache/openai-bundled`
- `r4` = `/Users/Zhuanz/.codex/plugins/cache/openai-primary-runtime`
- `r5` = `/Users/Zhuanz/.codex/plugins/cache/openai-primary-runtime/spreadsheets/26.1110.11613/skills`
- `r6` = `/private/tmp/codex-probe2/.agents/skills`      ← 仓库根
- `r7` = `/private/tmp/codex-probe2/sub/.agents/skills`  ← cwd
```

结论：`~/.codex/skills`、`~/.agents/skills`、`.system`、插件缓存，以及**从 cwd 逐层到仓库根的每一个 `.agents/skills`** 都是真实生效的根；catalog 用 `rN` 别名 + 相对路径给出每个 skill 的 `SKILL.md` 位置。
【实测】`codex debug prompt-input "probe"` 输出

CLI 二进制的 capability manager 里也能看到这四个 skill 根的名字：`codex-home-skills`、`.agents/skills`、`user-agent-skills`、`system-skills`。
【实测】`strings`/正则提取 `/Applications/ChatGPT.app/.../MacOS/codex` 内嵌字符串（`exec-server/src/discoverV2/capability_manager.rs`）

**同名处理**：不同 scope 的同名 skill **不合并、都出现**（与 DSH 相反）。见上面的官方原文。
**注意**：二进制里**没有** `.codex/skills` 这个字面量；仓库级路径是 `.agents/skills`，不是 `.codex/skills`。

### 2.2 SKILL.md frontmatter 规范

**必需字段（官方 + 校验脚本一致）**

```md
---
name: skill-name
description: Explain exactly when this skill should and should not trigger.
---
```
【官方文档】<https://learn.chatgpt.com/docs/build-skills>（"The `SKILL.md` file must include `name` and `description`."）
【源码】`~/.codex/skills/.system/skill-creator/scripts/quick_validate.py:51-54`

**官方推荐的命名软约束**（skill-creator 指南，不是 loader 强校验）

- 小写字母、数字、连字符；名字 < 64 字符；目录按 skill 命名。
  【源码】`~/.codex/skills/.system/skill-creator/SKILL.md:165-168`

**`quick_validate.py` 的硬校验（这是**校验脚本**的规则，不等于 loader 的规则）**

| 规则 | 值 | 行号 |
|---|---|---|
| frontmatter 允许的 key | 仅 `name`, `description`, `license`, `allowed-tools`, `metadata` | `:40` |
| `name` 正则 | `^[a-z0-9-]+$`，且不能以 `-` 开头/结尾、不能有 `--` | `:61-70` |
| `name` 长度 | ≤ **64** | `:12, 71-76` |
| `description` 长度 | ≤ **1024** | `:87-91` |
| `description` 禁止 | 含 `<` 或 `>` | `:85-86` |
| 其它 | 拒绝未完成的 `[TODO: ...]` 占位 | `:82-83, 112-115` |

**但 Codex 的 loader 比这个脚本宽松得多 —— 实测：**

| 探针 | 变异 | catalog 结果 |
|---|---|---|
| `p-whentouse` | 多了 `whenToUse:` 键（DSH 专用） | **出现**，未被拒 |
| `p-dsh-disable` | 多了 `disable-model-invocation:` 键（DSH 专用） | **出现**，未被拒 |
| `p-badname` | `name: p_badname`（下划线，违反 kebab） | **出现**，未被拒 |
| `p-angle` | description 含 `<angle>` | **出现**，原样渲染 |
| `p-chinese` | 中文 description | **出现**，原样渲染 |
| `p-metadata` | `metadata.short-description` | **出现** |
| `p-longdesc` | 超长 description | **出现但被截断到 1024 字符**（含结尾 `...`） |

【实测】`codex debug prompt-input` 输出解析（`/tmp/codex-probe2`）
**description 截断实测值**：渲染出的 description 长度恰为 **1024**，以 `...` 结尾 —— 与 `quick_validate.py` 的 1024 上限吻合。

> ⚠️ 实务建议：虽然 loader 宽容，但**不要**依赖这种宽容。`whenToUse` / `disable-model-invocation` 会让官方的 `quick_validate.py` 报错，且未来版本可能收紧。若要两边都干净，用 §4 的交集模板。

### 2.3 `agents/openai.yaml` 的作用与字段

**作用**：产品侧（ChatGPT 桌面 App / Codex UI）的显示元数据、调用策略、工具依赖声明。文档明确它是**可选的**。
【官方文档】<https://learn.chatgpt.com/docs/build-skills>（"Add `agents/openai.yaml` to configure UI metadata in the ChatGPT desktop app, to set invocation policy, and to declare tool dependencies"）
【官方文档】`~/.codex/skills/.system/skill-creator/references/openai_yaml.md:3`："`agents/openai.yaml` is an extended, product-specific config intended for the machine/harness to read, not the agent."

**完整字段（官方 spec 原文示例）**

```yaml
interface:
  display_name: "Optional user-facing name"
  short_description: "Optional user-facing description"
  icon_small: "./assets/small-400px.png"
  icon_large: "./assets/large-logo.svg"
  brand_color: "#3B82F6"
  default_prompt: "Optional surrounding prompt to use the skill with"

dependencies:
  tools:
    - type: "mcp"
      value: "github"
      description: "GitHub MCP server"
      transport: "streamable_http"
      url: "https://api.githubcopilot.com/mcp/"

policy:
  allow_implicit_invocation: true
```
【源码】`~/.codex/skills/.system/skill-creator/references/openai_yaml.md:7-26`

| 字段 | 含义 / 约束 | 出处 |
|---|---|---|
| `interface.display_name` | UI 列表和 chip 里显示的人类可读名 | `openai_yaml.md:36` |
| `interface.short_description` | UI 短描述，**25–64 字符** | `openai_yaml.md:37`；生成器强校验 25–64：`generate_openai_yaml.py:169-174` |
| `interface.icon_small` / `icon_large` | 相对 skill 目录的图标路径，建议放 `assets/` | `openai_yaml.md:38-39` |
| `interface.brand_color` | UI 强调色 hex | `openai_yaml.md:40` |
| `interface.default_prompt` | 插入的默认提示词；**必须显式用 `$skill-name` 提到本 skill** | `openai_yaml.md:34, 41` |
| `dependencies.tools[].type` | 目前**只支持 `mcp`** | `openai_yaml.md:42` |
| `dependencies.tools[].value` / `.description` / `.transport` / `.url` | 依赖标识 / 说明 / 连接方式 / MCP URL | `openai_yaml.md:43-46` |
| `policy.allow_implicit_invocation` | `false` → 不自动注入模型上下文，但仍可 `$skill` 显式调用；**默认 true** | `openai_yaml.md:47-49`；官网："`allow_implicit_invocation` (default: `true`)" |

**哪些字段必填？—— 严格来说都不必填**；`openai.yaml` 整个文件是可选的。官方 spec 里每个 `interface` 字段都标了 "Optional"。生成器 `generate_openai_yaml.py` 在有 override 时会自动补 `display_name`（由 skill 名推导）和 `short_description`（自动生成并强制 25–64 字符），但这只是生成器的行为，不是 loader 的要求。
【源码】`~/.codex/skills/.system/skill-creator/scripts/generate_openai_yaml.py:40-47, 164-192`
【源码】`~/.codex/skills/.system/skill-creator/SKILL.md:111`："Include optional interface fields only when the user provides or requests them."

**真实样例**（Codex 自带的 system skill）
```yaml
interface:
  display_name: "Review Agent"
  short_description: "Find actionable bugs in code changes"
  default_prompt: "Use $review-agent to review the requested code changes and return actionable findings."
policy:
  allow_implicit_invocation: false
```
【源码】`~/.codex/skills/.system/review-agent/agents/openai.yaml`

### 2.4 触发方式

**显式调用**：Codex CLI / IDE 里用 `/skills` 选择或输入 `$` 唤起；ChatGPT 里用 `@`。
**隐式调用**：任务匹配 `description` 时由模型自行选择，除非 `policy.allow_implicit_invocation: false`。
【官方文档】<https://learn.chatgpt.com/docs/build-skills>："In Codex CLI or the IDE extension, run `/skills` or type `$` to mention a skill." / "Implicit invocation: ChatGPT or Codex can choose a skill when your task matches the skill `description`."

CLI 内嵌的 system prompt 也印证：
> "Trigger rules: If the user names an available skill (with `$SkillName` or plain text) OR the task clearly matches an available skill's description, you must use that skill for that turn."
【实测】`strings` 提取 `/Applications/ChatGPT.app/.../MacOS/codex` 内嵌 prompt

**初始 catalog 的上下文预算**：默认最多占模型 context window 的 **2%**，context window 未知时用 **8,000 字符**；skill 多时**优先截短 description**，再多则**省略部分 skill 并给警告**；可用 `skills.max_context_tokens` 调整，**上限 10,000 tokens**。该预算只作用于初始列表，被选中的 skill 仍会读完整 `SKILL.md`。
【官方文档】<https://learn.chatgpt.com/docs/build-skills>
（二进制里对应的可观测指标：`codex.thread.skills.truncated`、`codex.thread.skills.description_truncated_chars`、`budget_limit`、`omitted_skills`。）

**关闭某个 skill / 关闭全部系统 skill**（写进 `~/.codex/config.toml` 或受信任的 `.codex/config.toml`）：
```toml
[[skills.config]]
path = "/path/to/skill/SKILL.md"
enabled = false

[skills.bundled]
enabled = false
```
每个 entry 只用一种选择器（`path` 绝对路径匹配单个 `SKILL.md`，或 `name` 匹配所有同名 skill）；多条匹配时**最后一条生效**。改完需重启 Codex。
【官方文档】<https://learn.chatgpt.com/docs/build-skills>（"Enable or disable local Codex skills"）

---

## 3. 通用最小结构（一份目录，两边都能用）

### 3.1 推荐落点

| 目标 | 路径 |
|---|---|
| 用户级（跨项目、两个工具都读） | **`~/.agents/skills/<name>/SKILL.md`** |
| 项目级（两个工具都读） | **`<repo>/.agents/skills/<name>/SKILL.md`** |

理由（交叉验证）：

- `~/.agents/skills`：DSH `user-agents` 根，rank 500【源码 `dsh-skill-filesystem/src/index.ts:264`】；Codex 实测根 `r1`【实测】。
- `<repo>/.agents/skills`：DSH `project-agents` 根，rank 200【源码 `dsh-skill-filesystem/src/index.ts:257`】；Codex 逐层扫描到仓库根【官方文档 + 实测 `r6`/`r7`】。

> ⚠️ **项目级有个不对称**：DSH **只看 git 仓库根那一处** `.agents/skills`；Codex 会看**从 cwd 到仓库根的每一层**。所以放在仓库根是最保险的（两边必中）。若只有 `.git` 不存在（非 git 目录），DSH 退回把 cwd 当 projectRoot，此时 cwd 的 `.agents/skills` 两边都能命中。

### 3.2 最小目录树

```text
.agents/skills/
└── my-skill/                 # 目录名随手写，但强烈建议与 name 一致
    ├── SKILL.md              # 唯一必需文件
    ├── references/           # 可选：按需读取的文档（两边都不自动扫描）
    ├── scripts/              # 可选：可执行脚本
    ├── assets/               # 可选：产出物模板/图片
    └── agents/
        └── openai.yaml       # 可选：仅 Codex 用（UI 元数据 + 调用策略）
```

**必须遵守的三条交集约束**（违反任一条就会有一边不认）：

1. **必须是"目录 + `SKILL.md`"形式，不能用平铺 `<name>.md`。**
   DSH 两种都收【源码 `dsh-skill-filesystem/src/index.ts:742-746`】，但 Codex 要求"a folder with a `SKILL.md` file"【官方文档】，且 `quick_validate.py:19-21` 直接以 `SKILL.md` 是否存在作为第一检查。
2. **`SKILL.md` 必须紧贴在 skill 目录下一层，不能更深。**
   DSH 不支持嵌套递归 `**/SKILL.md`【官方文档 `docs/subsystems/skills.md:85`；实测 `probe-dsh-nested` 未出现】。
3. **frontmatter 必须有非空 `name` + `description`，且 `name` 用 kebab-case。**
   DSH 强制 kebab 正则【源码 `dsh-skill/src/index.ts:21`】；Codex loader 虽然宽容（实测下划线也收），但官方规范与 `quick_validate.py` 都要求 `^[a-z0-9-]+$`。

**建议避开**：frontmatter 里的 DSH 专属键（`whenToUse`、`disable-model-invocation`、`user-invocable`）。Codex loader 当前不报错（实测），但会被 Codex 官方校验脚本判为"Unexpected key(s)"【`quick_validate.py:40-49`】。想两边都干净时，用 §4 模板。

### 3.3 两边差异对照表

| 维度 | DSH | Codex |
|---|---|---|
| 用户级私有路径 | `~/.dsh/skills`（rank 400） | `~/.codex/skills`（`$CODEX_HOME`，实测 `r0`） |
| 用户级共享路径 | `~/.agents/skills`（rank 500） | `~/.agents/skills`（实测 `r1`） |
| 项目级 | 仅 `<git-root>/.dsh/skills`(100) + `<git-root>/.agents/skills`(200) | cwd→仓库根每层 `.agents/skills` |
| 平铺 `<name>.md` | ✅ 支持 | ❌ 不支持 |
| 嵌套 `**/SKILL.md` | ❌ 不支持 | ❌（按目录直读 `SKILL.md`） |
| 同名冲突 | 择一（层 → rank） | **都出现，不合并** |
| `name` 与目录名一致 | 不要求（实测） | 不要求（实测 `dirname-mismatch` → `probe-frontmatter-name`） |
| 中文 description | ✅ | ✅（实测） |
| description 渲染截断 | 500（可配 `catalogDescriptionMaxLength`） | 每条约 1024，另有 2%/8000 字符总预算 |
| 显式调用 | 会话内 `skill({name})` / 用户命令 | `$skill-name`、`/skills`、ChatGPT `@` |
| 隐式调用开关 | frontmatter `disable-model-invocation` | `agents/openai.yaml` → `policy.allow_implicit_invocation` |

---

## 4. frontmatter 模板

### 4.1 两边通吃（推荐，无任何专属键）

```markdown
---
name: my-skill
description: 一句话说清"做什么 + 什么时候用 + 什么时候别用"。这是两边唯一的路由依据，请把关键触发词前置。
---

# My Skill

## 何时使用 / 何时不用
...

## 步骤
1. ...

## 参考
- 需要 X 时读 [references/x.md](references/x.md)
- 需要 Y 时运行 `scripts/y.py`
```

配套 `agents/openai.yaml`（可选，只影响 Codex 的 UI 与隐式调用）：

```yaml
interface:
  display_name: "My Skill"
  short_description: "Describe the skill in 25 to 64 chars"
  default_prompt: "Use $my-skill to do the thing."
policy:
  allow_implicit_invocation: true
```

要点：`short_description` **必须 25–64 字符**（生成器强校验，见 `generate_openai_yaml.py:169-174`）；`default_prompt` **必须显式写 `$my-skill`**（`openai_yaml.md:34`）。

### 4.2 DSH 增强版（想用 DSH 专属能力时）

```markdown
---
name: my-skill
description: 面向模型路由的描述；会被截到 500 字符渲染进 catalog。
whenToUse: 补充路由指引；仅 DSH 使用，不进 catalog 渲染。
disable-model-invocation: false   # true = 只允许显式调用
user-invocable: true              # false = 不出现在人类命令目录
metadata:
  owner: team-x
---
```

⚠️ `whenToUse` / `disable-model-invocation` / `user-invocable` 是 DSH 专属；Codex 的 `quick_validate.py` 会判为非法 key。若同时要跑 Codex 官方校验，请改用 4.1，或把隐式调用策略写进 `agents/openai.yaml`。

---

## 5. 不确定 / 未核实

以下条目本次**没有**拿到直接证据，或证据只覆盖部分场景，使用前请自行复核。

1. **`/etc/codex/skills`（ADMIN scope）未实测** —— 本机 `/etc/codex` 不存在（`ls: /etc/codex: No such file or directory`），我没有创建它（需要写系统目录，超出本次调研必要范围）。仅依据官方文档表格。
2. **Codex 各 root 之间的优先级顺序未获官方明确表述** —— 实测 roots 表里 `~/.codex/skills`(r0) 排在 `~/.agents/skills`(r1) 之前，`repo .agents/skills` 更靠后，但官方只说同名"不合并、都可能出现"，**没有**给出"谁赢"的规则。不要假设先出现的会覆盖后者。
3. **DSH 的 layer（全局层 vs preset scope 层）行为未实测** —— §1.1 的"最近层压过重名"来自官方文档与 registry 源码注释，我没有构造两个 scope 的对照实验。
4. **Codex description 截断的确切机制未完全确定** —— 实测一条超长 description 被截到恰好 1024 字符并以 `...` 结尾。这既可能是"单条 1024 上限"，也可能是"总预算 2%/8000 字符压力下的截断"。文档只说"descriptions 会先被缩短"，未给出单条上限数值。**1024 这个数**与 `quick_validate.py:87-91` 的上限一致，但两者是否为同一常量未经证实。
5. **Codex 版本是 alpha（0.167.0-alpha.3.2）** —— 行为可能与 stable 版本不同；上述实测结论都绑定该版本。
6. **DSH `catalogDescriptionMaxLength` 若要调，需改 profile 配置** —— 我只验证了默认值 500（源码常量）和配置项存在，**没有**实际改配置验证生效。
7. **`skills.max_context_tokens` 上限 10,000 tokens 未实测** —— 仅来自官方文档。
8. **DSH 对 `~/.agents/skills/.system` 不跳过** —— 源码显示 `skipSystem` 只加在 `user-dsh` 根（`dsh-skill-filesystem/src/index.ts:263`），`user-agents` 没有。这意味着 DSH 会读取 `~/.agents/skills/.system/*`，但我**没有实测**确认。
9. **Codex 是否把 `~/.dsh/skills` 或 `.dsh/skills` 当作根** —— 二进制里既无 `.dsh` 相关 skill 根字符串，实测 roots 表也没有，故判为"不支持"。但未穷举所有配置项（如 `skills.extraRoots`，二进制里存在 `skills/extraRoots/set` RPC），**通过该 RPC 或许能加任意根**，本次未验证。
10. **`whenToUse` 对 DSH 的实际路由效果** —— 源码确认它被解析进 `SkillSummary.whenToUse`，但 `dsh-tool-skill` 的模型 catalog **明确排除** routing hints【`docs/subsystems/skills.md:229`】，我只确认"它不进 catalog"，**没有**确认它在哪个人类界面上被消费。

---

## 6. 参考出处汇总

**DSH（本机安装，0.2.2-rc.3）**
- `<DSH>/dsh/docs/subsystems/skills.md`（官方 skill 子系统文档：优先级表 :64-77、身份/命名 :85、catalog :229、references :233）
- `<DSH>/dsh/docs/config-catalog.md:3479-3517, 4527-4545`（skill 相关配置项）
- `<DSH>/dsh-skill-filesystem/src/index.ts`（rank :35-39、roots :251-271、parse :811-854、invocation :1014-1024、frontmatter :931-957、findProjectRoot :959-969、watcher :676-702）
- `<DSH>/dsh-skill/src/index.ts`（`SKILL_NAME` :21、`renderSkillContent` :170-183）
- `<DSH>/dsh-tool-skill/src/index.ts`（`DEFAULT_CATALOG_DESCRIPTION_MAX_LENGTH` :28、截断 :411-413）
- `<DSH>/dsh-home-paths/src/index.ts:12-27, 127-148`（`$DSH_HOME`/`$DSH_AGENTS_HOME` 解析）
- `<DSH>/dsh-agent-preset/skills/dsh-doc/`（dsh-doc skill 与 `references/locate-docs.md`：如何读 app.asar）
- 实例：`~/.dsh/skills/vibeme-design-system/SKILL.md`（中文 description + `whenToUse` 的真实用法）

**Codex（codex-cli 0.167.0-alpha.3.2）**
- 官方文档：<https://learn.chatgpt.com/docs/build-skills>（入口 <https://developers.openai.com/codex/skills>）
- 官方文档索引：<https://learn.chatgpt.com/llms.txt>
- `~/.codex/skills/.system/skill-creator/SKILL.md`（:50 frontmatter、:32-44 目录结构、:94-101 调用策略、:151 落点、:163-168 命名、:205-211 校验）
- `~/.codex/skills/.system/skill-creator/references/openai_yaml.md`（openai.yaml 完整字段规范）
- `~/.codex/skills/.system/skill-creator/scripts/quick_validate.py`（:40 允许的 key、:61-76 name、:87-91 description）
- `~/.codex/skills/.system/skill-creator/scripts/generate_openai_yaml.py`（:169-174 short_description 25–64）
- `~/.codex/skills/.system/review-agent/agents/openai.yaml`（真实样例）
- CLI 二进制：`/Applications/ChatGPT.app/Contents/Resources/codex-cli/CodexCLI.app/Contents/MacOS/codex`（内嵌 system prompt、capability roots、`skills/list` / `skills/extraRoots/set` RPC）

**实测命令**（可复现）
```bash
# 看 Codex 实际加载了哪些 root 与 skill
cd <repo>/<subdir> && codex debug prompt-input "probe"
```
