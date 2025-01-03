'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
    return (
        <main className={styles.container}>
            <div className={styles.hero}>
                <h1 className={styles.title}>
                    掌握英语表达的
                    <span className={styles.highlight}>新方式</span>
                </h1>
                <p className={styles.subtitle}>
                    通过学习地道的英语表达块，提升你的英语口语水平
                </p>
                <Link href="/chunks" className={styles.cta}>
                    开始学习
                </Link>
            </div>
            <div className={styles.features}>
                <div className={styles.feature}>
                    <div className={styles.featureIcon}>🎯</div>
                    <h3>场景化学习</h3>
                    <p>根据不同场景学习最实用的表达</p>
                </div>
                <div className={styles.feature}>
                    <div className={styles.featureIcon}>🔊</div>
                    <h3>真人发音</h3>
                    <p>Edge TTS 提供准确的发音指导</p>
                </div>
                <div className={styles.feature}>
                    <div className={styles.featureIcon}>📝</div>
                    <h3>中英对照</h3>
                    <p>清晰的中文解释帮助理解</p>
                </div>
            </div>
        </main>
    );
}
