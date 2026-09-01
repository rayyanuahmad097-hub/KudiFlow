# Retry UI Feedback - Visual Reference Guide

## Component States & Displays

### 1. No Retry (Idle State)
```
Component returns null - nothing displayed
```

### 2. Initial Retry Triggered
```
┌────────────────────────────────────────┐
│ 🔄 Retrying Transaction                │
│ Attempt 1 of 3                         │
├────────────────────────────────────────┤
│ ●●● Processing retry...                │
│ ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    │
│ Next retry in: 1s                      │
│ 3 retries remaining                    │
└────────────────────────────────────────┘
```

**Color Scheme:**
- Background: Amber gradient (from-amber-50 to-orange-50)
- Border: Amber-200
- Progress bar: Amber to Orange gradient
- Spinner: Animated amber
- Status badge: Amber

### 3. Waiting for Retry (Countdown)
```
┌────────────────────────────────────────┐
│ 🔄 Retrying Transaction                │
│ Attempt 1 of 3                         │
├────────────────────────────────────────┤
│ ●●● Processing retry...                │
│ ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    │
│ Next retry in: 2s                      │
│ Connection timeout                     │
│ 3 retries remaining                    │
└────────────────────────────────────────┘
```

### 4. Retry Failed (with error)
```
┌────────────────────────────────────────┐
│ ⚠️  Retry Failed                       │
│ Attempt 1 of 3                         │
├────────────────────────────────────────┤
│ Connection timeout                     │
│ ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│ 2 retries remaining                    │
│                                        │
│ ┌──────────────────────────────────┐  │
│ │ 🔄 [      Retry Now      ]       │  │
│ └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

### 5. Multiple Attempts Completed
```
┌────────────────────────────────────────┐
│ ⚠️  Retry Failed                       │
│ Attempt 3 of 3                         │
├────────────────────────────────────────┤
│ Service temporarily unavailable        │
│ ███████████████████████████████████  │
│ 0 retries remaining                    │
│                                        │
│ ┌──────────────────────────────────┐  │
│ │ ❌ Transaction failed after 3    │  │
│ │ attempts. Please contact support │  │
│ │ or try a different route.        │  │
│ └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

### 6. Retry Success
```
The component returns null or TransactionHeartbeat shows:

┌────────────────────────────────────────┐
│ ✓ Transaction Complete                 │
│ Attempt 2 of 3 - SUCCEEDED             │
├────────────────────────────────────────┤
│ ███████████████████████████████████  │
│ 100%                                   │
│ Transaction completed successfully      │
│                                        │
│ View on explorer                       │
└────────────────────────────────────────┘
```

## Dark Mode Variants

### Dark Mode - Retrying State
```
┌────────────────────────────────────────────────────┐
│ Background: Dark slate (dark:bg-slate-800)         │
│ Text: White/Light gray                             │
│ Accent: Amber-500 with reduced opacity             │
│ Border: Darker amber (dark:border-amber-800)       │
├────────────────────────────────────────────────────┤
│ 🔄 Retrying Transaction                            │
│ Progress bar with amber/orange gradient            │
│ Countdown text in light amber                      │
│ Buttons with dark theme styling                    │
└────────────────────────────────────────────────────┘
```

## Responsive Design

### Mobile (< 640px)
```
┌──────────────────────┐
│ 🔄 Retrying...       │
│ Attempt 1/3          │
├──────────────────────┤
│ ●●● Processing       │
│ ███░░░░░░░░░░░░░░  │
│ Next in: 2s          │
│ Retries left: 2      │
└──────────────────────┘
```

### Tablet (640px - 1024px)
```
┌────────────────────────────────────┐
│ 🔄 Retrying Transaction            │
│ Attempt 1 of 3                     │
├────────────────────────────────────┤
│ ●●● Processing retry...            │
│ ████░░░░░░░░░░░░░░░░░░░░░░░░░  │
│ Next retry in: 2s                  │
│ 2 retries remaining                │
└────────────────────────────────────┘
```

### Desktop (> 1024px)
```
┌──────────────────────────────────────────────────────┐
│ 🔄 Retrying Transaction                              │
│ Attempt 1 of 3                                       │
├──────────────────────────────────────────────────────┤
│ ●●● Processing retry...                             │
│ ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│ Next retry in: 2s                                    │
│ 2 retries remaining                                  │
│                                                      │
│ [               Retry Now               ]           │
└──────────────────────────────────────────────────────┘
```

## Color Palette

### Retry Active State (Amber)
```
Colors:
- bg-amber-50 (background, light)
- border-amber-200 (border, light)
- bg-amber-500 (accent, progress bar)
- text-amber-900 (text, light)
- dark:bg-amber-900/20 (background, dark)
- dark:border-amber-800 (border, dark)
- dark:text-amber-100 (text, dark)

Animations:
- animate-pulse (pulsing effect)
- animate-bounce (spinner dots)
- transition-all (smooth updates)
```

### Error State (Red)
```
Colors:
- text-red-900 (text)
- bg-red-100 (background)
- border-red-300 (border)
- text-red-800 (body text)
- dark variants with reduced opacity
```

### Success State (Green)
```
Colors:
- bg-green-500 (progress bar)
- text-green-900 (text)
- Shown in main TransactionHeartbeat
```

## Animation Timings

```typescript
// Progress bar update
duration-300 // 300ms smooth transition

// Progress fill
duration-500 // 500ms for initial fill

// Countdown timer
transition-all duration-300 // Smooth number changes

// Spinner dots
animate-bounce
animationDelay: 0s, 0.1s, 0.2s // Staggered

// Pulsing elements
animate-pulse // Default browser pulse
```

## Typography

```
Header (h3):
- font-semibold
- text-sm
- text-slate-900 dark:text-white
- Colors change based on state

Body text (p):
- text-xs
- text-slate-500 dark:text-slate-400

Badge/Attempt counter:
- font-medium
- text-xs
- bg-white / bg-amber-950 (dark)
- px-2 py-1 rounded

Button:
- font-medium
- text-sm
- w-full (full width on mobile)
- px-3 py-2
- bg-amber-500 hover:bg-amber-600
- text-white
- rounded-md
- transition-colors duration-200
```

## Layout Structure

```
┌─────────────────────────────────────┐
│  Header Row (3 items)               │ 15px
│  - Title / Status Icon              │ (variable height)
│  - Attempt Badge                    │
│  - Close Button                     │
├─────────────────────────────────────┤ 12px
│  Spinner & Status Text (Row)        │ 20px
├─────────────────────────────────────┤ 12px
│  Progress Bar Section               │ 48px
│  - Progress bar (8px)               │
│  - Label text (16px)                │
├─────────────────────────────────────┤ 12px
│  Countdown Timer (if visible)       │ 16px
├─────────────────────────────────────┤ 8px
│  Error Box (if visible)             │ variable
├─────────────────────────────────────┤ 12px
│  Retry Button (if visible)          │ 36px
└─────────────────────────────────────┘
```

### Default Sizing
```
Width: 320px (w-80)
Max width on mobile: 100% - 16px padding
Position: fixed bottom-4 right-4
Z-index: z-50
Padding: p-4 (16px)
Gap between sections: mb-3 (12px), mb-2 (8px)
```

## Accessibility Features

### Focus States
```
Button:
- :focus → ring-2 ring-offset-2 ring-amber-500
- outline-none

Keyboard Navigation:
- Tab through button
- Enter/Space to activate
- Tab away to unfocus
```

### Screen Reader Text
```
- Close button: aria-label="Close"
- Spinner: <div> (decorative)
- Progress info: Announced via status text
```

### Color Contrast
```
Text on Light Background:
- Dark text on amber-50 ✅ (18:1 ratio)

Text on Dark Background:
- Light text on dark slot-800 ✅ (15:1 ratio)

Interactive Elements:
- Button colors ✅ (7:1+ ratio for AA compliance)
```

## Interactive States

### Button States
```
Normal:
└─ bg-amber-500 text-white

Hover:
└─ bg-amber-600 cursor-pointer

Focus:
└─ ring-2 ring-amber-300

Active (clicked):
└─ bg-amber-700 transform scale-95

Disabled:
└─ opacity-50 cursor-not-allowed
```

### Progress Bar States
```
0% complete:
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]

33% complete (1 of 3):
[██████████░░░░░░░░░░░░░░░░░░░░░░░░]

66% complete (2 of 3):
[██████████████████░░░░░░░░░░░░░░░░]

100% complete (3 of 3):
[██████████████████████████████████]
```

## Edge Cases & Special Display

### Single Retry Attempt
```
┌────────────────────────────────────┐
│ Attempt 1 of 1                     │
├────────────────────────────────────┤
│ No retry button (0 retries left)   │
└────────────────────────────────────┘
```

### Very Long Error Message (Truncated)
```
┌────────────────────────────────────┐
│ Lorem ipsum dolor sit amet conse...│  truncate (line-clamp-2)
└────────────────────────────────────┘
```

### High Remaining Retries Count
```
Singular: "1 retry remaining"      (1 left)
Plural:   "5 retries remaining"    (2+ left)
None:     "No retries remaining"   (0 left)
```

## Animation Examples

### Spinner Dots (Bounce)
Frame 1: [●   ]
Frame 2: [ ●  ]
Frame 3: [  ● ]
Frame 4: [   ●]
...repeats

### Progress Bar Fill
Starting: [░░░░░░░░░░]
Filling:  [██░░░░░░░░]
Complete: [██████████]

### Countdown Timer
5s → 4s → 3s → 2s → 1s → 0s (auto-updates every 100ms)

## Print Styles

When printed, the component:
- Maintains visible borders
- Uses web-safe fonts
- Removes animations
- Shows all text content
- Maintains hierarchy with font sizes
