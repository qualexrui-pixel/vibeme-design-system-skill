# 安装与使用

这个仓库只交付**一个 skill 目录**：`vibeme-design-system/`。
把它放到 AI 工具会扫描的 skills 根目录下就装好了，DeepSeek Harness（DSH）和 Codex 都能识别同一个目录。

---

## 0. 一句话安装

```bash
mkdir -p ~/.agents/skills
cp -R vibeme-design-system ~/.agents/skills/
```

`~/.agents/skills/` 是 **DSH 与 Codex 唯一共同扫描的用户级目录**，装这里两边都能用。

> 为什么是 `.agents` 而不是 `.dsh` 或 `.codex`：`.dsh/skills` 只有 DSH 认，`.codex/skills` 只有 Codex 认；
> 详细证据与优先级表见 [tools/INSTALL-RESEARCH.md](tools/INSTALL-RESEARCH.md)。

## 1. 用 git 装（推荐，方便更新）

```bash
# 1) 克隆到任意位置
git clone <你的仓库地址> ~/src/vibeme-design-system-skill

# 2) 软链到 skills 目录（Codex 明确支持软链；DSH 读取目录同样有效）
mkdir -p ~/.agents/skills
ln -s ~/src/vibeme-design-system-skill/vibeme-design-system ~/.agents/skills/vibeme-design-system

# 3) 以后更新
cd ~/src/vibeme-design-system-skill && git pull
```

不想用软链就直接复制：

```bash
cp -R ~/src/vibeme-design-system-skill/vibeme-design-system ~/.agents/skills/
```

## 2. 项目级安装（团队共享、随仓库走）

```bash
mkdir -p <你的项目>/.agents/skills
cp -R vibeme-design-system <你的项目>/.agents/skills/
```

- **放在 git 仓库根目录最保险**：DSH 只认仓库根那一处 `.agents/skills`；
  Codex 会从当前目录逐层向上扫到仓库根。
- 适合「设计/前端同学 clone 项目就自带组件库规范」，也可以直接提交进业务仓库。

## 3. 各工具的专属路径（可选）

| 工具 | 路径 | 说明 |
|---|---|---|
| DSH | `~/.dsh/skills/` | DSH 私有，优先级高于 `~/.agents/skills` |
| DSH | `<git 仓库根>/.dsh/skills/` | 项目级里优先级最高 |
| Codex | `~/.codex/skills/` | Codex 私有（`$CODEX_HOME/skills`） |
| 两者 | `~/.agents/skills/`、`<仓库根>/.agents/skills/` | **共用目录** |

装到专属路径同样能用，只是换机器/换工具时要再装一次。

## 4. 验证装好了没

**DSH**：随便开一个新会话，问一句「VibeMe 的按钮有哪些变体」。
装好后 skill 目录会自动出现在会话的 available skills 列表里（写入后约 3–4 秒热更新，不用重启）。

**Codex**：

```bash
codex debug prompt-input "probe"     # 看 Skill roots 表里是否出现你的 skill
```

或在交互里输入 `$vibeme-design-system`（也可以直接描述任务，Codex 会按 description 自动选中）。

## 5. frontmatter 为什么只写这几个字段

```yaml
---
name: vibeme-design-system
description: ...
license: MIT
metadata: ...
---
```

- `name`：必须 kebab-case，两边都要求；这里 ≤64 字符。
- `description`：两边唯一的路由依据，≤1024 字符且不能含 `<` `>`（Codex 官方校验脚本的硬规则）。
  DSH 把它截到 500 字符渲染进目录，所以关键触发词都放在前半段。
- **故意不写** `whenToUse` / `disable-model-invocation` / `user-invocable`：这三个是 DSH 专属，
  Codex 的官方校验脚本会判为非法 key。要控制隐式调用，用 `agents/openai.yaml` 的
  `policy.allow_implicit_invocation`。

## 6. 结构约束（改了结构就可能一边不认）

```text
vibeme-design-system/
├── SKILL.md            ← 必须在 skill 目录的下一层，不能再深
├── agents/openai.yaml  ← 可选，只影响 Codex 的界面与调用策略
├── references/         ← 按需读取的文档（两边都不自动扫描目录）
├── components/         ← React + CSS 参考实现与 tokens.css
├── assets/previews/    ← 组件预览图
└── data/               ← 机器可读的事实与 token 表
```

- 必须用**目录 + `SKILL.md`** 的形式。DSH 也支持平铺的 `<name>.md`，但 Codex 不支持，所以统一用目录。
- 不要嵌套成 `xxx/yyy/SKILL.md`，两边都不会发现。

## 7. 故障排查

| 现象 | 原因 / 处理 |
|---|---|
| 工具里完全看不到这个 skill | 检查 `SKILL.md` 是否紧贴 skill 目录；frontmatter 首行是否正好是 `---`；`name` 是否是 kebab-case |
| Codex 看不到、DSH 看得到 | 大概率是把它放进了 `~/.dsh/skills`。Codex 不认这个根，改用 `~/.agents/skills` |
| 出现了两份同名 skill | Codex 不合并同名（两个都显示），DSH 择一；删掉多余的那份 |
| 改了文件没生效 | 确认软链指向正确的目标目录；DSH 有 3–4 秒热更新时间 |
| 想临时关掉 | Codex：`~/.codex/config.toml` 里加 `[[skills.config]] path=".../SKILL.md"` + `enabled=false`；DSH：把目录移出 skills 根 |

## 8. 卸载

```bash
rm -rf ~/.agents/skills/vibeme-design-system        # 复制安装
rm ~/.agents/skills/vibeme-design-system            # 软链安装（只删链接）
```

---

调研细节、版本与出处：[tools/INSTALL-RESEARCH.md](tools/INSTALL-RESEARCH.md)（含 DSH 0.2.2-rc.3 与 codex-cli 0.167.0-alpha.3.2 的实测记录）。
