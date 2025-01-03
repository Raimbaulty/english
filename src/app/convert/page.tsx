'use client';

import React from 'react';
import FileConverter from '@/components/FileConverter';
import styles from './page.module.css';

export default function ConvertPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>文件转英语块</h1>
            <FileConverter />
        </div>
    );
} 