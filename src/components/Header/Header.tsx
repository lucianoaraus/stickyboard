import styles from './Header.module.scss';

export function Header() {
  return (
    <header className={styles.header}>
      <span className={styles.logo}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="11" height="11" rx="2.5" fill="currentColor" opacity="0.9" />
          <rect x="15" y="2" width="11" height="11" rx="2.5" fill="currentColor" opacity="0.6" />
          <rect x="2" y="15" width="11" height="11" rx="2.5" fill="currentColor" opacity="0.6" />
          <rect x="15" y="15" width="11" height="11" rx="2.5" fill="currentColor" opacity="0.35" />
        </svg>
      </span>
      <span className={styles.title}>
        Sticky<span className={styles.accent}>Board</span>
      </span>
    </header>
  );
}
