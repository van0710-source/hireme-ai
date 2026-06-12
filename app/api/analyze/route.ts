import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const resumeText = body.resumeText;

        if (!resumeText || !resumeText.trim()) {
            return NextResponse.json({ error: '请粘贴简历内容' }, { status: 400 });
        }

        // 调用 DeepSeek API
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional resume coach. Analyze the resume and provide 3-5 specific, actionable suggestions for improvement. Be concise and professional. IMPORTANT: You must respond in the SAME LANGUAGE as the user\'s resume. If the resume is in Chinese, respond in Chinese. If in English, respond in English. If in Spanish, respond in Spanish. Always match the user\'s language.'
                    },
                    {
                        role: 'user',
                        content: resumeText
                    }
                ],
            }),
        });

        const data = await response.json();
        const analysis = data.choices[0].message.content;

        return NextResponse.json({ analysis });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: '分析失败，请重试' }, { status: 500 });
    }
}