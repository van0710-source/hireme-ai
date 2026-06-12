const { SocksProxyAgent } = require('socks-proxy-agent');
const fetch = require('node-fetch');

const agent = new SocksProxyAgent('socks5://127.0.0.1:7897');

async function main() {
    console.log('正在调用 OpenAI API (fetch + SOCKS5)...');
    
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'user', content: 'Say hello in one word' }
                ],
                max_tokens: 10
            }),
            agent: agent
        });
        
        if (!response.ok) {
            const error = await response.text();
            console.error('HTTP 错误:', response.status, error);
            return;
                                   ta = await response.json();
        console.log('成功！�        console.log('成功！�   tent);
    } catch (error) {
        console.error('错误:', error.message);
    }
}

main();
