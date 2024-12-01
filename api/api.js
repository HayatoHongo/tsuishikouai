const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { input } = req.body;

  if (!input) {
    res.status(400).json({ error: 'Input is required' });
    return;
  }

  try {
    // OpenAI GPT APIの呼び出し
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'システムメッセージをここに入力'
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
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // リスポンスから内容を抽出
    const assistantMessage = response.data.choices[0].message.content;

    res.status(200).json({ message: assistantMessage });
  } catch (error) {
    console.error('Error communicating with OpenAI:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate response from OpenAI' });
  }
};
