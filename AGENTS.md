# Runyard | Agent Operating Procedures

This document outlines the mandatory rules, constraints, and methodologies for AI agents working on **Runyard**—a performance-first, agentic IDE for human and AI collaboration.

---

## 🏗️ Project Context
- **Product**: Runyard (Agentic IDE)
- **Stack**: 
  - **Core**: Rust (Tauri)
  - **Frontend**: SvelteKit, TypeScript, TailwindCSS
  - **Environment**: Monorepo managed via `pnpm` and `turbo`
  - **Philosophy**: Performance-first. Minimal overhead. Seamless human-AI synergy.

---

## 📜 The Prime Directives
1. **Always Ask. Never Assume.** Stop and confirm before destructive, ambiguous, or large-scope actions.
2. **Never Do More Than Asked.** Fix the specific issue. Mention others, but don't dive in without approval.
3. **Finish What You Start.** No `// TODO`, `// FIXME`, or empty function bodies.
4. **Understand Before Acting.** Read existing schemas and patterns. No new libraries without a strong reason.

---

## 🛠️ Methods of Working

### 1. Research & Discovery
- **Check Knowledge Items (KIs)**: Before any research, check `<appDataDir>\knowledge` for existing patterns.
- **Search First**: Use search tools for unfamiliar APIs or persistent bugs. Never assume something "doesn't exist" without searching.
- **Context Awareness**: Read the `pnpm-workspace.yaml` and `turbo.json` to understand how packages interact.

### 2. Code Standards
- **Rust (Backend)**:
  - Prioritize performance and safety.
  - Follow idiomatic Rust patterns (Clippy is your friend).
  - Explicit error handling; no `unwrap()` or `expect()` in production paths.
- **TypeScript (Frontend)**:
  - **Strict Type Safety**: No `any`. Use `unknown` and narrow explicitly.
  - **Zod**: Mandatory for validating external data (API responses, IPC messages).
  - **Tailwind**: Utility-first styling only. No inline styles or hardcoded hex codes.
- **Architecture**:
  - One responsibility per function.
  - No business logic in UI components; keep it in stores or separate logic modules.

### 3. Tool Usage
- **GitHub**: Use `gh` CLI for all operations (PRs, issues, etc.).
- **Terminal**: Never kill all Node processes. Run servers only when needed and kill them after use.

---

## ⚠️ Safety & Destructive Operations

### Git First
- Always run `git status` before reorganization. If there's uncommitted work, inform the user.

### Copy → Verify → Delete
1. Copy files to the new location.
2. Verify the copy succeeded.
3. Ask before deleting the originals.

### Hard Constraints
- **`.env` Files**: NEVER use `write_file` or destructive commands. Use surgical `replace` to preserve keys.
- **`rm -rf`**: Requires explicit user confirmation with a list of exactly what will be deleted.
- **Process Management**: Never close stray Node processes blindly; you might kill yourself.

---

## 🚀 Performance-First Philosophy
Runyard is an IDE. It must be fast.
- Avoid heavy runtime dependencies.
- Minimize IPC overhead between Rust and Svelte.
- Use Svelte's reactivity efficiently; avoid unnecessary re-renders.
- In Rust, be mindful of memory allocation and thread safety.

---

> [!IMPORTANT]
> You are building a tool for *other* agents and developers. Your code is the blueprint. Make it exemplary.
