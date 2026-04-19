# Claude Skills Backup

A personal backup of Claude Code skills, superpowers plugins, and AI tools used with [Claude Code](https://claude.ai/code). Clone this repo to get a full set of skills ready to use immediately.

## What's Inside

| Folder | Description |
|---|---|
| `Skills/` | Video & cinematic prompt skills (15 categories: anime, fashion, real estate, etc.) |
| `superpowers/` | Superpowers plugin — workflow skills for planning, debugging, TDD, and more |
| `ui-ux-pro-max-skill/` | Advanced UI/UX design skill |
| `awesome-claude-code/` | Curated Claude Code resources and extensions |
| `claude-user-skills/` | General-purpose skills: PDF, PPTX, DOCX, frontend design, MCP builder, and more |

## How to Use

### 1. Clone this repo

```bash
git clone https://github.com/Ella200/claude-skills.git
```

### 2. Install skills into Claude Code

Copy the skill folders into your Claude Code skills directory:

```bash
# Copy all general-purpose skills
cp -r claude-skills/claude-user-skills/* ~/.claude/skills/

# Copy the superpowers plugin
cp -r claude-skills/superpowers ~/.claude/plugins/superpowers

# Copy the UI/UX skill
cp -r claude-skills/ui-ux-pro-max-skill ~/.claude/plugins/ui-ux-pro-max-skill
```

### 3. Restart Claude Code

Skills are loaded at session start — restart Claude Code and they'll be available.

## Skill Highlights

- **superpowers** — Structured workflows for TDD, planning, debugging, code review, and parallel agent dispatch
- **frontend-design** — Opinionated UI/UX guidance for building production-quality interfaces
- **mcp-builder** — Guide for creating MCP servers from scratch
- **canvas-design** — Design system with custom fonts for visual work
- **pdf / docx / pptx / xlsx** — Read, edit, and generate Office and PDF documents
- **skill-creator** — Build and evaluate new Claude Code skills

## Requirements

- [Claude Code](https://claude.ai/code) CLI installed
- Some skills (pdf, docx, pptx) require Python dependencies — see the `scripts/` folder inside each skill for details
