// ボタンのクリックイベントを設定
document.getElementById('submitBtn').addEventListener('click', async () => {
    const userInput = document.getElementById('userInput').value.trim();
    const resultDiv = document.getElementById('result');
  
    // 入力チェック
    if (!userInput) {
      alert('入力が空です。アイデアを入力してください。');
      return;
    }
  
    // ローディング中の表示
    resultDiv.textContent = '処理中...';
  
    try {
      // サーバーにリクエストを送信
      const response = await fetch('/api/idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: userInput }),
      });
  
      if (!response.ok) {
        throw new Error('サーバーエラー');
      }
  
      // 結果を取得して表示
      const data = await response.json();
      const ideas = data.ideas || [];
      resultDiv.innerHTML = ideas.map((idea, index) => `<p>${index + 1}. ${idea}</p>`).join('');
    } catch (error) {
      resultDiv.textContent = 'エラーが発生しました。もう一度お試しください。';
      console.error(error);
    }
  });
  