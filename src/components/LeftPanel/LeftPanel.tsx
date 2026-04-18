'use client';

import styles from './LeftPanel.module.scss';

export type ToolMode = 'select' | 'create';

interface LeftPanelProps {
  toolMode: ToolMode;
  onToolModeChange: (mode: ToolMode) => void;
}

export function LeftPanel({ toolMode, onToolModeChange }: LeftPanelProps) {
  return (
    <div className={styles.panel}>
      <button
        className={`${styles.tool} ${toolMode === 'select' ? styles.active : ''}`}
        onClick={() => onToolModeChange('select')}
        title="Select"
        aria-label="Select mode"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M4 2L4 15L7.5 11.5L10 17L11.8 16.2L9.3 10.5L14 10.5L4 2Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <div className={styles.divider} />

      <button
        className={`${styles.tool} ${toolMode === 'create' ? styles.active : ''}`}
        onClick={() => onToolModeChange('create')}
        title="Add sticky note"
        aria-label="Create sticky note mode"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="14" height="14" rx="2.5" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="10" y1="7" x2="10" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="7" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}
