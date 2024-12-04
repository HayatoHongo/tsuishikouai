const axios = require('axios');

// Vercelで設定された環境変数を読み込む
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 環境変数の内容を確認する
console.log('[DEBUG] Checking OPENAI_API_KEY: ', OPENAI_API_KEY ? 'Loaded' : 'Not Loaded');

module.exports = async (req, res) => {
  console.log('[INFO] API endpoint accessed');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  if (!OPENAI_API_KEY) {
    res.status(500).json({ error: 'API key is not configured' });
    return;
  }

  let body = '';
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

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model,
          messages: [
            { role: 'user', content: input } // クライアント側からの入力をそのまま使用
          ],
          temperature
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const completion = response.data.choices[0]?.message?.content || 'No response generated.';
      res.status(200).json({ message: completion });
    } catch (error) {
      res.status(500).json({ error: 'Failed to communicate with OpenAI' });
    }
  });
};

