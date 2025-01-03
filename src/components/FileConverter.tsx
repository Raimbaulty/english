'use client';

import React, { useState, useRef } from 'react';
import styles from './FileConverter.module.css';

const FileConverter = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);

        try {
            // 读取文件内容
            const text = await file.text();

            // 从localStorage获取API设置
            const userSettings = localStorage.getItem('userSettings');
            if (!userSettings) {
                throw new Error('请先在设置页面配置 Gemini API 信息');
            }

            const settings = JSON.parse(userSettings);
            const { apiKey, baseUrl } = settings.gemini;

            if (!apiKey || !baseUrl) {
                throw new Error('请先在设置页面配置 Gemini API 信息');
            }

            // 调用Gemini API
            const response = await fetch(`${baseUrl}/v1beta/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gemini-2.0-flash-exp',
                    messages: [
                        {
                            role: 'user',
                            content: `Extract all English chunks (not complete sentences, please understand the requirements carefully) suitable for English beginners from this, and the output format is JSON, including fields that you organize yourself (including chunks themselves, pronunciation phonetic symbols, Chinese meanings and a list of suitable scenes).\n\nText content:\n${text}`,
                        },
                    ],
                }),
            });

            if (!response.ok) {
                throw new Error('API 调用失败: ' + response.statusText);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;

            if (!content) {
                throw new Error('API 返回数据格式错误');
            }

            // 提取JSON内容
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('未能从响应中提取到JSON数据');
            }

            const jsonContent = jsonMatch[0];

            // 下载JSON文件
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chunks_${new Date().getTime()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // 重置文件输入
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '处理文件时发生错误');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.uploadArea}>
                <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className={styles.fileInput}
                    disabled={isLoading}
                />
                <p className={styles.hint}>
                    支持上传 .txt 文本文件，将自动提取适合初学者的英语块
                </p>
            </div>
            
            {isLoading && (
                <div className={styles.loading}>
                    正在处理文件，请稍候...
                </div>
            )}
            
            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}
        </div>
    );
};

export default FileConverter; 