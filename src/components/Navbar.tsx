'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link href="/" className={styles.logoLink}>
                    <Logo />
                </Link>
                
                <button 
                    className={`${styles.menuButton} ${isMenuOpen ? styles.active : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <div className={`${styles.menu} ${isMenuOpen ? styles.menuOpen : ''}`}>
                    <Link href="/" className={styles.menuItem}>
                        首页
                    </Link>
                    <Link href="/convert" className={styles.menuItem}>
                        文件转英语块
                    </Link>
                    <Link href="/chunks" className={styles.menuItem}>
                        英语块
                    </Link>
                    <Link href="/about" className={styles.menuItem}>
                        关于
                    </Link>
                    <Link href="/settings" className={styles.menuItem}>
                        设置
                    </Link>
                </div>
            </div>
        </nav>
    );
} 