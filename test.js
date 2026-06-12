const OpenAI = require('openai');

const openai = new OpenAI({
    baseURL: "https://api.deepseek.com/v1",
    apiKey: process.env.DEEPSEEK_API_KEY,
});

async function main() {
    console.log('正在通过 DeepSeek 调用...');
    
    try {
        const completion = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                { role: "user", content: "Say hello in one word." }
            ],
        });
        
        console.log('成功！回复：', completion.choices[0].message.content);
    } catch (error) {
        console.error('错误：', error.message);
    }
}

main();
