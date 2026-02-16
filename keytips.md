# KeyTips System — Adding New Keytips

This document explains how to add new keyboard shortcut commands to the KeyTips system.

## Architecture Overview

The KeyTips system uses a **trie (prefix tree)** to organize keyboard sequences. Each key press traverses one level deeper into the tree. When a leaf node is reached, its action is executed.

```
Root
├── H (Home)
│   ├── V
│   │   └── V → Paste Values
│   ├── B
│   │   ├── B → Border Bottom
│   │   └── T → Border Top
│   └── O
│       └── I → AutoFit Column
└── A (Data)
    └── S → Sort Descending
```

## How to Add a New KeyTip

### 1. Open `src/keytips/commands.ts`

### 2. Define your command as a `KeyTipCommand` object

```typescript
const myNewCommand: KeyTipCommand = {
  keys: ['H', 'F', 'C'],           // Key sequence after Alt/Cmd
  labels: ['Home', 'Font', 'Color'], // Human-readable label for each level
  description: 'Change font color',  // Shown in the overlay UI
  action: (spread) => {
    // Your SpreadJS logic here
    const sheet = spread.getActiveSheet();
    const selections = sheet.getSelections();
    if (!selections || selections.length === 0) return;
    const sel = selections[0];
    // ... apply changes to the selection
  },
};
```

### 3. Add it to the `KEY_TIP_COMMANDS` array

```typescript
export const KEY_TIP_COMMANDS: KeyTipCommand[] = [
  pasteValues,
  borderBottom,
  borderTop,
  autoFitColumn,
  sortDescending,
  myNewCommand,  // ← add here
];
```

That's it. The trie is rebuilt automatically from this array.

## Field Reference

| Field         | Type                                           | Description                                          |
| ------------- | ---------------------------------------------- | ---------------------------------------------------- |
| `keys`        | `string[]`                                     | Sequential keys pressed after Alt/Cmd activation     |
| `labels`      | `string[]`                                     | Display name for each level (shown in path breadcrumb) |
| `description` | `string`                                       | Short description shown next to the key badge        |
| `action`      | `(spread: GC.Spread.Sheets.Workbook) => void`  | Function executed when the full sequence is entered  |

## Guidelines

- **Keys are case-insensitive** — `'h'` and `'H'` are treated the same.
- **Shared prefixes are merged automatically.** If you add `['H', 'F', 'B']` (Bold) and `['H', 'F', 'I']` (Italic), pressing `Alt → H → F` will show both `B` and `I` as options.
- **Labels at the same level should be consistent.** If key `H` already maps to label `"Home"`, use the same label in new commands that start with `H`.
- **Keep sequences short** (2–4 keys) for usability.
- **Always guard against empty selections** in your action function — the user may trigger the shortcut with no cells selected.

## Example: Adding Bold Toggle

```typescript
const toggleBold: KeyTipCommand = {
  keys: ['H', 'F', 'B'],
  labels: ['Home', 'Font', 'Bold'],
  description: 'Toggle bold on selected cells',
  action: (spread) => {
    const sheet = spread.getActiveSheet();
    const selections = sheet.getSelections();
    if (!selections || selections.length === 0) return;
    const sel = selections[0];
    const style = sheet.getStyle(sel.row, sel.col) || new GC.Spread.Sheets.Style();
    const isBold = style.font?.includes('bold');
    const newStyle = new GC.Spread.Sheets.Style();
    newStyle.font = isBold ? 'normal 11pt Calibri' : 'bold 11pt Calibri';
    sheet.getRange(sel.row, sel.col, sel.rowCount, sel.colCount).setStyle(newStyle);
  },
};
```
