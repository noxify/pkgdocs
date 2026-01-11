# Contributing to pkgdocs

First, thank you for considering contributing to pkgdocs! Your contributions help make pkgdocs better for everyone.

## Table of Contents

- [How to Contribute](#how-to-contribute)
  - [Reporting Issues](#reporting-issues)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Submitting Pull Requests](#submitting-pull-requests)
- [Development Guide](#development-guide)
  - [Project Setup](#project-setup)
  - [Code Style Guidelines](#code-style-guidelines)
  - [Testing](#testing)
- [Getting Help](#getting-help)

## How to Contribute

### Reporting Issues

If you encounter any bugs or have suggestions for improvements, please [open an issue](https://github.com/noxify/pkgdocs/issues) in the repository. When reporting a bug, please include:

- A clear and descriptive title
- A detailed description of the problem
- Steps to reproduce the issue
- Any relevant screenshots, logs, or code samples
- Your environment (Node.js version, OS, etc.)

### Suggesting Enhancements

Feature requests and enhancements are welcome and appreciated. To suggest an improvement:

- Open an issue in the repository
- Provide a clear and descriptive title
- Include a detailed description of the feature or enhancement
- Explain why this feature would be beneficial
- Provide examples of how the feature would be used (if applicable)

### Submitting Pull Requests

Contributions via pull requests are welcome! Here's the process:

1. **Fork the Repository**: Click the "Fork" button at the top right of the [pkgdocs repository](https://github.com/noxify/pkgdocs)
2. **Clone Your Fork**:
   ```bash
   git clone https://github.com/your-username/pkgdocs.git
   cd pkgdocs
   ```
3. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Follow Setup Instructions**: See [Project Setup](#project-setup) below
5. **Make Your Changes**: Implement your feature or bug fix
6. **Write Tests**: Include tests for any new functionality
7. **Run Quality Checks**:
   ```bash
   pnpm test
   pnpm typecheck
   pnpm lint
   pnpm format:fix
   ```
8. **Commit Your Changes** using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add new feature"
   # or
   git commit -m "fix: resolve bug"
   ```
9. **Push to Your Fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
10. **Open a Pull Request**: Navigate to the original [pkgdocs repository](https://github.com/noxify/pkgdocs) and click "Compare & pull request". Provide a clear description of your changes and submit the PR

**PR Guidelines:**

- Link related issues using `Fixes: #123` in the PR description
- Ensure all checks pass (tests, types, linting)
- Be open to feedback and review comments
- Update documentation if needed

## Development Guide

### Project Setup

This is a monorepo managed with [pnpm](https://pnpm.io/). Make sure you have Node.js 24 installed ( use `nvm` to manage different node versions ).

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Watch mode for development
pnpm dev

# Type check
pnpm typecheck

# Lint code
pnpm lint

# Format code
pnpm format:fix
```

### Code Style Guidelines

#### TypeScript Conventions

- **Generic Type Parameters**: Always prefix with `T` to distinguish from concrete types

  ```typescript
  // ✅ Good
  interface Container<TValue = unknown> {
    value: TValue
  }

  // ❌ Avoid
  interface Container<Value = unknown> {
    value: Value
  }
  ```

- **Naming Conventions**:
  - Variables and functions: `camelCase`
  - Types and interfaces: `PascalCase`
  - Generic parameters: `T` prefix + `PascalCase` (e.g., `TJobPayload`, `TEventData`)
  - Constants: `CONSTANT_CASE` for truly immutable values only

#### Code Quality Standards

- **No console statements** in production code (use proper logging instead)
- **Proper TypeScript types**: Avoid `any` when possible
- **Prefer type-fest**: Use battle-tested utility types from [type-fest](https://github.com/sindresorhus/type-fest) over custom implementations
- **Self-documenting code**: Write clear, meaningful names and avoid excessive comments
- **JSDoc for public APIs**: Add comments for exported functions, types, and interfaces

#### Import Organization

Follow this import order:

1. Types first (using `import type`)
2. React/Next.js/Expo (if applicable)
3. Third-party modules
4. @pkgdocs packages
5. Relative imports (`~/`, `../`, `./`)

**Import Path Rules:**

- No file extensions: Never use `.js`, `.ts`
- Prefer directory imports: Use `../src` instead of `../src/index`
- Avoid useless segments: Skip `/index` when possible
- Use path aliases when available (e.g., `~` for src directory)

### Testing

Tests are written using [Vitest](https://vitest.dev/) and are located in `tests/` directories alongside the code they test.

- **Write tests** for all new functionality
- **Test coverage** should not drop
- **Run tests before submitting**: `pnpm test`

Example test structure:

```typescript
import { describe, expect, it } from "vitest"

import { myFunction } from "./module"

describe("myFunction", () => {
  it("should do something", () => {
    const result = myFunction("input")
    expect(result).toBe("expected output")
  })
})
```

## Getting Help

If you need any assistance or have questions about contributing:

- **Discussions**: [GitHub Discussions](https://github.com/noxify/pkgdocs/discussions)
- **Issues**: [GitHub Issues](https://github.com/noxify/pkgdocs/issues) (for bugs and feature requests)

Thank you for your interest in contributing to pkgdocs! Your support is greatly appreciated 🙏
