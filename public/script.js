document.getElementById('submitBtn').addEventListener('click', async () => {
  const userInput = document.getElementById('userInput').value;
  const resultDiv = document.getElementById('result');

  if (!userInput) {
    alert('アイデアを入力してください！');
    return;
  }

  resultDiv.textContent = '処理中...';

  try {
    console.log('[INFO] Sending request to API with input:', userInput); // リクエスト内容のログ

    const response = await fetch('/api/idea', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: userInput,
        model: 'gpt-4o-mini',
        temperature: 0.7
      })
    });

    console.log('[INFO] Received response:', response); // レスポンスのログ

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[ERROR] API returned an error:', errorData); // サーバーエラーの詳細
      resultDiv.textContent = `エラー: ${errorData.error || '不明なエラー'}`;
      return;
    }

    const data = await response.json();
    console.log('[INFO] Parsed response JSON:', data); // パース後のデータをログ出力

    if (data.message) {
      resultDiv.textContent = data.message;
    } else {
      resultDiv.textContent = 'エラーが発生しました。';
    }
  } catch (error) {
    console.error('[ERROR] Network or parsing error:', error); // ネットワークエラーやパースエラーの詳細
    resultDiv.textContent = '通信エラーが発生しました。';
  }
});
