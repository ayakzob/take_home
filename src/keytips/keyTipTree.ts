import { KeyTipCommand, KeyTipNode } from './types';

/** Create an empty root node for the trie. */
const createRootNode = (): KeyTipNode => ({
  key: '',
  label: 'Root',
  children: {},
});

/** Build a trie from a flat list of KeyTipCommand definitions. */
export const buildKeyTipTree = (commands: KeyTipCommand[]): KeyTipNode => {
  const root = createRootNode();

  for (const command of commands) {
    let current = root;

    for (let i = 0; i < command.keys.length; i++) {
      const key = command.keys[i].toUpperCase();
      const label = command.labels[i] ?? key;
      const isLeaf = i === command.keys.length - 1;

      if (!current.children[key]) {
        current.children[key] = {
          key,
          label,
          children: {},
        };
      }

      if (isLeaf) {
        current.children[key].action = command.action;
        current.children[key].description = command.description;
      }

      current = current.children[key];
    }
  }

  return root;
};

/** Traverse the trie by following a sequence of keys. Returns null if path is invalid. */
export const traverseTree = (root: KeyTipNode, keys: string[]): KeyTipNode | null => {
  let current: KeyTipNode = root;

  for (const key of keys) {
    const upper = key.toUpperCase();
    if (!current.children[upper]) return null;
    current = current.children[upper];
  }

  return current;
};

/** Get direct children of a node as an array, sorted by key. */
export const getAvailableKeys = (node: KeyTipNode): KeyTipNode[] =>
  Object.values(node.children).sort((a, b) => a.key.localeCompare(b.key));
