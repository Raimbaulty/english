import React, { useState } from 'react';
import { scenes } from '@/data/scenes';
import { generateDialogue, generateChunks } from '@/services/aiService';
import ChunkCard from './ChunkCard';
import MarkdownRenderer from './MarkdownRenderer';
import styles from './SceneList.module.css';

interface AIConfig {
    apiUrl: string;
    apiKey: string;
}

const CHUNK_GENERATION_DELAY = 3000; // 3 seconds delay

const SceneList = () => {
    const [selectedScene, setSelectedScene] = useState<string | null>(null);
    const [chunks, setChunks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dialogue, setDialogue] = useState<string>('');
    const [processingStep, setProcessingStep] = useState<'idle' | 'generating-dialogue' | 'generating-chunks'>('idle');
    const [progress, setProgress] = useState(0);
    const [customSceneInput, setCustomSceneInput] = useState('');
    const [isDialogueExpanded, setIsDialogueExpanded] = useState(false);

    const handleSceneClick = async (sceneId: string) => {
        if (sceneId === 'custom') {
            setSelectedScene('custom');
            return;
        }

        await generateSceneDialogue(sceneId);
    };

    const handleCustomSceneSubmit = async () => {
        if (!customSceneInput.trim()) return;
        await generateSceneDialogue('custom', customSceneInput);
    };

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const generateSceneDialogue = async (sceneId: string, customPrompt?: string) => {
        setLoading(true);
        setError(null);
        setSelectedScene(sceneId);
        setDialogue('');
        setChunks([]);
        setProgress(0);
        setProcessingStep('generating-dialogue');

        try {
            // Get API configuration from localStorage
            const savedSettings = localStorage.getItem('userSettings');
            if (!savedSettings) {
                throw new Error('请先在设置中配置 API 信息');
            }

            const settings = JSON.parse(savedSettings);
            const config: AIConfig = {
                apiUrl: settings.gemini.baseUrl,
                apiKey: settings.gemini.apiKey,
            };

            if (!config.apiUrl || !config.apiKey) {
                throw new Error('请先在设置中配置 API URL 和 API Key');
            }

            const scene = scenes.find(s => s.id === sceneId);
            if (!scene && !customPrompt) return;

            // First generate the dialogue with streaming updates
            const fullDialogue = await generateDialogue(
                customPrompt || scene!.title,
                config,
                (text) => {
                    // Convert the dialogue to markdown format
                    const markdownText = text
                        .split('\n')
                        .map(line => {
                            if (line.includes(':')) {
                                const [speaker, content] = line.split(':').map(part => part.trim());
                                return `**${speaker}**: ${content}`;
                            }
                            return line;
                        })
                        .join('\n\n');
                    setDialogue(markdownText);
                    // Simulate progress for dialogue generation (0-50%)
                    setProgress(Math.min(50, (text.length / 500) * 50));
                }
            );

            // Add a delay before generating chunks
            setProcessingStep('generating-chunks');
            setProgress(60);
            await delay(CHUNK_GENERATION_DELAY);

            // Then generate chunks
            try {
                const generatedChunks = await generateChunks(fullDialogue, config);
                setChunks(generatedChunks);
                setProgress(100);
                setProcessingStep('idle');
                setIsDialogueExpanded(false);
            } catch (chunkError) {
                console.error('Chunk generation error:', chunkError);
                // If chunk generation fails, still show the dialogue but with an error message
                setError('英语块生成失败，请稍后重试。您仍然可以查看生成的对话。');
                setProcessingStep('idle');
            }
        } catch (err) {
            console.error('Dialogue generation error:', err);
            setError(err instanceof Error ? err.message : '生成对话时出错');
            setSelectedScene(null);
            setProcessingStep('idle');
        } finally {
            setLoading(false);
        }
    };

    const getLoadingMessage = () => {
        switch (processingStep) {
            case 'generating-dialogue':
                return '正在生成对话...';
            case 'generating-chunks':
                return '正在提取英语块...';
            default:
                return '';
        }
    };

    return (
        <div className={styles.container}>
            {!selectedScene ? (
                <div className={styles.grid}>
                    {scenes.map((scene) => (
                        <div
                            key={scene.id}
                            className={styles.sceneCard}
                            onClick={() => handleSceneClick(scene.id)}
                        >
                            <div className={styles.icon} dangerouslySetInnerHTML={{ __html: scene.icon }} />
                            <h3>{scene.title}</h3>
                            <p>{scene.description}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.dialogueContainer}>
                    <button
                        className={styles.backButton}
                        onClick={() => {
                            setSelectedScene(null);
                            setChunks([]);
                            setDialogue('');
                            setProcessingStep('idle');
                            setCustomSceneInput('');
                            setProgress(0);
                        }}
                    >
                        返回场景列表
                    </button>

                    {selectedScene === 'custom' && processingStep === 'idle' && (
                        <div>
                            <input
                                type="text"
                                className={styles.customSceneInput}
                                value={customSceneInput}
                                onChange={(e) => setCustomSceneInput(e.target.value)}
                                placeholder="请输入你想练习的具体场景，例如：在咖啡店点一杯拿铁"
                            />
                            <button
                                className={styles.customSceneButton}
                                onClick={handleCustomSceneSubmit}
                                disabled={!customSceneInput.trim()}
                            >
                                生成对话
                            </button>
                        </div>
                    )}
                    
                    {processingStep !== 'idle' && (
                        <div className={styles.loading}>
                            {getLoadingMessage()}
                            <div className={styles.progressContainer}>
                                <div 
                                    className={styles.progressBar} 
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            {processingStep === 'generating-dialogue' && dialogue && (
                                <div className={styles.dialoguePreview}>
                                    <MarkdownRenderer content={dialogue} />
                                </div>
                            )}
                        </div>
                    )}
                    
                    {error && <div className={styles.error}>{error}</div>}
                    
                    {dialogue && (
                        <>
                            <div className={styles.dialogueCollapse}>
                                <div 
                                    className={styles.dialogueHeader}
                                    onClick={() => setIsDialogueExpanded(!isDialogueExpanded)}
                                >
                                    <span>原始对话{isDialogueExpanded ? ' (点击收起)' : ' (点击展开)'}</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{
                                            transform: isDialogueExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.3s ease'
                                        }}
                                    >
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                                <div className={`${styles.dialogueContent} ${isDialogueExpanded ? styles.expanded : ''}`}>
                                    <MarkdownRenderer content={dialogue} />
                                </div>
                            </div>
                            {chunks.length > 0 && (
                                <div className={styles.chunksGrid}>
                                    {chunks.map((chunk, index) => (
                                        <ChunkCard key={index} chunk={chunk} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SceneList; 