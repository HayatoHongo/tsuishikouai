const axios = require('axios');

// Vercelで設定された環境変数を読み込む
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    // POST以外のリクエストを拒否
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  if (!OPENAI_API_KEY) {
    // 環境変数が設定されていない場合
    res.status(500).json({ error: 'API key is not configured' });
    return;
  }

  let body = '';

  // リクエストボディを受け取る
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { input, model = "gpt-4o-mini", temperature = 0.7 } = JSON.parse(body);

      if (!input) {
        res.status(400).json({ error: 'Input is required' });
        return;
      }

      // OpenAI APIの呼び出し
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model, // モデル名（デフォルト: gpt-4o-mini）
          messages: [
            { role: 'user', content: input }
          ],
          temperature // テンプレートの柔軟性を指定（デフォルト: 0.7）
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // レスポンスをクライアントに返す
      const completion = response.data.choices[0]?.message?.content || 'No response generated.';
      res.status(200).json({ message: completion });
    } catch (error) {
      console.error('Error communicating with OpenAI:', error.response?.data || error.message);
      res.status(500).json({ error: 'Failed to communicate with OpenAI' });
    }
  });
};
