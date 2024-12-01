const http = require('http');
const axios = require('axios');

// サーバーポートの設定
const PORT = process.env.PORT || 3000;

// 環境変数の読み込み (dotenvは不要、Vercelで設定)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// サーバー作成
const server = http.createServer(async (req, res) => {
  // POSTリクエストの処理
  if (req.method === 'POST' && req.url === '/api/idea') {
    let body = '';

    // リクエストボディを受け取る
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { input } = JSON.parse(body);

        if (!input) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Input is required' }));
          return;
        }

        // OpenAI APIを呼び出す
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'Generate creative ideas based on user input.'
              },
              {
                role: 'user',
                content: input
              }
            ],
            max_tokens: 300
          },
          {
            headers: {
              Authorization: `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // OpenAIからのレスポンスを取得
        const assistantMessage = response.data.choices[0].message.content;

        // レスポンスを返す
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: assistantMessage }));
      } catch (error) {
        console.error('Error communicating with OpenAI:', error.response?.data || error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to communicate with OpenAI' }));
      }
    });
  } else {
    // その他のリクエストは404を返す
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

// サーバー起動
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
