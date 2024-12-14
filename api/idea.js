const axios = require('axios');

// Vercelで設定された環境変数を読み込む
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 環境変数の内容を確認する
console.log('[DEBUG] Checking OPENAI_API_KEY: ', OPENAI_API_KEY ? 'Loaded' : 'Not Loaded');

module.exports = async (req, res) => {
  console.log('[INFO] OpenAI API endpoint accessed');

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
      // 受け取ったデータをJSONとしてパース
      const parsedBody = JSON.parse(body);
      const { input, model = "gpt-o1-preview", temperature = 0.7 } = parsedBody;
      console.log(`input is as follows: ${input}`);

      if (!input) {
        res.status(400).json({ error: 'Input is required' });
        return;
      }

      // OpenAI APIにリクエストを送信
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model,
          messages: [{ role: 'user', content: input }], // ユーザー入力
          temperature,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // レスポンスから生成されたテキストを取得
      const completion = response.data.choices[0]?.message?.content || 'No response generated.';
      res.status(200).json({ message: completion });
    } catch (error) {
      // エラーハンドリングを改善
      console.error('[ERROR] Failed to communicate with OpenAI:', error.message);

      if (error.response) {
        // OpenAIからのエラーの場合
        console.error('[ERROR] Response Data:', JSON.stringify(error.response.data, null, 2));
        res.status(500).json({
          error: 'OpenAI API error',
          details: error.response.data,
        });
      } else if (error.request) {
        // リクエストが送信されて応答がなかった場合
        console.error('[ERROR] No response received from OpenAI API');
        res.status(500).json({ error: 'No response from OpenAI API' });
      } else {
        // その他のエラー
        res.status(500).json({ error: 'Failed to communicate with OpenAI', details: error.message });
      }
    }
  });
};
