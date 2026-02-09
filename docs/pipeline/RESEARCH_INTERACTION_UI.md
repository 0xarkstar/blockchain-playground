# Interactive UI Patterns: 2025-2026 Trends

Research conducted: 2026-02-09
Project: blockchain-playground
Agent: p-research-interaction-ui

---

## Executive Summary

This research examines the latest interactive UI patterns for developer tools and educational platforms in 2025-2026. Key findings:

- **Code Editor**: CodeMirror 6 is optimal for educational platforms due to smaller bundle size (300KB vs 5-10MB for Monaco), better mobile support, and modular architecture
- **Toast System**: Sonner has emerged as the 2025-2026 standard with 8M+ weekly downloads, officially adopted by shadcn/ui
- **Form Validation**: React Hook Form + Zod remains the gold standard with enhanced patterns for inline validation and type safety
- **Command Palette**: cmdk provides headless, accessible ⌘K patterns with excellent performance up to 2,000-3,000 items
- **Blockchain UI**: wagmi v2 + viem + RainbowKit form the de facto stack for Web3 wallet connections, reducing time-to-market by 40-50%

---

## Code Editor Integration (Monaco vs CodeMirror)

### Bundle Size and Performance

| Editor | Core Size | Full Bundle | Performance Notes |
|--------|-----------|-------------|-------------------|
| **CodeMirror 6** | ~300KB | Modular, tree-shakable | Optimal for educational snippets |
| **Monaco Editor** | 5-10MB | Monolithic | Better for long-form editing |

**Recommendation for blockchain-playground**: CodeMirror 6

**Rationale**:
- Much smaller bundle size preserves page load performance
- **Better mobile support** — crucial for educational platforms
- **Modular extension system** allows precise tailoring for Solidity syntax highlighting
- **Read-only snippets** — CodeMirror excels at embedded code examples in learning content
- Monaco is overkill for demo-focused use cases

### React Integration

**CodeMirror 6**:
```tsx
import { useCodeMirror } from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'

const { setContainer } = useCodeMirror({
  value: code,
  extensions: [javascript()],
  editable: true,
})
```

**Themes**: CodeMirror 6 supports custom themes for syntax highlighting. Popular options: One Dark, Dracula, Nord, Solarized.

### Sources
- [CodeMirror vs Monaco Editor: A Comprehensive Comparison - PARA Garden](https://www.agenthicks.com/research/codemirror-vs-monaco-editor-comparison)
- [Monaco Vs CodeMirror in React - DEV Community](https://dev.to/suraj975/monaco-vs-codemirror-in-react-5kf)
- [Replit — Comparing Code Editors: Ace, CodeMirror and Monaco](https://blog.replit.com/code-editors)
- [Best code editor components for React - LogRocket Blog](https://blog.logrocket.com/best-code-editor-components-react/)
- [Migrating from Monaco Editor to CodeMirror | Sourcegraph Blog](https://sourcegraph.com/blog/migrating-monaco-codemirror)

---

## Interactive Playground Patterns

### Key Design Elements (TypeScript Playground, Rust Playground, Shadcn Playground)

**Split-Pane Layout**:
- **Left**: Code editor (60-70% width)
- **Right**: Live preview/output (30-40% width)
- **Resizable divider** for user preference

**Real-Time Compilation**:
- Instant feedback on code changes
- Debounced execution (300-500ms) to prevent excessive re-renders
- Clear error boundaries with inline error display

**Mobile-First Considerations**:
- Embedded terminals or WASM sandboxes for in-browser execution
- Horizontal scroll hints for additional options
- Vertical stack layout for small screens

### Educational Enhancements

**Interactive Visualizations** (Rust Playground pattern):
- Animated diagrams for complex concepts (e.g., ownership/borrowing in Rust, blockchain state transitions)
- Step-through debuggers that illustrate execution flow
- Borrow-checker-style feedback for Solidity contract errors

**Playground Features for blockchain-playground**:
- ✅ **Instant compilation** via Solidity compiler (solc-js)
- ✅ **State visualization** for blockchain state changes
- ✅ **Step-by-step execution** for transaction flows
- ✅ **Download/share code** buttons
- ⚠️ **Embedded terminal** (optional: could use Sandpack for isolated execution)

### Shadcn Playground Architecture

**Sandpack Integration**:
- Uses CodeSandbox's Sandpack for reliable code execution
- Supports multiple files with real-time synchronization
- Error handling for compile-time and runtime errors
- Templates: React, Vue, Angular, Vanilla JS, custom configs

**Example Structure**:
```tsx
<Sandbox
  files={{
    "/App.js": { code: appCode },
    "/index.js": { code: entryCode }
  }}
  template="react"
  options={{
    showLineNumbers: true,
    editorHeight: 400
  }}
/>
```

### Sources
- [The Rust Playground](https://tourofrust.com/02_en.html)
- [Playground - Rust By Example](https://doc.rust-lang.org/rust-by-example/meta/playground.html)
- [TypeScript: TS Playground](https://www.typescriptlang.org/play/)
- [Playground - Shadcn UI](https://ui.shadcn.com/examples/playground)
- [Sandbox - shadcn](https://www.shadcn.io/components/code/sandbox)

---

## Form UX (react-hook-form + zod)

### Current Best Practices (2025-2026)

**Integration Setup**:
```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  email: z.string().email("Invalid email address"),
  amount: z.number().min(0.001, "Minimum 0.001 ETH"),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
})

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
})
```

### Inline Validation Patterns

**Field-Level Error Reporting**:
```tsx
<input {...register("email")} />
{errors.email && <span className="text-red-500">{errors.email.message}</span>}
```

**Real-Time Validation** (on blur/change):
```tsx
useForm({
  mode: "onBlur", // or "onChange", "onTouched"
  resolver: zodResolver(schema)
})
```

**Cross-Field Validation**:
```tsx
const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"]
})
```

### Performance Optimizations

- **Uncontrolled components** — React Hook Form minimizes re-renders
- **Isolated re-renders** — only the field being edited re-renders
- **Type safety** — Zod runtime validation matches TypeScript types

### Sources
- [React Hook Form with Zod: Complete Guide for 2026 - DEV Community](https://dev.to/marufrahmanlive/react-hook-form-with-zod-complete-guide-for-2026-1em1)
- [Learn Zod validation with React Hook Form | Contentful](https://www.contentful.com/blog/react-hook-form-validation-zod/)
- [How to Validate Forms with Zod and React-Hook-Form](https://www.freecodecamp.org/news/react-form-validation-zod-react-hook-form/)
- [React Hook Form - shadcn/ui](https://ui.shadcn.com/docs/forms/react-hook-form)
- [Form Schema Validation with Zod and React Hook Form | Refine](https://refine.dev/blog/zod-typescript/)

---

## Toast & Notification (Sonner)

### Why Sonner is the 2025-2026 Standard

**Adoption Metrics**:
- **8M+ weekly npm downloads** (as of 2025)
- **Official shadcn/ui toast component**
- **Designed for React 18+ with TypeScript-first API**

**Key Advantages over React Hot Toast**:
| Feature | Sonner | React Hot Toast |
|---------|--------|-----------------|
| **Setup** | No hooks required | Requires `useToast` hook |
| **Usage Outside React** | ✅ Yes | ❌ No |
| **Multiple Notifications** | Staggered cards, expand on hover | Standard queue |
| **Bundle Size** | Lightweight | Lightweight |
| **shadcn Integration** | Official | Manual |

### Implementation

```tsx
import { Toaster, toast } from "sonner"

// In app root
<Toaster position="top-right" />

// Trigger from anywhere
toast.success("Transaction confirmed!")
toast.error("Insufficient gas")
toast.loading("Mining transaction...")

// Promise-based (for async operations)
toast.promise(
  sendTransaction(),
  {
    loading: 'Sending transaction...',
    success: 'Transaction sent!',
    error: 'Failed to send transaction'
  }
)
```

### Use Cases for blockchain-playground

- ✅ **Transaction status updates** (pending → confirmed → success/fail)
- ✅ **Wallet connection feedback** (connected, disconnected, switched network)
- ✅ **Form validation errors** (inline for fields, toast for global errors)
- ✅ **Copy confirmation** ("Address copied to clipboard")
- ✅ **Gas estimation warnings** ("High gas fees detected")

### Sources
- [Comparing the top React toast libraries [2025 update] - LogRocket Blog](https://blog.logrocket.com/react-toast-libraries-compared-2025/)
- [Sonner - shadcn/ui](https://ui.shadcn.com/docs/components/radix/sonner)
- [Top 9 React notification libraries in 2026 | Knock](https://knock.app/blog/the-top-notification-libraries-for-react)
- [What's Your Go-To Notification Library for ReactJS?](https://github.com/orgs/community/discussions/168789)

---

## Modal, Dialog & Sheet Patterns

### When to Use Each (shadcn Patterns)

| Component | Use Case | Best For |
|-----------|----------|----------|
| **Dialog** | Centered modal | Desktop, critical actions, confirmations |
| **Drawer** | Slides from bottom | Mobile, quick actions, filters |
| **Sheet** | Slides from any side | Complementary content, side panels, navigation |

### Responsive Strategy

**Desktop**: Dialog (centered modal)
**Mobile**: Drawer (bottom sheet)

```tsx
import { useMediaQuery } from "@/hooks/use-media-query"

const isDesktop = useMediaQuery("(min-width: 768px)")

return isDesktop ? (
  <Dialog>
    <DialogContent>{content}</DialogContent>
  </Dialog>
) : (
  <Drawer>
    <DrawerContent>{content}</DrawerContent>
  </Drawer>
)
```

### Sheet Variants

**Side Positioning**:
- `side="top"` — Full-width header panels
- `side="right"` — Settings, filters, details (default)
- `side="bottom"` — Mobile actions, quick options
- `side="left"` — Navigation menus, sidebars

### Accessibility Features (Radix UI)

- ✅ **Focus trapping** — keyboard focus stays within modal
- ✅ **Escape to close** — ESC key dismisses
- ✅ **Scroll lock** — body scroll disabled when open
- ✅ **ARIA attributes** — proper role, aria-labelledby, aria-describedby

### Use Cases for blockchain-playground

| Feature | Component | Why |
|---------|-----------|-----|
| **Transaction details** | Sheet (right) | Complementary info, keeps main content visible |
| **Wallet connection** | Dialog (desktop), Drawer (mobile) | Critical action, responsive |
| **Settings** | Sheet (right) | Settings panel, non-blocking |
| **Demo instructions** | Dialog | Centered attention for tutorials |
| **Mobile filters** | Drawer (bottom) | Quick access, thumb-friendly |

### Sources
- [Shadcn Drawer](https://www.shadcn.io/ui/drawer)
- [Drawer - shadcn/ui](https://ui.shadcn.com/docs/components/radix/drawer)
- [Sheet - shadcn/ui](https://ui.shadcn.com/docs/components/radix/sheet)
- [Shadcn Dialog](https://www.shadcn.io/ui/dialog)
- [Creating Responsive Dialog and Drawer Components with shadcn](https://www.nextjsshop.com/resources/blog/responsive-dialog-drawer-shadcn-ui)
- [Exploring Drawer and Sheet Components in shadcn UI](https://medium.com/@enayetflweb/exploring-drawer-and-sheet-components-in-shadcn-ui-cf2332e91c40)

---

## Command Palette (⌘K / cmdk)

### Overview

**cmdk** (Command Menu Kit) is a headless React component library providing:
- ✅ **Fuzzy search** with keyboard navigation
- ✅ **Accessibility** (ARIA attributes, screen reader support)
- ✅ **Performance** (handles 2,000-3,000 items smoothly)
- ✅ **Customizable UI** (completely unstyled, bring your own design)

### Keyboard Shortcuts

**Activation**: `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)

**Navigation**:
- `↑` / `↓` — Navigate items
- `Enter` — Select item
- `Esc` — Close palette
- `Cmd+Shift+P` — Alternative activation (VSCode-style)

### Implementation Pattern

```tsx
import { Command } from "cmdk"
import { useState } from "react"

export function CommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <Command.Dialog open={open} onOpenChange={setOpen}>
      <Command.Input placeholder="Search demos..." />
      <Command.List>
        <Command.Group heading="Fundamentals">
          <Command.Item onSelect={() => navigate("/fundamentals/demo/hash")}>
            Hash Explorer
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  )
}
```

### Performance Optimization

**For Large Lists**:
- Implement debouncing for search (300-500ms)
- Use `useMemo` and `useCallback` for expensive operations
- Lazy load items or use virtualization for 3,000+ items

### Use Cases for blockchain-playground

- ✅ **Demo search** — Quick navigation to 55 demos across 5 tracks
- ✅ **Blockchain concepts** — Search by keyword (e.g., "merkle", "gas", "ecdsa")
- ✅ **Quick actions** — "Connect wallet", "Switch network", "Copy address"
- ✅ **Recent demos** — Show recently viewed demos
- ✅ **Multi-language search** — Support EN/KO search terms

### Sources
- [Shadcn Command](https://www.shadcn.io/ui/command)
- [Boost Your React App with a Sleek Command Palette Using cmdk](https://knowledge.buka.sh/boost-your-react-app-with-a-sleek-command-palette-using-cmdk/)
- [react-cmdk | Build your dream command palette](https://react-cmdk.com/)
- [Command-K Mastery: Unleashing the Power of CMDK in React](https://reactlibs.dev/articles/command-k-mastery-cmdk-react/)
- [GitHub - albingroen/react-cmdk](https://github.com/albingroen/react-cmdk)

---

## Table & Data Grid

### TanStack Table vs AG Grid

| Feature | TanStack Table | AG Grid |
|---------|---------------|----------|
| **Philosophy** | Headless, logic-only | Batteries-included, opinionated UI |
| **License** | MIT (100% free) | Community (free) + Enterprise (paid) |
| **Bundle Size** | Small, tree-shakable | Large, comprehensive |
| **Performance** | <10K rows (with virtualization) | >100K rows (built-in virtualization) |
| **Customization** | Complete UI control | Predefined themes, limited customization |
| **Learning Curve** | Steeper (bring your own UI) | Easier (UI out of the box) |

### Recommendation for blockchain-playground

**TanStack Table** is the clear choice:

**Rationale**:
- ✅ **100% free** — no licensing concerns for open-source project
- ✅ **Lightweight** — educational platform doesn't need enterprise features
- ✅ **Full design control** — matches existing Mantine + Tailwind design system
- ✅ **Moderate data size** — demos list ~55 items, well under 10K threshold
- ✅ **Modern stack alignment** — works seamlessly with React 19

**When to Consider AG Grid**:
- ❌ Massive datasets (>100K rows) — not applicable
- ❌ Enterprise features (pivot tables, Excel export) — not needed
- ❌ Out-of-the-box UI needed — blockchain-playground already has design system

### TanStack Table Implementation

```tsx
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"

const columns = [
  { accessorKey: "title", header: "Demo" },
  { accessorKey: "track", header: "Track" },
  { accessorKey: "difficulty", header: "Level" }
]

const table = useReactTable({
  data: demos,
  columns,
  getCoreRowModel: getCoreRowModel(),
})

return (
  <table>
    <thead>
      {table.getHeaderGroups().map(headerGroup => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map(header => (
            <th key={header.id}>
              {flexRender(header.column.columnDef.header, header.getContext())}
            </th>
          ))}
        </tr>
      ))}
    </thead>
    <tbody>
      {table.getRowModel().rows.map(row => (
        <tr key={row.id}>
          {row.getVisibleCells().map(cell => (
            <td key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
)
```

### Sources
- [TanStack Table vs AG Grid: Complete Comparison (2025)](https://www.simple-table.com/blog/tanstack-table-vs-ag-grid-comparison)
- [Top 5 AG Grid Alternatives in 2026](https://www.thefrontendcompany.com/posts/ag-grid-alternatives)
- [TanStack Table + Ag-Grid Partnership](https://tanstack.com/blog/ag-grid-partnership)
- [Build Tables in React: Data Grid Performance Guide](https://strapi.io/blog/table-in-react-performance-guide)
- [5 Best React Data Grid Libraries Every Developer Should Know in 2025](https://www.syncfusion.com/blogs/post/top-react-data-grid-libraries-2025)

---

## Copy/Paste UX

### Best Practices (2025-2026)

**Modern Clipboard API** (Async):
```tsx
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  } catch (err) {
    console.error("Failed to copy:", err)
    toast.error("Failed to copy")
  }
}
```

**HTTPS Requirement**: Clipboard API requires secure context (HTTPS or localhost)

### Visual Feedback Patterns

**Icon Transition** (Copy → Check):
```tsx
const [copied, setCopied] = useState(false)

const handleCopy = async () => {
  await copyToClipboard(code)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
}

return (
  <button onClick={handleCopy}>
    {copied ? <Check className="text-green-500" /> : <Copy />}
    {copied ? "Copied!" : "Copy"}
  </button>
)
```

**Color Feedback**:
- Default: `text-gray-500`
- Success: `text-green-500` (2 seconds, then revert)

### Syntax-Highlighted Code Handling

**Problem**: Code blocks contain HTML/CSS for syntax highlighting

**Solution**: Store raw code separately
```tsx
<pre>
  <code className="language-solidity">{highlightedCode}</code>
  <meta content={rawCode} data-raw />
  <button onClick={() => copyToClipboard(rawCode)}>Copy</button>
</pre>
```

### Accessibility (ARIA Live Regions)

```tsx
<button
  onClick={handleCopy}
  aria-label="Copy code to clipboard"
>
  Copy
  <span
    role="status"
    aria-live="polite"
    className="sr-only"
  >
    {copied ? "Code copied" : ""}
  </span>
</button>
```

**Best Practices**:
- `aria-live="polite"` — announces after current content
- `aria-live="assertive"` — interrupts screen reader (use sparingly)
- Icon + text combinations increase recognition speed by 89%

### Use Cases for blockchain-playground

- ✅ **Solidity code snippets** — copy contract code
- ✅ **Ethereum addresses** — copy wallet addresses, contract addresses
- ✅ **Transaction hashes** — copy tx hash for Etherscan
- ✅ **Private keys** (demo context) — copy test keys with warning
- ✅ **JSON outputs** — copy ABI, transaction receipts

### Sources
- [How to build a copy code snippet button and why it matters](https://whitep4nth3r.com/blog/how-to-build-a-copy-code-snippet-button/)
- [Copy to Clipboard Success Message: CSS, UX, and Best Practices for 2026](https://copyprogramming.com/howto/display-success-message-after-copying-url-to-clipboard)
- [Copy Code Button - David Bushell](https://dbushell.com/2025/02/14/copy-code-button/)
- [PatternFly • Clipboard copy](https://www.patternfly.org/components/clipboard-copy/)

---

## Stepper & Wizard Patterns

### Current React Patterns (2025)

**Popular Libraries**:
- **Material UI Stepper** — Most comprehensive
- **CoreUI React Stepper** — Lightweight
- **react-multistep v6** — Headless (UI-agnostic)

### Layout Options

**Horizontal** (Desktop):
```
[1] ─── [2] ─── [3] ─── [4]
 ✓     Active   Todo   Todo
```

**Vertical** (Mobile):
```
[1] ✓ Step 1
│
[2] ○ Step 2 (Active)
│
[3] ○ Step 3
│
[4] ○ Step 4
```

### Progress Indicators

**Variants**:
- **Numbers** — `[1] [2] [3]` (clear sequence)
- **Dots** — `● ● ○` (minimal, mobile-friendly)
- **Progress bar** — `███████░░░ 70%` (visual completion)

### Navigation Modes

**Linear** (Default):
```tsx
<Stepper activeStep={step} linear={true}>
  {/* Must complete step 1 before step 2 */}
</Stepper>
```

**Non-Linear** (Advanced):
```tsx
<Stepper activeStep={step} linear={false}>
  {/* Can skip between steps */}
</Stepper>
```

### Headless Pattern (react-multistep v6)

```tsx
import { MultiStep } from "react-multistep"

<MultiStep activeStep={step} onStepChange={setStep}>
  <MultiStep.Step>
    <h2>Step 1</h2>
    <p>Your content</p>
  </MultiStep.Step>
  <MultiStep.Step>
    <h2>Step 2</h2>
    <p>Your content</p>
  </MultiStep.Step>
  <MultiStep.Navigation>
    {({ prevStep, nextStep, isFirstStep, isLastStep }) => (
      <>
        {!isFirstStep && <button onClick={prevStep}>Back</button>}
        {!isLastStep && <button onClick={nextStep}>Next</button>}
        {isLastStep && <button>Finish</button>}
      </>
    )}
  </MultiStep.Navigation>
</MultiStep>
```

### Use Cases for blockchain-playground

**Multi-Step Learning Flows**:
- ✅ **Tutorial wizards** — Step 1: Connect Wallet → Step 2: Get Testnet Tokens → Step 3: Deploy Contract
- ✅ **Demo progression** — Read → Try → Deploy → Verify
- ✅ **Transaction flows** — Setup → Review → Sign → Confirm
- ✅ **Track progress** — Show completion across 11 demos in a track

**Design Considerations**:
- Use **horizontal stepper** on desktop for demo sequences
- Use **dots** for mobile (saves space)
- **Linear mode** for tutorials (enforce sequential learning)
- **Non-linear mode** for experienced users (allow jumping)

### Sources
- [React Stepper component - Material UI](https://mui.com/material-ui/react-stepper/)
- [React Stepper Component – Multi-Step Form Wizard for React - CoreUI](https://coreui.io/react/docs/forms/stepper/)
- [GitHub - srdjan/react-multistep: React multistep wizard component](https://github.com/srdjan/react-multistep)
- [32 Stepper UI Examples and What Makes Them Work](https://www.eleken.co/blog-posts/stepper-ui-examples)
- [React: Building a Multi-Step Form with Wizard Pattern](https://medium.com/@vandanpatel29122001/react-building-a-multi-step-form-with-wizard-pattern-85edec21f793)
- [How to Build Multi-Step Form with Progress Stepper in React](https://www.flexyui.com/blogs/react-multi-step-form)

---

## Blockchain-Specific UI Components

### Transaction Status Indicators

**Status States**:
- 🟡 **Pending** — Transaction submitted, waiting for confirmation
- 🔵 **Mining** — Transaction included in a block, awaiting finality
- 🟢 **Confirmed** — Transaction finalized (1+ confirmations)
- 🔴 **Failed** — Transaction reverted or rejected

**UI Pattern**:
```tsx
const statusConfig = {
  pending: { color: "yellow", icon: Clock, label: "Pending" },
  mining: { color: "blue", icon: Loader, label: "Mining" },
  confirmed: { color: "green", icon: Check, label: "Confirmed" },
  failed: { color: "red", icon: X, label: "Failed" }
}

<Badge color={statusConfig[status].color}>
  <statusConfig[status].icon className="animate-spin" />
  {statusConfig[status].label}
</Badge>
```

**Block Explorer Integration**:
```tsx
<a
  href={`https://sepolia.etherscan.io/tx/${txHash}`}
  target="_blank"
  rel="noopener noreferrer"
>
  View on Etherscan ↗
</a>
```

### Address Display Patterns

**Truncation** (readable):
```tsx
function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// "0x1234...abcd"
```

**ENS Resolution** (human-readable):
```tsx
import { useEnsName } from "wagmi"

const { data: ensName } = useEnsName({ address })

<span>{ensName || truncateAddress(address)}</span>
```

**Copy Button**:
```tsx
<div className="flex items-center gap-2">
  <code>{truncateAddress(address)}</code>
  <button onClick={() => copyToClipboard(address)}>
    <Copy size={16} />
  </button>
</div>
```

### Gas Estimation UI

**Display Pattern**:
```tsx
<div className="gas-estimate">
  <span>Estimated Gas: {gasEstimate} gwei</span>
  <span className={gasEstimate > 100 ? "text-red-500" : "text-green-500"}>
    {gasEstimate > 100 ? "⚠️ High fees" : "✓ Low fees"}
  </span>
</div>
```

### Wallet Balance Display

**Multi-Token Display**:
```tsx
import { useBalance } from "wagmi"

const { data: balance } = useBalance({ address })

<div>
  <p>{balance?.formatted} {balance?.symbol}</p>
  <p className="text-sm text-gray-500">${balance?.usdValue}</p>
</div>
```

### Network Indicator

**Current Network Badge**:
```tsx
import { useNetwork } from "wagmi"

const { chain } = useNetwork()

<Badge variant={chain?.testnet ? "warning" : "success"}>
  {chain?.name}
  {chain?.testnet && " (Testnet)"}
</Badge>
```

### Sources
- [Ethereum (ETH) Blockchain Explorer - Etherscan](https://etherscan.io/)
- [How do I find transaction information on a block explorer?](https://www.exodus.com/support/en/articles/8598818-how-do-i-find-transaction-information-on-a-block-explorer)
- [How to check my wallet activity on the blockchain explorer | MetaMask](https://support.metamask.io/more-web3/learn/how-to-check-my-wallet-activity-on-the-blockchain-explorer)
- [What Is a Block Explorer and Why It Matters](https://www.blog.blockscout.com/what-is-a-block-explorer-and-why-it-matters/)
- [Blockchain Transaction Visualizer - TxStreet.com](https://txstreet.com/)

---

## Tabs & Content Organization

### shadcn Tabs Patterns

**Basic Implementation**:
```tsx
<Tabs defaultValue="interactive">
  <TabsList>
    <TabsTrigger value="interactive">Interactive</TabsTrigger>
    <TabsTrigger value="learn">Learn</TabsTrigger>
    <TabsTrigger value="onchain">On-Chain</TabsTrigger>
  </TabsList>
  <TabsContent value="interactive">
    {/* Live demo */}
  </TabsContent>
  <TabsContent value="learn">
    {/* Explanation */}
  </TabsContent>
  <TabsContent value="onchain">
    {/* Blockchain interaction */}
  </TabsContent>
</Tabs>
```

### Variants

**Line Style** (minimal):
```tsx
<TabsList variant="line">
  {/* Underline indicator instead of filled background */}
</TabsList>
```

**Vertical Orientation** (sidebar):
```tsx
<Tabs orientation="vertical">
  {/* Stacked tabs on left, content on right */}
</Tabs>
```

### Segmented Controls vs Tabs

| Use Case | Component | Why |
|----------|-----------|-----|
| **3+ sections with distinct content** | Tabs | Clear separation, content panels |
| **2 options (e.g., list/grid view)** | Segmented Control | Lightweight toggle |
| **Data filtering** | Segmented Control | Compact, inline |
| **Page navigation** | Tabs | Full-page content switching |

### Accessibility Features

- ✅ **Keyboard navigation** — Arrow keys, Home/End
- ✅ **ARIA roles** — `role="tablist"`, `role="tab"`, `role="tabpanel"`
- ✅ **Focus management** — `aria-selected` updates on tab change
- ✅ **RTL support** — Automatic for right-to-left languages

### Use Cases for blockchain-playground

**Demo Organization**:
```
┌─────────────────────────────────────┐
│ [Interactive] [Learn] [On-Chain]    │  ← Tabs
├─────────────────────────────────────┤
│                                     │
│  Interactive Demo Component         │
│                                     │
└─────────────────────────────────────┘
```

**Track-Level Tabs**:
- ✅ **Interactive** — Live playground
- ✅ **Learn** — Conceptual explanation with diagrams
- ✅ **On-Chain** — Real blockchain interaction (wagmi hooks)

**Settings Tabs**:
- ✅ **General** — Language, theme
- ✅ **Wallet** — Connected wallets, networks
- ✅ **Advanced** — RPC URLs, developer options

### Sources
- [Tabs - shadcn/ui](https://ui.shadcn.com/docs/components/radix/tabs)
- [Tabs | HeroUI](https://www.heroui.com/docs/components/tabs)
- [Tabs UI design: Anatomy, UX, and use cases](https://www.setproduct.com/blog/tabs-ui-design)
- [Tabs UX: Best Practices, Examples, and When to Avoid Them](https://www.eleken.co/blog-posts/tabs-ux)
- [React Button Group - Segmented Control](https://www.shadcn.io/patterns/button-group-interactive-4)

---

## Web3 Integration (wagmi + viem + RainbowKit)

### The Modern Web3 Stack (2025-2026)

**Standard Architecture**:
```
wagmi (React hooks) → viem (Ethereum library) → RainbowKit (wallet UI)
```

**Why This Stack**:
- ✅ **40-50% faster time-to-market** vs custom implementation
- ✅ **Type-safe** — TypeScript-first design
- ✅ **Tree-shakable** — small bundle size (only import what you use)
- ✅ **Multi-chain** — supports 100+ networks
- ✅ **Auto-account management** — wagmi Config handles wallet state

### wagmi v2 + viem Integration

**Configuration**:
```tsx
import { createConfig, http } from "wagmi"
import { baseSepolia } from "wagmi/chains"

export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http()
  }
})
```

**React Hooks**:
```tsx
import { useAccount, useBalance, useWriteContract } from "wagmi"

function WalletInfo() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })

  if (!isConnected) return <button>Connect Wallet</button>

  return (
    <div>
      <p>Address: {address}</p>
      <p>Balance: {balance?.formatted} {balance?.symbol}</p>
    </div>
  )
}
```

**Contract Interaction**:
```tsx
const { writeContract } = useWriteContract()

const handleMint = async () => {
  writeContract({
    address: "0x...",
    abi: contractABI,
    functionName: "mint",
    args: [tokenId]
  })
}
```

### RainbowKit Wallet Connection

**Setup**:
```tsx
import '@rainbow-me/rainbowkit/styles.css'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'

<RainbowKitProvider>
  <App />
</RainbowKitProvider>
```

**Connect Button**:
```tsx
import { ConnectButton } from '@rainbow-me/rainbowkit'

<ConnectButton />
```

**Customization**:
```tsx
<ConnectButton.Custom>
  {({ account, chain, openAccountModal, openConnectModal, mounted }) => (
    <button onClick={account ? openAccountModal : openConnectModal}>
      {account ? `${account.displayName} on ${chain.name}` : "Connect Wallet"}
    </button>
  )}
</ConnectButton.Custom>
```

### RainbowKit UX Features (2025)

**Mobile Improvements**:
- ✅ **Horizontal scroll hints** for additional wallet connectors
- ✅ **Native mobile UI** (separate flow from desktop)
- ✅ **Deep linking** to wallet apps

**Education**:
- ✅ **Dedicated help section** explaining wallets
- ✅ **Download links** for supported wallets
- ✅ **Custom wallet lists** (reorder, filter, add new wallets)

**Theming**:
- ✅ **Light/dark mode** support
- ✅ **Custom themes** (brand colors, border radius, fonts)
- ✅ **Predefined themes** (default, rounded, minimal)

### Use Cases for blockchain-playground

| Feature | Stack Component | Implementation |
|---------|----------------|----------------|
| **Wallet connection** | RainbowKit | `<ConnectButton />` |
| **Read contract data** | wagmi | `useReadContract` hook |
| **Write to contract** | wagmi | `useWriteContract` hook |
| **Transaction status** | wagmi | `useWaitForTransactionReceipt` hook |
| **Network switching** | wagmi | `useSwitchChain` hook |
| **ENS resolution** | wagmi | `useEnsName`, `useEnsAvatar` hooks |
| **Sign messages** | wagmi | `useSignMessage` hook |

### Sources
- [Viem | Wagmi](https://wagmi.sh/react/guides/viem)
- [wagmi: React Hooks for Ethereum](https://0.12.x.wagmi.sh/)
- [Building Multi-Wallet Connection with Wagmi v2 & Viem](https://medium.com/@mirbasit01/building-multi-wallet-connection-with-wagmi-v2-viem-a-complete-developer-guide-a7bcf358ec2b)
- [Wagmi v2 & Viem Hooks Guide for React Applications](https://medium.com/@mirt11477/wagmi-v2-viem-hooks-guide-for-react-applications-1d7c6cd51768)
- [Connect Wallet | Wagmi](https://wagmi.sh/react/guides/connect-wallet)
- [GitHub - rainbow-me/rainbowkit](https://github.com/rainbow-me/rainbowkit)
- [RainbowKit: The Complete Wallet Connector Toolkit](https://medium.com/@BizthonOfficial/rainbowkit-the-complete-wallet-connector-toolkit-for-react-based-dapps-b8a06b717b4b)
- [RainbowKit by Rainbow](https://www.quicknode.com/builders-guide/tools/rainbowkit-by-rainbow)
- [RainbowKit](https://rainbowkit.com/)

---

## Animation Patterns (Framer Motion / Motion)

### Motion (Formerly Framer Motion) — 2025 Updates

**Recent Improvements** (v11, 2025):
- ✅ **React 19 compatibility** — concurrent rendering support
- ✅ **Layout animations** — smoother transitions for complex layouts
- ✅ **Performance enhancements** — better rendering pipeline for many elements
- ✅ **Scroll-linked animations** — improved performance for long pages
- ✅ **Velocity tracking** — more stable values for physics-based effects

**Adoption**: 30.6K GitHub stars, 8.1M weekly npm downloads

### Key Animation Patterns for Educational UI

**Enter/Exit Animations**:
```tsx
import { motion, AnimatePresence } from "framer-motion"

<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>
```

**Stagger Effects** (for lists):
```tsx
<motion.ul
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1 // 100ms delay between children
      }
    }
  }}
  initial="hidden"
  animate="visible"
>
  {items.map(item => (
    <motion.li
      key={item.id}
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
      }}
    >
      {item.title}
    </motion.li>
  ))}
</motion.ul>
```

**Gesture-Based Animations** (drag, hover, tap):
```tsx
<motion.div
  drag
  dragConstraints={{ left: 0, right: 300 }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Draggable element
</motion.div>
```

**Scroll-Linked Animations**:
```tsx
import { useScroll, useTransform } from "framer-motion"

const { scrollYProgress } = useScroll()
const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

<motion.div style={{ opacity }}>
  Fades out on scroll
</motion.div>
```

### Use Cases for blockchain-playground

**Demo Transitions**:
- ✅ **Page transitions** — smooth navigation between demos
- ✅ **Tab content** — fade/slide when switching tabs
- ✅ **Modal animations** — scale + fade for dialogs

**State Visualizations**:
- ✅ **Transaction flow** — animate blocks in blockchain visualization
- ✅ **Merkle tree construction** — animate node additions
- ✅ **Signature verification** — step-by-step animation

**Interactive Feedback**:
- ✅ **Button press** — `whileTap={{ scale: 0.95 }}`
- ✅ **Card hover** — `whileHover={{ y: -5, boxShadow: "..." }}`
- ✅ **Loading states** — spinner with `animate={{ rotate: 360 }}`

**Educational Animations**:
- ✅ **Concept reveals** — stagger effect for learning points
- ✅ **Code execution** — highlight lines sequentially
- ✅ **Error states** — shake animation for invalid input

### Performance Best Practices

**Optimize for 60fps**:
- Use `transform` and `opacity` (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left` (triggers layout)
- Use `will-change: transform` sparingly

**Reduce Motion** (accessibility):
```tsx
import { useReducedMotion } from "framer-motion"

const prefersReducedMotion = useReducedMotion()

<motion.div
  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
>
```

### Sources
- [Motion — JavaScript & React animation library](https://motion.dev)
- [Framer Motion React Animations | Refine](https://refine.dev/blog/framer-motion/)
- [A Guide to Framer Motion React Animation | Magic UI](https://magicui.design/blog/framer-motion-react)
- [10 Framer Motion Examples for Stunning React Animations](https://jana-portfolio-web.webflow.io/blog/framer-motion-web-animation-examples)
- [Beyond Eye Candy: Top 7 React Animation Libraries for Real-World Apps in 2026](https://www.syncfusion.com/blogs/post/top-react-animation-libraries)
- [Mastering Framer Motion: Advanced Animation Techniques for 2025](https://www.luxisdesign.io/blog/mastering-framer-motion-advanced-animation-techniques-for-2025)

---

## Recommendations for blockchain-playground

### Immediate Priorities (High Impact)

1. **✅ Add Sonner for Toast Notifications**
   - Replace any existing toast system with Sonner
   - Use for transaction status, wallet events, copy confirmations
   - Implement promise-based toasts for async operations

2. **✅ Implement Command Palette (⌘K)**
   - Enable quick navigation across 55 demos
   - Support EN/KO keyword search
   - Add quick actions (connect wallet, switch network)

3. **✅ Enhance Blockchain UI Components**
   - Transaction status indicators with color coding
   - Address truncation + ENS resolution
   - Gas estimation warnings
   - Copy buttons for addresses/hashes

4. **✅ Add Code Copy Buttons**
   - All Solidity code snippets need copy functionality
   - Use modern Clipboard API with visual feedback
   - Ensure ARIA live regions for accessibility

### Medium Priority (Enhanced UX)

5. **Consider CodeMirror 6 Integration**
   - If planning editable code playgrounds, use CodeMirror 6
   - Much lighter than Monaco Editor
   - Better mobile support for educational use case

6. **Improve Modal/Drawer Patterns**
   - Use Dialog for desktop transaction confirmations
   - Use Drawer for mobile filter panels
   - Use Sheet for settings/details sidebars

7. **Add Stepper Components**
   - Multi-step tutorial flows (e.g., Deploy Contract wizard)
   - Track progress visualization across demo sequences
   - Linear mode for guided learning paths

8. **Enhance Form Validation**
   - Already using react-hook-form (good!)
   - Add Zod for runtime validation + TypeScript inference
   - Implement inline validation for transaction forms

### Future Enhancements (Nice-to-Have)

9. **Interactive Animations (Framer Motion)**
   - Animate blockchain state transitions
   - Merkle tree construction visualizations
   - Transaction flow diagrams

10. **TanStack Table for Demo Listings**
    - If adding filterable/sortable demo tables
    - Free, lightweight, full design control
    - Works seamlessly with Mantine + Tailwind

11. **Responsive Tab System**
    - Organize demos into [Interactive] [Learn] [On-Chain] tabs
    - Use segmented controls for view toggles (list/grid)

12. **Advanced Web3 Features**
    - Already using wagmi v2 + RainbowKit (excellent!)
    - Add ENS name display in wallet UI
    - Implement transaction history with pagination

---

## Implementation Checklist

### Phase 1: Core UX Improvements
- [ ] Install Sonner: `pnpm add sonner`
- [ ] Add `<Toaster />` to app root
- [ ] Replace existing toast calls with `toast.success()`, `toast.error()`, etc.
- [ ] Implement copy-to-clipboard with Sonner feedback

### Phase 2: Navigation & Discoverability
- [ ] Install cmdk: `pnpm add cmdk`
- [ ] Create `<CommandPalette />` component
- [ ] Add ⌘K keyboard shortcut listener
- [ ] Index all 55 demos for search
- [ ] Add i18n support (EN/KO keywords)

### Phase 3: Blockchain UI Polish
- [ ] Create `<TransactionStatus />` component with color-coded badges
- [ ] Create `<AddressDisplay />` with truncation + ENS + copy
- [ ] Create `<GasEstimate />` with warning thresholds
- [ ] Create `<NetworkBadge />` showing current chain

### Phase 4: Code Playground (Optional)
- [ ] Install CodeMirror 6: `pnpm add @uiw/react-codemirror @codemirror/lang-javascript`
- [ ] Create `<CodeEditor />` component for Solidity
- [ ] Add syntax highlighting theme
- [ ] Implement read-only mode for examples

### Phase 5: Forms & Validation
- [ ] Install Zod: `pnpm add zod @hookform/resolvers`
- [ ] Define Zod schemas for transaction forms
- [ ] Add inline validation error display
- [ ] Implement cross-field validation (e.g., balance checks)

---

## Conclusion

The blockchain-playground project is well-positioned to adopt modern UI patterns:

**Current Strengths**:
- ✅ Using wagmi v2 + viem + RainbowKit (industry standard)
- ✅ Using react-hook-form (best-in-class form library)
- ✅ Using Mantine v7 + Tailwind CSS (solid foundation)
- ✅ Using Vitest + Playwright (comprehensive testing)

**Key Gaps to Address**:
- ❌ No toast notification system → Add Sonner
- ❌ No command palette for 55 demos → Add cmdk
- ❌ No copy-to-clipboard UX → Add Clipboard API with feedback
- ❌ No code editor for playgrounds → Consider CodeMirror 6

**Strategic Recommendations**:
1. **Prioritize UX over features** — 55 demos are complete, now polish discoverability and interaction patterns
2. **Mobile-first** — Educational platforms need excellent mobile UX
3. **Accessibility** — ARIA attributes, keyboard navigation, reduced motion support
4. **Performance** — Keep bundle size low with tree-shaking and lazy loading

By implementing these patterns, blockchain-playground will deliver a best-in-class educational experience that rivals top developer tools like TypeScript Playground and Rust Playground.

---

**Research completed by**: p-research-interaction-ui
**Date**: 2026-02-09
**Total sources**: 80+ web searches and fetches
