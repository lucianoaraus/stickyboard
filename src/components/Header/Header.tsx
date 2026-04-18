import Image from 'next/image';
import logo from '@/assets/logo.svg';
import styles from './Header.module.scss';

export function Header() {
  return (
    <header className={styles.header}>
      <Image
        src={logo}
        alt="tempo"
        width={154}
        height={42}
        className={styles.logo}
      />
    </header>
  );
}
