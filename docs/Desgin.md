# Desgin — Spatial Design System

> Source of truth: `frontend/src/styles/spatial.css`, `frontend/tailwind.config.js`, `README.md:9-13`.

## 1. Design Principles
1. Deep-space dark canvas with ambient indigo/cyan mesh — content floats, never flat.
2. Frosted acrylic (glassmorphism): `backdrop-blur-2xl bg-slate-900/60 border-white/10 shadow-glass`.
3. Pill geometry + specular 1px top-edge highlight + spring click (`active:scale-[0.98]`).
4. visionOS spatial hierarchy: canvas (z0) → mesh grid (z1) → glass panels → elevated modals.
5. Dense enterprise readability: 11–12px mono for ledgers/diffs, 12–14px sans for UI.

## 2. UI Components (classes in `spatial.css`)
- `.spatial-canvas` — `#090a0f` + radial indigo (`rgba(99,102,241,0.12)`) top glow + cyan corner glow.
- `.spatial-mesh-grid` — 32px micro-grid, masked radial fade.
- `.spatial-glow-orb-indigo/cyan` — 500–600px blurred ambient orbs.
- `.glass-panel` / `-subtle` / `-elevated` — blur 16–28px, `rgba(14,17,26,0.45–0.88)`, top border `white/12–22%`, radius `1–1.5rem`.
- `.glass-pill` — capsule nav/dock, hover lift `-1px`, active squash.
- `.nav-item-active` — indigo gradient + left 3px `#6366f1` bar + glow.
- `.glass-input` — `rgba(0,0,0,0.35)`, focus ring `indigo 1px + 0 0 0 1px rgba(99,102,241,0.4)`.
- `.specular-top::before` — 5–95% white gradient hairline.
- `.animate-fadeIn` (0.2s rise), 6px slim scrollbars.
- Domain: `SpatialAppLayout` shell + `FloatingSidebar` + `CommandPaletteModal`; `SpatialKanbanBoard` + `TaskInspectorDrawer` + `SwarmActivityModal`; `SpatialChatContainer` (`MessageStream/InputBar/MentionPopover/MediaViewer/MediaRecorder/LocationPicker`); `SpatialNotepad` masonry; 6 AI stages; `IdentityManagementPanel` + `EditUserDrawer` + `AuditStage` ledger + `SettingsStage`.

## 3. Typography
- Family: `-apple-system, 'SF Pro Display', Inter, 'Segoe UI', Roboto, Helvetica, Arial` (`spatial.css:19`), `color-scheme: dark`, antialiased.
- Scale: H1 `xl bold white`, section `xs slate-400`, ledger `11px mono slate-300`, chips `10px pill`.
- Markdown AI answers: `react-markdown + remark-gfm`.

## 4. Color Palette
| Token | Value | Use |
|---|---|---|
| `space-950` | `#07090e` | deepest canvas (Tailwind) |
| `--spatial-bg` | `#090a0f` | body/canvas |
| `space-900/850/800` | `#0c1017/#111722/#171f2e` | surfaces |
| `--spatial-indigo` | `#6366f1` | primary, focus, active nav |
| `--spatial-cyan` | `#0ea5e9` | secondary glow, accents |
| borders | `white/6–10%`, highlight `white/12–22%` | glass rims |
| text | `slate-200 #e2e8f0` UI, `slate-400` muted, `white` emphasis | — |
| status | `emerald` success, `rose` failed, `amber/emerald/blue/indigo/violet/rose/slate` note tints | Kanban/audit/notes |
- Shadows: `glass 0 8px 32px rgba(0,0,0,0.37)`, `glass-glow 0 0 24px rgba(99,102,241,0.25)`.
