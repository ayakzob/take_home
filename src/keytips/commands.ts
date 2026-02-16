import * as GC from "@mescius/spread-sheets";
import { KeyTipCommand } from "./types";

/** Capture clipboard text from any copy/cut within the page — no permissions needed. */
let lastCopiedText: string | null = null;
document.addEventListener("copy", (e) => {
  const text = e.clipboardData?.getData("text/plain");
  if (text) lastCopiedText = text;
});
document.addEventListener("cut", (e) => {
  const text = e.clipboardData?.getData("text/plain");
  if (text) lastCopiedText = text;
});

const getActiveSelection = (spread: GC.Spread.Sheets.Workbook) => {
  const sheet = spread.getActiveSheet();
  const selections = sheet.getSelections();
  if (!selections || selections.length === 0) return null;
  return { sheet, selection: selections[0] };
};

/** Alt/Cmd → H → V → V: Paste only values (not formulas) */
const pasteValues: KeyTipCommand = {
  keys: ["H", "V", "V"],
  labels: ["Home", "Paste", "Values"],
  description: "Paste values",
  action: (spread) => {
    if (!lastCopiedText) return;
    const ctx = getActiveSelection(spread);
    if (!ctx) return;
    const { sheet, selection: sel } = ctx;
    const rows = lastCopiedText.replace(/\r\n$/, "").split(/\r?\n/);
    spread.suspendPaint();
    for (let r = 0; r < rows.length; r++) {
      const cols = rows[r].split("\t");
      for (let c = 0; c < cols.length; c++) {
        const raw = cols[c];
        const num = Number(raw);
        const value = raw === "" ? null : isNaN(num) ? raw : num;
        sheet.setValue(sel.row + r, sel.col + c, value);
      }
    }
    spread.resumePaint();
  },
};

/** Alt/Cmd → H → B → B: Add bottom border to selected cells */
const borderBottom: KeyTipCommand = {
  keys: ["H", "B", "B"],
  labels: ["Home", "Borders", "Bottom"],
  description: "Add bottom border to selected cells",
  action: (spread) => {
    const ctx = getActiveSelection(spread);
    if (!ctx) return;
    const { sheet, selection: sel } = ctx;
    const border = new GC.Spread.Sheets.LineBorder(
      "#000000",
      GC.Spread.Sheets.LineStyle.thin,
    );
    sheet
      .getRange(sel.row, sel.col, sel.rowCount, sel.colCount)
      .setBorder(border, { bottom: true });
  },
};

/** Alt/Cmd → H → B → T: Add top border to selected cells */
const borderTop: KeyTipCommand = {
  keys: ["H", "B", "T"],
  labels: ["Home", "Borders", "Top"],
  description: "Add top border to selected cells",
  action: (spread) => {
    const ctx = getActiveSelection(spread);
    if (!ctx) return;
    const { sheet, selection: sel } = ctx;
    const border = new GC.Spread.Sheets.LineBorder(
      "#000000",
      GC.Spread.Sheets.LineStyle.thin,
    );
    sheet
      .getRange(sel.row, sel.col, sel.rowCount, sel.colCount)
      .setBorder(border, { top: true });
  },
};

/** Alt/Cmd → H → O → I: AutoFit column width to fit content */
const autoFitColumn: KeyTipCommand = {
  keys: ["H", "O", "I"],
  labels: ["Home", "Format", "AutoFit Width"],
  description: "Adjust column width to fit content",
  action: (spread) => {
    const ctx = getActiveSelection(spread);
    if (!ctx) return;
    const { sheet, selection: sel } = ctx;
    for (let c = sel.col; c < sel.col + sel.colCount; c++) {
      sheet.autoFitColumn(c);
    }
  },
};

/** Alt/Cmd → A → S: Sort selected cells in descending order */
const sortDescending: KeyTipCommand = {
  keys: ["A", "S"],
  labels: ["Data", "Sort Descending"],
  description: "Sort selected cells in descending order",
  action: (spread) => {
    const ctx = getActiveSelection(spread);
    if (!ctx) return;
    const { sheet, selection: sel } = ctx;
    sheet.sortRange(sel.row, sel.col, sel.rowCount, sel.colCount, true, [
      { index: sel.col, ascending: false },
    ]);
  },
};

/** All registered KeyTip commands. Add new commands to this array. */
export const KEY_TIP_COMMANDS: KeyTipCommand[] = [
  pasteValues,
  borderBottom,
  borderTop,
  autoFitColumn,
  sortDescending,
];
