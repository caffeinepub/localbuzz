# Buzz Design System

## Overview
A clean, mobile-first design system for LocalBuzz featuring a bright, approachable aesthetic with a single yellow/orange brand color.

## Core Principles
- **Clean & Simple**: White backgrounds, minimal visual noise
- **Single Brand Color**: Yellow/orange (#FF9500 / oklch(0.75 0.15 55)) for primary actions and highlights
- **Readable Typography**: Large, legible text optimized for mobile
- **Rounded Surfaces**: Consistent 12px border radius for cards and inputs
- **Subtle Motion**: Minimal animations, limited to hover/focus feedback only

## Color Palette

### Light Mode (Default)
- **Background**: Pure white (oklch(1 0 0))
- **Foreground**: Dark gray for text (oklch(0.20 0 0))
- **Primary**: Warm orange (oklch(0.75 0.15 55)) - used for CTAs, icons, focus rings
- **Muted**: Light gray for secondary surfaces (oklch(0.96 0 0))
- **Border**: Subtle gray borders (oklch(0.90 0 0))

### Avoid
- Dark mode complexity (keep light as default)
- Multiple competing brand colors
- Heavy gradients or complex backgrounds

## Typography
- **Scale**: Mobile-first with large touch targets (min 44px)
- **Headings**: Bold, prominent (text-3xl for page titles)
- **Body**: Readable base size (text-base)
- **Hierarchy**: Clear visual distinction between heading levels

## Spacing & Layout
- **Cards**: Rounded (rounded-lg = 12px), white background, subtle shadow
- **Padding**: Generous internal spacing (p-4 to p-6)
- **Gaps**: Consistent spacing between elements (space-y-4, space-y-6)

## Components
- **Buttons**: Rounded, clear states (default/hover/disabled), primary uses brand orange
- **Icons**: Lucide React icons, consistent sizing (h-5 w-5 for inline, h-8 w-8 for headers)
- **Cards**: White background, rounded corners, subtle border
- **Inputs**: Rounded, clear focus states with orange ring

## Motion
- **Transitions**: Subtle (transition-colors, transition-all)
- **Duration**: Fast (200-300ms)
- **Avoid**: Attention-grabbing animations, complex keyframes, auto-playing motion

## Navigation
- **Keep Simple**: Bottom nav with 3 clear options (Shop/Customer/Profile)
- **No Tabs**: Avoid complex tab structures
- **Clear Icons**: Each nav item has a clear icon + label
