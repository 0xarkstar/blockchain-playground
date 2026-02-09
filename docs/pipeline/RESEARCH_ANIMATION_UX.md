# Frontend Animation & Micro-Interaction Trends: 2025-2026

## Executive Summary

The animation landscape in 2025-2026 is defined by three major shifts: (1) Motion (formerly Framer Motion) has become the dominant React animation library with 8.1M weekly downloads and broad ecosystem support, (2) native browser APIs like View Transitions and scroll-driven animations are reaching production-ready status with 86%+ browser support, and (3) zero-config solutions like AutoAnimate are gaining traction for common UI patterns. Performance-first, accessibility-aware approaches are now table stakes, with prefers-reduced-motion support and 60fps requirements becoming industry standards.

## Animation Library Landscape

### Motion (Formerly Framer Motion)

**Status**: De-facto standard for React animations in 2026

**Key Stats**:
- 30.6k+ GitHub stars
- 8.1M weekly NPM downloads
- Growing exponentially as the most-used and fastest-growing animation library
- MIT open source, supported by Framer, Figma, and Tailwind CSS

**Strengths**:
- **Declarative API**: Define animations directly in JSX with clean, intuitive syntax
- **Layout & Transitions**: Automatic layout animations when components change size or position
- **Gesture Support**: Built-in drag, hover, tap, and scroll-based interactions
- **SVG & Scroll**: First-class support for SVG motion paths and scroll-linked effects
- **Hybrid Engine**: Combines native browser animation performance with JavaScript flexibility
- **Modern React Integration**: Seamless with Next.js and server-component architectures

**When to Use**:
- Primary choice for React/Next.js projects
- Complex interactive dashboards
- Marketing sites with orchestrated motion
- Projects requiring gesture interactions
- Apps needing layout transitions

**Trade-offs**:
- React-only (doesn't work with Vue, Angular, vanilla JS)
- Larger bundle size than AutoAnimate
- More configuration needed than zero-config alternatives

### AutoAnimate

**Status**: Rising star for zero-config animations

**Key Stats**:
- 13k+ GitHub stars
- 200k+ weekly NPM downloads
- 1.9KB bundle size (extremely lightweight)
- Zero configuration required

**Strengths**:
- **One-Line Implementation**: Literally `const [parent] = useAutoAnimate()`
- **FLIP Technique**: Automatic smooth transitions using First, Last, Invert, Play
- **Framework Agnostic**: Works with React, Vue, or any JavaScript framework
- **Auto DOM Observation**: Detects additions, removals, reordering and animates automatically

**When to Use**:
- 90% of standard UI interactions (dropdowns, lists, tabs)
- Internal tools and admin panels
- Rapid prototyping
- Projects where polish is desired without complexity
- Lists, tables, expandable sections

**Trade-offs**:
- No spring physics customization
- Limited control over animation details
- Not suitable for highly complex orchestrated animations

### GSAP

**Status**: Industry standard for complex animations, framework-agnostic

**Key Stats**:
- Most powerful performance-oriented library
- Wide browser support
- Used by major brands and agencies

**Strengths**:
- **Maximum Control**: Complex timelines and sequencing
- **Exceptional Performance**: Optimized for complex scenarios
- **Framework Compatibility**: Works with React, Vue, Astro, vanilla JS
- **ScrollTrigger**: Industry-leading scroll animation plugin

**When to Use**:
- Complex timeline-based animations
- Marketing sites with sophisticated motion
- Multi-framework projects
- Maximum browser compatibility needed
- Advanced scroll-driven experiences

**Trade-offs**:
- **Closed Source**: Owned by Webflow
- **License Restrictions**: Prohibits use in tools competing with Webflow
- **Imperative API**: Less natural in React compared to Motion's declarative approach
- **Commercial License**: Required for certain use cases

### Motion One

**Note**: Motion One appears to be an earlier iteration or related library to Motion (formerly Framer Motion). The current ecosystem has consolidated around Motion as the primary brand and library. References to "Motion One" in older documentation likely refer to what is now simply called Motion.

### tw-animate-css

**Status**: Official Tailwind CSS v4.0 animation solution

**Key Stats**:
- Replaced tailwindcss-animate in shadcn/ui
- Pure CSS-first architecture
- Tree-shaking optimization
- Zero JavaScript runtime

**Strengths**:
- **CSS-First**: Embraces Tailwind v4's new architecture
- **Tree-Shaking**: Unused animations excluded from final CSS
- **Ready-to-Use**: Includes accordion-down, accordion-up, caret-blink
- **Custom Utilities**: Easy to create custom animations
- **Zero Runtime**: Pure CSS, no JavaScript overhead

**When to Use**:
- Tailwind v4 projects
- Simple enter/exit animations
- Projects prioritizing minimal JavaScript
- shadcn/ui-based applications

**Trade-offs**:
- Limited to CSS animation capabilities
- No gesture or scroll integration
- Less dynamic than JavaScript solutions

## Browser-Native Animations

### View Transitions API

**Browser Support**: Chromium browsers (Chrome, Edge); Firefox lacks support

**Status**: Experimental in Next.js, production-ready in Chromium

**Implementation in Next.js**:
```javascript
// next.config.js
module.exports = {
  experimental: {
    viewTransition: true
  }
}
```

**Third-Party Solutions**:
- **next-view-transitions**: Popular library for easier integration
- **Custom Context Solutions**: Framework-agnostic implementations

**Strengths**:
- Native browser API, zero dependencies
- Seamless transitions between UI states
- Automatic cross-fade for unmapped elements
- Shared element transitions

**When to Use**:
- Next.js App Router projects (with experimental flag)
- Chromium-only applications
- Progressive enhancement scenarios
- Simple page transitions

**Trade-offs**:
- Limited browser support (no Firefox, Safari improving)
- Still experimental in frameworks
- API may change
- Fallback strategies needed

### Scroll-Driven Animations

**Browser Support**:
- Chrome: ✅ Fully supported
- Safari: ✅ Supported as of Safari 26
- Firefox: ⚠️ Supported with flag enabled

**Status**: Production-ready with progressive enhancement

**Key Features**:
- **Scroll Progress Timeline**: Animations linked to scroll position
- **View Progress Timeline**: Animations based on element visibility in viewport
- **CSS-Only**: No JavaScript required

**Best Practices**:

1. **Set Duration**: Always use `animation-duration: 1ms` for Firefox compatibility
2. **GPU Properties**: Stick to transforms, opacity, filters for 60fps
3. **Accessibility**: Wrap in `@media (prefers-reduced-motion: no-preference)`
4. **Declaration Order**: Place `animation-timeline` AFTER `animation` shorthand
5. **Progressive Enhancement**: Wrap in `@supports` rule

**Example**:
```css
@supports (animation-timeline: scroll()) {
  @media (prefers-reduced-motion: no-preference) {
    .fade-in {
      animation: fadeIn 1ms linear;
      animation-timeline: view();
      animation-range: entry 0% cover 30%;
    }
  }
}
```

**When to Use**:
- Parallax effects
- Fade-in on scroll
- Progress indicators
- Scroll-linked reveals
- Hero animations

**Trade-offs**:
- Firefox requires feature flag (January 2026)
- Requires progressive enhancement strategy
- CSS-only limits dynamic behavior

### CSS @starting-style

**Browser Support**: 86% (Baseline since August 2024)

**Status**: Production-ready for entry animations

**Purpose**: Solves the classic "element entry animation" problem by providing explicit initial state

**Key Features**:
- Enables smooth transitions when mounting elements
- Works with CSS transitions (not animations)
- Eliminates JavaScript timeout hacks
- Supports tree counting functions for staggered animations

**Example**:
```css
.dialog {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.3s, transform 0.3s;
}

@starting-style {
  .dialog {
    opacity: 0;
    transform: translateY(-20px);
  }
}
```

**When to Use**:
- Modal/dialog entry animations
- Dropdown menus
- Tooltip appearances
- First-render transitions
- Dynamic content insertion

**Trade-offs**:
- Only for transitions, not CSS animations
- Relatively new (86% support)
- Requires understanding of transition timing

## Page & Route Transitions

### Current State in Next.js App Router

**Challenge**: App Router made page transitions more difficult than Pages Router. Most solutions handle "enter" transitions but struggle with "exit" animations.

### Official Approach: View Transitions API

```javascript
// next.config.js
module.exports = {
  experimental: {
    viewTransition: true
  }
}
```

**Status**: Experimental, minimally documented, still evolving

**Browser Support**: Chromium only

### Third-Party Solutions

1. **next-transition-router**
   - Integrates with GSAP, Framer Motion, or any animation library
   - Handles both enter and exit transitions
   - Active community support

2. **Framer Motion + AnimatePresence**
   - Delays routing to allow exit animations
   - Full control over animation orchestration
   - Requires more setup

3. **Custom Context Solutions**
   - No dependencies, full control
   - More implementation work
   - Can achieve complex effects

### Recommended Patterns

**For Simple Transitions**:
- Use View Transitions API with progressive enhancement
- Fallback to instant transitions in unsupported browsers

**For Complex Transitions**:
- next-transition-router + Motion for full orchestration
- Shared layout components for persistent elements
- Route-specific animation variants

**Performance Considerations**:
- Keep transitions under 300ms
- Use transform/opacity only
- Preload next route data
- Show loading states immediately

## Skeleton & Loading Patterns

### Modern Approaches

**Philosophy**: Shimmer UI provides improved perception by giving the illusion that something is actively loading, mimicking the structure of real content while offering a polished look that users associate with top-tier apps.

### Key Benefits

1. **Visual Stability**: Prevents layout shifts as content loads
2. **Perceived Performance**: Makes load times feel 47% shorter
3. **Premium Feel**: Users associate with high-quality apps (Facebook, LinkedIn)
4. **Reduced Cognitive Load**: Users know where content will appear

### Animation Techniques

**Popular Effects**:
- **Wave**: Gradient sweeps across skeleton (most common)
- **Pulse**: Gentle opacity fade in/out
- **Fade**: Simple opacity transition

**Best Effect**: Wave with shimmer provides the best perceived loading progress

### Implementation Options

1. **react-loading-skeleton**
   - Built-in shimmer animation
   - Auto-adapts to content structure
   - 1M+ weekly downloads

2. **shimmer-from-structure**
   - Universal for React, Vue, Angular, Svelte
   - Analyzes runtime DOM structure
   - Generates pixel-perfect skeletons
   - Zero maintenance

3. **Custom CSS**
   - Full control
   - Tailwind-compatible
   - No dependencies

### Best Practices

1. **Match Real Layout**: Skeleton should closely match final content
2. **Consistent Timing**: Use same animation duration across app
3. **Accessibility**: Respect prefers-reduced-motion
4. **Progressive Rendering**: Show partial content as it loads
5. **Realistic Shapes**: Use rounded corners, proper spacing
6. **Color Contrast**: Ensure skeleton is visible but not distracting

**Recommended Animation Duration**: 1.5-2 seconds for shimmer cycle

## Micro-Interaction Patterns

### Definition

Micro-interactions are subtle, often unnoticed animations or visual responses that occur within a user interface, providing instant feedback and enhancing user understanding of what is happening on the screen.

### Button Feedback

**Patterns**:
- **Hover**: Scale (1.02-1.05) or brightness increase
- **Active/Press**: Scale down (0.95-0.98) + slight opacity reduction
- **Loading**: Spinner or pulse animation
- **Success**: Checkmark animation with color change
- **Error**: Shake animation (3-5px horizontal movement)

**Timing**:
- Hover: 150-200ms
- Press: 100-150ms
- Loading: Continuous until complete
- Success/Error: 300-500ms

**Best Practices**:
- Always provide feedback within 100ms
- Use haptic feedback on mobile when available
- Disable button during processing to prevent double-clicks
- Clear visual state distinction (idle, hover, active, disabled, loading)

### Form Validation

**Patterns**:
- **Real-time Validation**: Validate on blur, show errors on submit
- **Error Animation**: Shake input + red border + icon
- **Success Animation**: Checkmark + green border
- **Character Counter**: Animated progress bar or number
- **Password Strength**: Animated strength meter

**Micro-interaction Enhancements**:
- Animated checkmarks for valid fields
- Shaking fields for errors (3-5px, 300ms)
- Color transitions (border, background, text)
- Icon animations (error icon, success checkmark)
- Label floating animations

**Best Practices**:
- Don't interrupt typing with error messages
- Use inline validation for instant feedback
- Clear error messages with suggested fixes
- Animate error appearance (fade or slide)
- Remove errors as user corrects them

### Toast/Notification Animations

**Entry Patterns**:
- Slide from edge (top, right, bottom)
- Fade in with subtle scale
- Bounce entrance (use sparingly)

**Exit Patterns**:
- Fade out
- Slide out to origin
- Shrink and fade

**Timing**:
- Entry: 300-500ms
- Display: 3-5 seconds (error: 7+ seconds)
- Exit: 300-400ms
- User can dismiss immediately

**Statistics**: Interfaces appear 47% more responsive when toast messages include smooth entrance and exit animations.

**Best Practices**:
- Position consistently (usually top-right or top-center)
- Stack notifications vertically
- Auto-dismiss success, keep errors until dismissed
- Pause auto-dismiss on hover
- Include undo option for destructive actions
- Maximum 3 visible toasts

### Tooltip Animations

**Patterns**:
- Fade in with 100-200ms delay
- Slight scale (0.95 → 1.0)
- Slide in direction of anchor (8-12px)

**Timing**:
- Delay: 500ms hover before show
- Entry: 150-200ms
- Exit: 100-150ms (instant on mouse leave)

### The 3-Second Rule

**Principle**: UI animations should never take longer than 3 seconds total. Micro-interactions specifically should be under 500ms.

**Optimal Timing Ranges**:
- **Fast (0.2-0.5s)**: Conveys efficiency, immediacy
- **Medium (0.6-1.0s)**: Deliberate, gentle actions
- **Navigation (0.3-0.5s)**: Menu transitions, page changes

## Best-in-Class Examples

### Developer Tools & Education Platforms

1. **Raycast**
   - Productivity launcher with seamless animations
   - Keyboard-first interactions with instant feedback
   - Native feel with React + TypeScript UI components
   - 40% productivity gain for Vercel engineers
   - Smooth list filtering and command palette

2. **Vercel**
   - Deployment status animations
   - Real-time build logs with smooth scrolling
   - Subtle hover states on interactive elements
   - Fast page transitions
   - Loading states that feel immediate

3. **Linear**
   - Industry-leading animation polish
   - Gesture-based interactions
   - Smooth issue dragging and reordering
   - Keyboard shortcuts with visual feedback
   - Premium feel throughout

4. **animations.dev**
   - "Best animation course on the web"
   - Teaches why/when animations enrich UX
   - Theory + practice approach
   - Interactive examples

5. **Rive Academy**
   - Interactive animation courses
   - Design, animate, prototype workflow
   - Production-ready animation techniques

### Educational Website Examples

1. **Coursera**
   - Clean visual hierarchy
   - Minimal but effective transitions
   - Focus on content over decoration
   - Progressive disclosure animations

2. **Codecademy**
   - Interactive learning modules
   - Immediate feedback animations
   - Personalized quiz interactions
   - Smooth navigation between lessons

### Common Patterns in Best Examples

- **Immediate Feedback**: All interactions acknowledged within 100ms
- **Subtle, Not Showy**: Animations enhance, don't distract
- **Consistent Timing**: Same duration/easing across similar actions
- **Performance-First**: 60fps on all interactions
- **Keyboard-Aware**: Visual feedback for keyboard users
- **Loading States**: Never show blank screens
- **Optimistic UI**: Assume success, rollback if needed

## Performance Best Practices

### The 60fps Standard

**Requirement**: Animations must render within 16.7ms per frame (60fps)

**GPU-Friendly Properties** (Always Use):
- `transform` (translate, rotate, scale)
- `opacity`
- `filter` (some filters)

**CPU-Heavy Properties** (Avoid):
- `width`, `height`
- `top`, `left`, `margin`, `padding`
- `box-shadow`
- `border-radius` (during animation)

### Optimization Techniques

1. **GPU Compositing**:
```css
.animated-element {
  will-change: transform;
  /* or */
  transform: translateZ(0);
}
```

2. **Batching Updates**:
- Use `requestAnimationFrame` for JavaScript animations
- Batch DOM reads and writes
- Avoid layout thrashing

3. **Hybrid Engine Approach** (Motion):
- Uses native browser animations when possible
- Falls back to JavaScript for complex cases
- Automatically optimizes based on animation type

### Accessibility: prefers-reduced-motion

**Critical Requirement**: All animations must respect user preferences

**Implementation**:
```css
@media (prefers-reduced-motion: no-preference) {
  /* Normal animations */
  .element {
    transition: transform 0.3s ease;
  }
}

@media (prefers-reduced-motion: reduce) {
  /* Instant changes or subtle animations */
  .element {
    transition: none;
  }
}
```

**Statistics**: 18% of users have accessibility preferences enabled, including reduced motion.

**Fallback Strategies**:
- Instant state changes (no animation)
- Opacity-only transitions (less jarring than movement)
- Shorter durations (under 100ms)

### File Size & Performance Budget

**Bundle Size Considerations**:
- AutoAnimate: 1.9KB (excellent for simple cases)
- Motion: ~30KB (worth it for complex apps)
- GSAP: ~50KB core (powerful but heavy)
- tw-animate-css: 0KB JavaScript (CSS-only)

**Recommendations**:
- Use tw-animate-css for simple transitions
- Add AutoAnimate for list/DOM animations
- Upgrade to Motion when needing gestures, layout, or scroll
- Reserve GSAP for marketing sites with complex timelines

### Progressive Enhancement

**Strategy**: Build with native CSS first, enhance with JavaScript

```css
/* Base: Instant transition */
.element {
  opacity: 0;
}
.element.visible {
  opacity: 1;
}

/* Enhanced: Smooth animation */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .element {
      animation: fadeIn 1ms linear;
      animation-timeline: view();
    }
  }
}
```

### When Animations Hurt UX

**Anti-Patterns**:
- **Too Slow**: Animations over 500ms for micro-interactions
- **Blocking**: Animations that prevent interaction
- **Excessive**: Animating everything on the page
- **Janky**: Animations that drop below 30fps
- **Distracting**: Motion that pulls focus from content
- **Inconsistent**: Different timings/easings for similar actions

**Testing Checklist**:
- [ ] Runs at 60fps on low-end devices
- [ ] Respects prefers-reduced-motion
- [ ] Doesn't block user interaction
- [ ] Enhances understanding (not decoration)
- [ ] Under 500ms for micro-interactions
- [ ] Consistent timing across similar actions

## Recommendations for blockchain-playground

### Immediate Wins (Low Effort, High Impact)

1. **Add AutoAnimate to existing lists and dynamic content**
   ```bash
   pnpm add @formkit/auto-animate
   ```
   - Apply to demo lists, wallet connection flows, transaction histories
   - One-line implementation: `const [parent] = useAutoAnimate()`
   - Instant polish for 90% of UI interactions

2. **Migrate to tw-animate-css (Tailwind v4 Ready)**
   - Already using Tailwind, perfect fit
   - Replace any existing animation utilities
   - Zero JavaScript overhead
   - Aligns with shadcn/ui ecosystem

3. **Implement Skeleton Loading for Web3 Operations**
   - Wallet connection states
   - Transaction pending states
   - Contract data fetching
   - Use react-loading-skeleton or custom CSS with Tailwind

4. **Add Micro-Interactions to Key Actions**
   - Button feedback on wallet connect/disconnect
   - Transaction submission success/error states
   - Form validation animations
   - Toast notifications for blockchain events

### Medium-Term Enhancements

5. **Adopt Motion for Complex Interactions**
   - Demo-specific animations (hash visualization, merkle tree building)
   - Gesture-based interactions for mobile
   - Layout transitions between demos
   - Scroll-linked visualizations

6. **Implement View Transitions API (Progressive Enhancement)**
   ```javascript
   // next.config.js
   experimental: { viewTransition: true }
   ```
   - Page transitions between demos
   - Track navigation animations
   - Fallback for non-Chromium browsers

7. **Add Scroll-Driven Animations for Landing Pages**
   - Fade-in track cards on scroll
   - Parallax hero section
   - Progress indicators
   - Use native CSS with `animation-timeline: view()`

### Advanced Features (Future)

8. **Educational Visualizations with Motion**
   - Animated blockchain consensus visualizations
   - Interactive cryptography demonstrations
   - Step-by-step smart contract execution
   - Real-time gas price animations

9. **Staggered Animations for Lists**
   - Demo card grid entrance
   - Transaction history items
   - Wallet balance updates
   - Use AutoAnimate or Motion's stagger utilities

10. **Accessibility-First Approach**
    - Wrap all animations in `prefers-reduced-motion` checks
    - Provide instant alternatives
    - Test with reduced motion enabled
    - Document animation accessibility in CLAUDE.md

### Priority Implementation Order

**Phase 1: Foundation (Week 1)**
1. Install AutoAnimate → Apply to all lists/dynamic content
2. Set up tw-animate-css → Replace existing animations
3. Add prefers-reduced-motion support globally

**Phase 2: Feedback (Week 2)**
1. Implement button micro-interactions
2. Add form validation animations
3. Create toast notification system
4. Design skeleton loading components

**Phase 3: Transitions (Week 3)**
1. Enable View Transitions API (experimental)
2. Add page transition fallbacks
3. Implement route-change loading states

**Phase 4: Enhancement (Week 4+)**
1. Add scroll-driven animations to landing
2. Upgrade complex demos to Motion
3. Create educational visualizations
4. Performance audit and optimization

### Technical Stack Recommendations

**Primary Animation Library**: Motion (formerly Framer Motion)
- Already React/Next.js based ✅
- Excellent ecosystem support ✅
- Handles complex educational visualizations ✅

**Quick Wins**: AutoAnimate
- Zero config for instant polish ✅
- Perfect for admin/internal pages ✅
- Minimal bundle impact (1.9KB) ✅

**CSS Animations**: tw-animate-css
- Tailwind v4 ready ✅
- Zero JavaScript ✅
- shadcn/ui aligned ✅

**Native APIs**: View Transitions + Scroll-Driven
- Progressive enhancement ✅
- Future-proof ✅
- Performance benefits ✅

**Avoid**:
- GSAP (closed source, Webflow restrictions, overkill for education platform)
- Heavy animation frameworks (file size matters for education site)

### Animation Design System

Create consistent timing/easing variables:

```css
/* globals.css */
:root {
  --duration-instant: 0ms;
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;

  --easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --easing-decelerate: cubic-bezier(0, 0, 0.2, 1);
  --easing-accelerate: cubic-bezier(0.4, 0, 1, 1);
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast: 0ms;
    --duration-normal: 0ms;
    --duration-slow: 0ms;
  }
}
```

### Success Metrics

**Measure**:
- Time to interactive (should not increase)
- Perceived loading time (user surveys)
- Bounce rate on demo pages
- Animation frame rate (target: 60fps)
- Accessibility compliance (100% prefers-reduced-motion support)

**Goals**:
- 47% perceived performance improvement (industry benchmark)
- Zero janky animations (all 60fps)
- 100% accessibility compliance
- Under 5KB total animation JavaScript (use CSS where possible)

## Sources

### Animation Libraries
- [GSAP vs. Framer Motion: A Comprehensive Comparison | Medium](https://tharakasachin98.medium.com/gsap-vs-framer-motion-a-comprehensive-comparison-0e4888113825)
- [GSAP vs Motion: A detailed comparison | Motion](https://motion.dev/docs/feature-comparison)
- [Web Animation for Your React App: Framer Motion vs GSAP - Semaphore](https://semaphore.io/blog/react-framer-motion-gsap)
- [Comparing the best React animation libraries for 2026 - LogRocket](https://blog.logrocket.com/best-react-animation-libraries/)
- [Motion — JavaScript & React animation library](https://motion.dev)
- [Motion for React — Install & first React animation | Motion](https://motion.dev/docs/react)
- [Beyond Eye Candy: Top 7 React Animation Libraries for Real-World Apps in 2026 | Syncfusion](https://www.syncfusion.com/blogs/post/top-react-animation-libraries)

### AutoAnimate
- [Introducing AutoAnimate — add motion to your apps with a single line of code - DEV](https://dev.to/justinschroeder/introducing-autoanimate-add-motion-to-your-apps-with-a-single-line-of-code-34bp)
- [AutoAnimate - Add motion to your apps with a single line of code](https://auto-animate.formkit.com/)
- [Animate React components using AutoAnimate - LogRocket](https://blog.logrocket.com/animate-react-components-using-autoanimate/)
- [Auto Animate: Low Config Animations for React | Medium](https://medium.com/@samwyndhamii/auto-animate-low-config-animations-for-react-e695413c70f4)

### Tailwind CSS Animations
- [GitHub - Wombosvideo/tw-animate-css](https://github.com/Wombosvideo/tw-animate-css)
- [tw-animate-css - npm](https://www.npmjs.com/package/tw-animate-css)
- [Tailwind CSS Animations: Tutorial and 40+ Examples - Prismic](https://prismic.io/blog/tailwind-animations)
- [Tailwind Animation Utilities: Complete Guide & Demos | Tailkits](https://tailkits.com/blog/tailwind-animation-utilities/)

### View Transitions API
- [next.config.js: viewTransition | Next.js](https://nextjs.org/docs/app/api-reference/config/next-config-js/viewTransition)
- [View Transition API and its Integration in NextJS - Premier Octet](https://www.premieroctet.com/blog/en/view-transition-api-in-next-js-and-react)
- [GitHub - shuding/next-view-transitions](https://github.com/shuding/next-view-transitions)
- [View Transitions in React, Next.js, and Multi-Page Apps](https://rebeccamdeprey.com/blog/view-transition-api)
- [Next.js View Transitions API - LogRocket](https://blog.logrocket.com/nextjs-view-transitions-api/)

### Scroll-Driven Animations
- [CSS scroll-driven animations - CSS | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)
- [Scroll-driven animation timelines - CSS | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations/Timelines)
- [An Introduction To CSS Scroll-Driven Animations - Smashing Magazine](https://www.smashingmagazine.com/2024/12/introduction-css-scroll-driven-animations/)
- [A complete guide to CSS Scroll-driven Animations | Medium](https://marianabeldi.medium.com/a-complete-guide-to-css-scroll-driven-animations-9c995689bc58)
- [Animate elements on scroll with Scroll-driven animations | Chrome](https://developer.chrome.com/docs/css-ui/scroll-driven-animations)

### Page Transitions
- [In-and-Out Page Transitions and Next.js App Router - Medium](https://medium.com/@camille.fontaine93/in-and-out-page-transitions-and-next-js-app-router-62f2b1637ad8)
- [Transition Router - page transitions in Next.js App Router](https://next-transition-router.vercel.app/)
- [GitHub - ismamz/next-transition-router](https://github.com/ismamz/next-transition-router)
- [Page Transitions In Next.js 13 With App Router - PlainEnglish](https://plainenglish.io/blog/page-transitions-in-next-js-13)
- [How to Make Creative Page Transitions using Next.js and Framer Motion](https://blog.olivierlarose.com/articles/nextjs-page-transition-guide)

### Skeleton Loading
- [Handling React loading states with React Loading Skeleton - LogRocket](https://blog.logrocket.com/handling-react-loading-states-react-loading-skeleton/)
- [Implementing Skeleton Screen In React - Smashing Magazine](https://www.smashingmagazine.com/2020/04/skeleton-screens-react/)
- [GitHub - darula-hpp/shimmer-from-structure](https://github.com/darula-hpp/shimmer-from-structure)
- [How to Handle Loading States UI Effectively (Shimmer UI Tutorial)](https://www.vishalgarg.io/articles/handle-loading-states-effectively-with-shimmer-ui)
- [GitHub - dvtng/react-loading-skeleton](https://github.com/dvtng/react-loading-skeleton)

### Micro-Interactions
- [Mastering Micro-Interactions: Small Details, Big Impact | Medium](https://medium.com/@david-supik/mastering-micro-interactions-small-details-big-impact-fe209396a099)
- [Micro-Interactions Explained - DEV](https://dev.to/parth_g/micro-interactions-explained-how-tiny-ui-details-create-massive-ux-gains-1mca)
- [12 Micro Animation Examples Bringing Apps to Life in 2025](https://bricxlabs.com/blogs/micro-interactions-2025-examples)
- [The Four Types of Micro-Interactions | Medium](https://medium.com/design-bootcamp/the-four-types-of-micro-interactions-and-how-they-shape-user-experience-a297ca92e6fe)
- [Micro Interactions in Web Design: How Subtle Details Shape UX](https://www.stan.vision/journal/micro-interactions-2025-in-web-design)
- [Micro-Interactions That Don't Annoy: The 3-Second Rule | Medium](https://robertcelt95.medium.com/micro-interactions-that-dont-annoy-the-3-second-rule-for-ui-animation-9881300cd187)

### Best-in-Class Examples
- [Raycast Unlocks 40% Productivity Gain for Vercel Engineers - RealCaseHub](https://realcasehub.com/story/raycast-vercel-dev-productivity-1763769068235)
- [Raycast: More Than a Launcher - DEV](https://dev.to/simplr_sh/raycast-more-than-a-launcher-its-your-development-command-center-48o1)
- [animations.dev](https://animations.dev/)
- [UX Animation Essentials | School of Motion](https://www.schoolofmotion.com/courses/ux-animation-essentials)
- [Best Educational Website Design Examples | DevsData](https://devsdata.com/best-educational-website-design-examples/)

### Performance & Accessibility
- [Web Animation Best Practices & Guidelines - GitHub Gist](https://gist.github.com/uxderrick/07b81ca63932865ef1a7dc94fbe07838)
- [60 FPS: Performant web animations for optimal UX - Algolia](https://www.algolia.com/blog/engineering/60-fps-performant-web-animations-for-optimal-ux)
- [Animation performance guide | Motion](https://motion.dev/docs/performance)
- [Website Animations in 2026: Pros, Cons & Best Practices](https://www.shadowdigital.cc/resources/do-you-need-website-animations)
- [Performant Web Animations and Interactions: Achieving 60 FPS - Awwwards](https://www.awwwards.com/inspiration/performant-web-animations-and-interactions-achieving-60-fps)
- [Animation performance and frame rate - MDN](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate)

### CSS @starting-style
- [CSS in 2026: The new features reshaping frontend development - LogRocket](https://blog.logrocket.com/css-in-2026)
- [The Big Gotcha With @starting-style • Josh W. Comeau](https://www.joshwcomeau.com/css/starting-style/)
- [@starting-style - CSS | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@starting-style)
- [Now in Baseline: animating entry effects | web.dev](https://web.dev/blog/baseline-entry-animations)
- [4 CSS Features Every Front-End Developer Should Know In 2026](https://nerdy.dev/4-css-features-every-front-end-developer-should-know-in-2026)

### shadcn/ui Animations
- [Manual Installation - shadcn/ui](https://ui.shadcn.com/docs/installation/manual)
- [Tailwind v4 - shadcn/ui](https://ui.shadcn.com/docs/tailwind-v4)
- [Animate UI: Supercharge Tailwind & Shadcn with Animations | Kite Metric](https://kitemetric.com/blogs/animate-ui-open-source-animated-components-for-tailwind-and-shadcn)
- [Shadcn UI Animation | All Shadcn](https://allshadcn.com/tools/category/animations/)
- [Animations in shadcn/ui - Sleek Next.JS Applications](https://www.newline.co/courses/sleek-nextjs-applications-with-shadcn-ui/animations-in-shadcnui)
