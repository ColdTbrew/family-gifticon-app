# Repository Guidelines

## Project Structure & Module Organization
- `README.md`: project overview, goals, and branch strategy.
- `docs/PRD.md`: MVP scope and product requirements.
- `docs/ISSUES.md`: prioritized implementation checklist (`P0`, `P1`).
- `.github/ISSUE_TEMPLATE/`: issue templates for bug reports and feature requests.

This repository is currently planning-first. As implementation starts, keep runtime code in `src/`, automated tests in `tests/`, and static assets in `assets/` for predictable navigation.

## Build, Test, and Development Commands
No application build/test toolchain is committed yet. Use these baseline commands during collaboration:
- `git checkout develop`: start from the integration branch.
- `git checkout -b feature/<short-topic>`: create a feature branch.
- `rg --files docs .github`: quickly inspect planning and template files.
- `git log --oneline -n 10`: review recent commit style before committing.

When app scaffolding is added, update this section with exact install, run, and test commands.

## Coding Style & Naming Conventions
- Write concise Markdown with clear `#`/`##` headings and short bullet lists.
- Keep one topic per section; prefer relative links (for example, `docs/PRD.md`).
- Follow branch naming from README: `feature/<scope>`.
- Use descriptive file names; keep docs consistent with existing patterns such as `PRD.md` and `ISSUES.md`.

## Testing Guidelines
No automated framework is configured yet.
- Document manual verification steps in each PR (what was tested and expected result).
- For new code, add tests in `tests/` and document how to run them in both `README.md` and this guide.
- Treat `docs/ISSUES.md` P0 items as the minimum regression checklist for MVP-related changes.

## Commit & Pull Request Guidelines
- Use imperative, summary-style commit subjects, matching existing history (example: `Initialize project structure and planning docs`).
- Keep commits focused to one logical change.
- PRs should include:
  - purpose and scope,
  - linked issue (if applicable),
  - list of changed files/docs,
  - screenshots or recordings for UI changes.
