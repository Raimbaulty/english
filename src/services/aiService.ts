import type { Chunk } from './chunkService';

interface AIConfig {
    apiUrl: string;
    apiKey: string;
}

export const generateDialogue = async (
    scene: string, 
    config: AIConfig,
    onProgress: (text: string) => void
): Promise<string> => {
    try {
        const response = await fetch(`${config.apiUrl}/v1beta/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                model: 'gemini-2.0-flash-exp',
                messages: [
                    {
                        role: 'user',
                        content: `Generate a natural dialogue in English for the following scene: ${scene}. 
                        The dialogue should be realistic, include at least 3 speakers, and cover common expressions 
                        and phrases used in this situation. Format the dialogue with speaker names and their lines.`
                    }
                ],
                stream: true
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate dialogue');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        if (!reader) {
            throw new Error('Failed to read response');
        }

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;
                    
                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices[0]?.delta?.content || '';
                        fullText += content;
                        onProgress(fullText);
                    } catch (e) {
                        console.error('Error parsing streaming response:', e);
                    }
                }
            }
        }

        return fullText;
    } catch (error) {
        console.error('Error generating dialogue:', error);
        throw error;
    }
};

export const generateChunks = async (dialogue: string, config: AIConfig): Promise<Chunk[]> => {
    try {
        const response = await fetch(`${config.apiUrl}/v1beta/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                model: 'gemini-exp-1206',
                messages: [
                    {
                        role: 'user',
                        content: `Extract all English chunks (not complete sentences, please understand the requirements carefully) suitable for English beginners from this, and the output format is JSON, including fields that you organize yourself (including chunks themselves, pronunciation phonetic symbols, Chinese meanings and a list of suitable scenes):\n\n${dialogue}`
                    }
                ],
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate chunks');
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error('No content in response');
        }

        try {
            const cleanContent = content
                .replace(/^```json\s*/m, '')  // 移除开头的 ```json
                .replace(/\s*```\s*$/m, '')   // 移除结尾的 ```
                .trim();

            console.log('Cleaned content:', cleanContent); // 调试用

            const parsedContent = JSON.parse(cleanContent);
            
            const jsonContent = Array.isArray(parsedContent) 
                ? { chunks: parsedContent }
                : parsedContent;

            if (!jsonContent.chunks || !Array.isArray(jsonContent.chunks)) {
                throw new Error('Invalid chunks format in response');
            }

            return jsonContent.chunks.map((chunk: any) => ({
                chunk: chunk.chunk || '',
                pronunciation: chunk.pronunciation || '',
                chinese_meaning: chunk.meaning || chunk.chinese_meaning || '',
                suitable_scenes: Array.isArray(chunk.scenes || chunk.suitable_scenes) 
                    ? (chunk.scenes || chunk.suitable_scenes) 
                    : [],
            }));
        } catch (e) {
            console.error('Error parsing JSON:', e);
            console.error('Content was:', content); // 调试用
            throw new Error('Failed to parse chunks data');
        }
    } catch (error) {
        console.error('Error generating chunks:', error);
        throw error;
    }
}; 