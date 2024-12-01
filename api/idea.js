const axios = require('axios');

// Vercelで設定された環境変数を読み込む
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 環境変数の内容を確認する
console.log('[DEBUG] Checking OPENAI_API_KEY: ', OPENAI_API_KEY ? 'Loaded' : 'Not Loaded');

module.exports = async (req, res) => {
  console.log('[INFO] API endpoint accessed'); // エンドポイントアクセスのログ

  if (req.method !== 'POST') {
    console.error('[ERROR] Method Not Allowed');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  if (!OPENAI_API_KEY) {
    console.error('[ERROR] API key is not configured');
    res.status(500).json({ error: 'API key is not configured' });
    return;
  }

  console.log('[INFO] API key is configured: ', OPENAI_API_KEY); // 環境変数の内容を表示
  
  let body = '';

  // リクエストボディを受け取る
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      console.log('[INFO] Received body:', body); // 受信データのログ

      const { input, model = "gpt-4o-mini", temperature = 0.7 } = JSON.parse(body);

      if (!input) {
        console.error('[ERROR] Input is required');
        res.status(400).json({ error: 'Input is required' });
        return;
      }

      console.log('[INFO] Sending request to OpenAI API');
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model,
          messages: [
            { role: 'user', content: input }
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

      console.log('[INFO] Received response from OpenAI:', response.data);

      // OpenAIのレスポンスからメッセージを抽出
      const completion = response.data.choices[0]?.message?.content || 'No response generated.';
      res.status(200).json({ message: completion });
    } catch (error) {
      console.error('[ERROR] Failed to communicate with OpenAI:', error.response?.data || error.message);
      res.status(500).json({ error: 'Failed to communicate with OpenAI' });
    }
  });
};
