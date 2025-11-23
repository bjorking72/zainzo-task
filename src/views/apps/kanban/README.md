# Kanban Page

React + TypeScript implementation of the Modernize Kanban board.

## Features

- Drag & drop cards between columns using [`@dnd-kit`](https://docs.dndkit.com/)
- Add, edit, and delete cards with optional image, description, due date, and labels
- Add and delete columns
- Board state persisted automatically to `localStorage`
- Responsive layout with horizontal scroll on mobile
- Inline left sidebar with active "Kanban" navigation item
- Keyboard-accessible drag operations (pointer + keyboard sensors)
- TypeScript strict mode friendly (no `any`)

## Installation

Install the drag-and-drop dependencies once inside the project:

```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

## File Structure

```
src/views/apps/kanban/
├─ index.tsx               # Page entry (exports KanbanPage)
├─ KanbanBoard.tsx         # Board container + DnD context
├─ KanbanSidebar.tsx       # Responsive sidebar with active Kanban item
├─ KanbanColumn.tsx        # Single column (cards list + actions)
├─ KanbanCard.tsx          # Card UI with edit/delete actions
├─ kanban.types.ts         # Shared TypeScript types
├─ kanban.hooks.ts         # useKanban hook with localStorage persistence
├─ kanban.styles.module.css# Layout and responsive styles
└─ README.md               # You are here
```

## Hook API

```ts
useKanban(initial?: BoardData) => {
  board,
  addColumn,
  removeColumn,
  addCard,
  updateCard,
  removeCard,
  moveCard,
  importBoard,
  exportBoard,
}
```

## Smoke Test Checklist

- [ ] Navigate to `/apps/kanban`
- [ ] Sidebar shows "Kanban" with active styling
- [ ] Drag a card to another column and reload (state persists)
- [ ] Add, edit, and delete a card
- [ ] Add and delete a column
- [ ] Export board JSON and import it back
- [ ] View on mobile width – sidebar collapses to toggle button

## Notes

- Initial board data is defined in `createInitialData()` inside `kanban.hooks.ts`
- Column background colors can be changed by editing the `color` property of the column definitions
- Labels are comma-separated strings and rendered as colored chips
- No backend is required – everything is client-side
