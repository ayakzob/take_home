import React from 'react';
import { KeyTipState } from './types';
import './KeyTipOverlay.css';

interface KeyTipOverlayProps {
  state: KeyTipState;
}

const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
const ACTIVATION_LABEL = isMac ? '\u2318' : 'Alt';

const KeyTipOverlay: React.FC<KeyTipOverlayProps> = ({ state }) => {
  if (!state.active) return null;

  return (
    <div className="keytip-overlay" onClick={(e) => e.stopPropagation()}>
      {/* Breadcrumb path */}
      <div className="keytip-path">
        <span className="keytip-path-key">{ACTIVATION_LABEL}</span>
        {state.path.map((key, i) => (
          <React.Fragment key={i}>
            <span className="keytip-path-separator">&rsaquo;</span>
            <span className="keytip-path-key">{key}</span>
          </React.Fragment>
        ))}
      </div>

      <div className="keytip-divider" />

      {/* Available next keys */}
      <div className="keytip-options">
        {state.availableKeys.map((node) => (
          <div key={node.key} className="keytip-option">
            <span className="keytip-option-key">{node.key}</span>
            <span className="keytip-option-label">
              {node.description ?? node.label}
            </span>
          </div>
        ))}
      </div>

      <div className="keytip-hint">Esc to cancel</div>
    </div>
  );
};

export default KeyTipOverlay;
