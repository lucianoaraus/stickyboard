'use client';

import { useCallback, useEffect, useRef } from 'react';
import styles from './TrashZone.module.scss';

interface TrashZoneProps {
  isActive: boolean;
}

export function TrashZone({ isActive }: TrashZoneProps) {
  return (
    <div
      className={`${styles.trash} ${isActive ? styles.active : ''}`}
      aria-label="Trash zone — drop note here to delete"
      role="region"
      data-trash-zone
    >
      <span className={styles.icon}>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
          <g className={styles.lid}>
            <rect x="6" y="4" width="14" height="3" rx="1.5" fill="currentColor" />
            <rect x="10" y="2" width="6" height="3" rx="1.5" fill="currentColor" />
          </g>
          <rect x="7" y="8" width="12" height="14" rx="2" fill="currentColor" opacity="0.75" />
          <line x1="10.5" y1="11" x2="10.5" y2="19" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="13" y1="11" x2="13" y2="19" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="15.5" y1="11" x2="15.5" y2="19" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
    </div>
  );
}
