document.getElementById('submitBtn').addEventListener('click', async () => {
  const userInput = document.getElementById('userInput').value;
  const resultDiv = document.getElementById('result');

  if (!userInput) {
    alert('アイデアを入力してください！');
    return;
  }

  resultDiv.textContent = '処理中...';

  try {
    // APIエンドポイントにリクエストを送信
    const response = await fetch('/api/idea', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: userInput, // ユーザー入力をサーバーに送信
        model: 'gpt-4o-mini', // 必要に応じてデフォルトモデルを指定
        temperature: 0.7 // 必要に応じて柔軟性を指定
      })
    });

    // サーバーからのレスポンスを処理
    const data = await response.json();
    if (data.message) {
      resultDiv.textContent = data.message; // レスポンスメッセージを表示
    } else {
      resultDiv.textContent = 'エラーが発生しました。';
    }
  } catch (error) {
    resultDiv.textContent = '通信エラーが発生しました。';
    console.error('Error:', error);
  }
});
