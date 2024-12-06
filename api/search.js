const axios = require('axios');

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY; // Vercel 環境変数から API キーを取得

if (!PERPLEXITY_API_KEY) {
  console.error('[ERROR] Perplexity API key is not configured.');
  process.exit(1);
}

module.exports = async (req, res) => {
  console.log('[INFO] Perplexity API endpoint accessed');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { model, messages } = JSON.parse(body);

      if (!model || !messages || !Array.isArray(messages)) {
        res.status(400).json({ error: 'Invalid request format' });
        return;
      }

      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model,
          messages,
        },
        {
          headers: {
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      res.status(200).json(response.data);
    } catch (error) {
      console.error('[ERROR] Failed to communicate with Perplexity API:', error.message);
      if (error.response) {
        console.error('[ERROR] Response Data:', JSON.stringify(error.response.data, null, 2));
        res.status(500).json({
          error: 'Perplexity API error',
          details: error.response.data,
        });
      } else if (error.request) {
        console.error('[ERROR] No response received from Perplexity API');
        res.status(500).json({ error: 'No response from Perplexity API' });
      } else {
        res.status(500).json({ error: 'Failed to communicate with Perplexity API', details: error.message });
      }
    }
  });
};
