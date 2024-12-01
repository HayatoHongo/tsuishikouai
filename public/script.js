document.getElementById('submitBtn').addEventListener('click', async () => {
  const userInput = document.getElementById('userInput').value;
  const resultDiv = document.getElementById('result');

  if (!userInput) {
    alert('アイデアを入力してください！');
    return;
  }

  resultDiv.textContent = '処理中...';

  try {
    const response = await fetch('/api/idea', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ input: userInput })
    });

    const data = await response.json();
    if (data.message) {
      resultDiv.textContent = data.message;
    } else {
      resultDiv.textContent = 'エラーが発生しました。';
    }
  } catch (error) {
    resultDiv.textContent = '通信エラーが発生しました。';
    console.error(error);
  }
});
