# Code Examples & Patterns

## Number Formatting
Use the `formatRate` utility function from `@/lib/formatters`:

```typescript
import { formatRate } from '@/lib/formatters';

// Basic usage - only shows decimals if not a whole number
formatRate(120)      // "120"
formatRate(123.5)    // "123.5"

// With sign - adds + for positive numbers
formatRate(120, true)   // "+120"
formatRate(-50, true)   // "-50"
```

**Guidelines:**
- Use `formatRate()` for all production/consumption rates, power values, and resource amounts
- Use `includeSign: true` for values that need explicit +/- signs (like in resource summaries)
- Do NOT use `.toFixed(1)` directly - always use the shared utility for consistency

## Tailwind CSS v4 Theme Usage
Colors are defined using CSS custom properties in `src/assets/main.css`.

Use theme tokens in components:
- `text-foreground` / `text-muted-foreground` for text
- `bg-card` / `bg-background` for backgrounds
- `border-border` for borders
- `text-primary` for accent colors
- `text-destructive` for errors
- `text-chart-4` for highlights (yellow)

## Responsive Class Override Pattern
**ALWAYS use responsive prefixes** when overriding component defaults:

```vue
<!-- ❌ WRONG - No responsive prefix -->
<DialogContent class="max-w-4xl">

<!-- ✅ CORRECT - Use responsive prefix -->
<DialogContent class="sm:max-w-4xl">
```

**Rule:** If a default class has `sm:`, your override must also have `sm:` (or higher breakpoint).

## Adding shadcn-vue Components
```bash
npx shadcn-vue@latest add [component-name]
```

This copies the component into `src/components/ui/[component-name]/`, where you can customize it.
