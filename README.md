# pkgdocs

## Framework Adapter Config

Use `framework.next` in `pkgdocs.config.mjs` to configure framework adapter behavior in one place.

```js
import { defineConfig } from "@pkgdocs/config"

export default defineConfig({
  framework: {
    next: {
      prefetch: true,
      useOptimizedImage: true,
    },
  },
})
```

Supported fields:

- `framework.next.prefetch`: enables/disables Next.js link prefetch behavior.
- `framework.next.useOptimizedImage`: enables/disables Next.js image optimization fallback behavior.
