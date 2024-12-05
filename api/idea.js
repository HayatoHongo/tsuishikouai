const axios = require('axios');

// 環境変数のチェック
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('[ERROR] OPENAI_API_KEY is not configured.');
  process.exit(1);
}

module.exports = async (req, res) => {
  console.log('[INFO] API endpoint accessed');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const body = JSON.parse(req.body);

    const { input, model = "gpt-4o-mini", temperature = 0.7 } = body;

    if (!input) {
      res.status(400).json({ error: 'Input is required' });
      return;
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        messages: [
          { role: 'user', content: input },
        ],
        temperature,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const completion = response.data.choices[0]?.message?.content || 'No response generated.';
    res.status(200).json({ message: completion });
  } catch (error) {
    console.error('[ERROR] Failed to communicate with OpenAI:', error.message);
    res.status(500).json({
      error: 'Failed to communicate with OpenAI',
      details: error.message,
    });
  }
};
