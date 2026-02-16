import * as GC from '@mescius/spread-sheets';

/** A single node in the KeyTip trie. Leaf nodes have an `action`. */
export interface KeyTipNode {
  key: string;
  label: string;
  children: Record<string, KeyTipNode>;
  action?: (spread: GC.Spread.Sheets.Workbook) => void;
  description?: string;
}

/** Flat definition used to register a keytip command. */
export interface KeyTipCommand {
  /** Sequential keys after Alt/Cmd activation, e.g. ['H', 'V', 'V'] */
  keys: string[];
  /** Human-readable labels for each level, e.g. ['Home', 'Paste', 'Values'] */
  labels: string[];
  /** Short description shown in the overlay */
  description: string;
  /** Action to execute when the full sequence is entered */
  action: (spread: GC.Spread.Sheets.Workbook) => void;
}

export interface KeyTipState {
  active: boolean;
  path: string[];
  currentNode: KeyTipNode | null;
  availableKeys: KeyTipNode[];
}
