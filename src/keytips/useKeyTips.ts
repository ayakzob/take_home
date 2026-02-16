import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as GC from '@mescius/spread-sheets';
import { KeyTipCommand, KeyTipState } from './types';
import { buildKeyTipTree, getAvailableKeys, traverseTree } from './keyTipTree';

const INITIAL_STATE: KeyTipState = {
  active: false,
  path: [],
  currentNode: null,
  availableKeys: [],
};

const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

export const useKeyTips = (
  commands: KeyTipCommand[],
  spread: GC.Spread.Sheets.Workbook | null,
) => {
  const [state, setState] = useState<KeyTipState>(INITIAL_STATE);
  const tree = useMemo(() => buildKeyTipTree(commands), [commands]);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Track whether the modifier was tapped alone (not part of Cmd+R, etc.)
  const modifierAloneRef = useRef(false);

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  const activate = useCallback(() => {
    if (spread) spread.getActiveSheet().endEdit();
    setState({
      active: true,
      path: [],
      currentNode: tree,
      availableKeys: getAvailableKeys(tree),
    });
  }, [tree, spread]);

  const goBack = useCallback(() => {
    const current = stateRef.current;
    if (!current.active) return;

    if (current.path.length === 0) {
      reset();
      return;
    }

    const newPath = current.path.slice(0, -1);
    const node = newPath.length === 0 ? tree : traverseTree(tree, newPath);
    if (!node) {
      reset();
      return;
    }
    setState({
      active: true,
      path: newPath,
      currentNode: node,
      availableKeys: getAvailableKeys(node),
    });
  }, [tree, reset]);

  const handleKeyPress = useCallback((key: string) => {
    const current = stateRef.current;
    if (!current.active || !current.currentNode) return;

    const upper = key.toUpperCase();
    const nextNode = traverseTree(current.currentNode, [upper]);

    if (!nextNode) {
      reset();
      return;
    }

    // Node with action — execute and reset
    if (nextNode.action && Object.keys(nextNode.children).length === 0) {
      if (spread) nextNode.action(spread);
      reset();
      return;
    }

    // Intermediate node — advance the path
    const newPath = [...current.path, upper];
    setState({
      active: true,
      path: newPath,
      currentNode: nextNode,
      availableKeys: getAvailableKeys(nextNode),
    });
  }, [spread, reset]);

  useEffect(() => {
    const isActivationKey = (key: string) =>
      isMac ? key === 'Meta' : key === 'Alt';

    // Runs in CAPTURE phase — fires before SpreadJS sees the event
    const handleKeyDown = (e: KeyboardEvent) => {
      const current = stateRef.current;

      // On activation key press, just mark it — don't block the event
      // so browser combos like Cmd+R still work
      if (isActivationKey(e.key)) {
        modifierAloneRef.current = true;
        return;
      }

      // Any other key while modifier is held = combo (Cmd+R, Cmd+C, etc.)
      if (e.metaKey || e.altKey) {
        modifierAloneRef.current = false;
      }

      if (!current.active) return;

      // Cancel on Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        reset();
        return;
      }

      // Go back on Backspace
      if (e.key === 'Backspace') {
        e.preventDefault();
        e.stopPropagation();
        goBack();
        return;
      }

      // Ignore modifier keys while active
      if (['Alt', 'Meta', 'Control', 'Shift'].includes(e.key)) return;

      // Block ALL keys from reaching SpreadJS while KeyTips is active
      if (e.key.length === 1) {
        e.preventDefault();
        e.stopPropagation();
        handleKeyPress(e.key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Activation: only when modifier was pressed and released alone
      if (isActivationKey(e.key)) {
        if (modifierAloneRef.current) {
          if (stateRef.current.active) {
            reset();
          } else {
            activate();
          }
        }
        modifierAloneRef.current = false;
        return;
      }

      // Block keyup from reaching SpreadJS while active
      if (stateRef.current.active &&
          !['Alt', 'Meta', 'Control', 'Shift'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleClick = () => {
      if (stateRef.current.active) reset();
    };

    // Block SpreadJS from entering edit mode while KeyTips is active
    const blockEdit = (_: any, args: any) => {
      if (stateRef.current.active) args.cancel = true;
    };
    if (spread) {
      spread.bind(GC.Spread.Sheets.Events.EditStarting, blockEdit);
    }

    // capture: true = our handler fires BEFORE SpreadJS
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('click', handleClick);

    return () => {
      if (spread) {
        spread.unbind(GC.Spread.Sheets.Events.EditStarting, blockEdit);
      }
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('click', handleClick);
    };
  }, [activate, reset, handleKeyPress, goBack, spread]);

  return { state, reset };
};
