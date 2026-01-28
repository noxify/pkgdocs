@pkgdocs/ui (React 19 + Rolldown)

- Layout registry and ThemeProvider for doc apps
- MDX components factory with overrides

Build:
pnpm -F @pkgdocs/ui build

Exports:

- @pkgdocs/ui
- @pkgdocs/ui/layouts/classic
- @pkgdocs/ui/layouts/minimal
- @pkgdocs/ui/mdx

Optional: Dark/Light mode integration (outline)

- Add CSS variable presets under ui/theme/presets and toggle data-theme on documentElement.
- Keep layout components color-agnostic (use only CSS variables).
