'use client';

import React, { useEffect, useState } from 'react';
import styles from './SettingsForm.module.css';

// 定义设置的类型
interface Settings {
    gemini: {
        apiKey: string;
        baseUrl: string;
    };
    englishLevel: string;
    voice: string;
    speed: number;
}

// 默认设置
const defaultSettings: Settings = {
    gemini: {
        apiKey: '',
        baseUrl: 'https://generativelanguage.googleapis.com',
    },
    englishLevel: 'elementary',
    voice: 'en-US-JennyNeural',
    speed: 1.0,
};

// 英语等级选项
const englishLevels = [
    { value: 'kindergarten', label: '英语幼儿园' },
    { value: 'elementary', label: '英语小学生' },
    { value: 'junior', label: '英语初中生' },
    { value: 'university', label: '英语大学生' },
    { value: 'postdoc', label: '英语博士后' },
];

// Edge TTS 音色列表
const voices = [
    'en-US-JennyNeural',
    'en-US-GuyNeural',
    'en-GB-SoniaNeural',
    'en-GB-RyanNeural',
    'en-AU-NatashaNeural',
    'en-AU-WilliamNeural',
    'en-CA-ClaraNeural',
    'en-CA-LiamNeural',
];

const SettingsForm = () => {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [message, setMessage] = useState('');

    // 加载设置
    useEffect(() => {
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            try {
                setSettings(JSON.parse(savedSettings));
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
    }, []);

    // 保存设置
    const saveSettings = () => {
        try {
            localStorage.setItem('userSettings', JSON.stringify(settings));
            setMessage('设置已保存');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage('保存设置失败');
        }
    };

    // 导出用户数据
    const exportData = () => {
        try {
            const data = {
                settings,
                // 这里可以添加其他需要导出的用户数据
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'user-data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting data:', error);
            setMessage('导出数据失败');
        }
    };

    return (
        <div className={styles.form}>
            <section className={styles.section}>
                <h2>Gemini 设置</h2>
                <div className={styles.field}>
                    <label htmlFor="apiKey">API Key</label>
                    <input
                        type="password"
                        id="apiKey"
                        value={settings.gemini.apiKey}
                        onChange={(e) => setSettings({
                            ...settings,
                            gemini: { ...settings.gemini, apiKey: e.target.value }
                        })}
                        placeholder="输入你的 Gemini API Key"
                    />
                </div>
                <div className={styles.field}>
                    <label htmlFor="baseUrl">Base URL</label>
                    <input
                        type="text"
                        id="baseUrl"
                        value={settings.gemini.baseUrl}
                        onChange={(e) => setSettings({
                            ...settings,
                            gemini: { ...settings.gemini, baseUrl: e.target.value }
                        })}
                        placeholder="输入 Gemini API 的基础 URL"
                    />
                </div>
            </section>

            <section className={styles.section}>
                <h2>英语等级</h2>
                <div className={styles.field}>
                    <select
                        value={settings.englishLevel}
                        onChange={(e) => setSettings({
                            ...settings,
                            englishLevel: e.target.value
                        })}
                    >
                        {englishLevels.map((level) => (
                            <option key={level.value} value={level.value}>
                                {level.label}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            <section className={styles.section}>
                <h2>语音设置</h2>
                <div className={styles.field}>
                    <label htmlFor="voice">发音音色</label>
                    <select
                        id="voice"
                        value={settings.voice}
                        onChange={(e) => setSettings({
                            ...settings,
                            voice: e.target.value
                        })}
                    >
                        {voices.map((voice) => (
                            <option key={voice} value={voice}>
                                {voice}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.field}>
                    <label htmlFor="speed">发音速度: {settings.speed}</label>
                    <input
                        type="range"
                        id="speed"
                        min="0.4"
                        max="1.0"
                        step="0.1"
                        value={settings.speed}
                        onChange={(e) => setSettings({
                            ...settings,
                            speed: parseFloat(e.target.value)
                        })}
                    />
                </div>
            </section>

            <div className={styles.actions}>
                <button onClick={saveSettings} className={styles.saveButton}>
                    保存设置
                </button>
                <button onClick={exportData} className={styles.exportButton}>
                    导出数据
                </button>
            </div>

            {message && <div className={styles.message}>{message}</div>}
        </div>
    );
};

export default SettingsForm; 