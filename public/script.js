let response1 = ''; // response1 を保存する変数
let savedUserInput2 = ''; // userInput2 を保存する変数

// ステップ1: ユーザー入力1を送信
document.getElementById('submitBtn1').addEventListener('click', async () => {
  const userInput1 = document.getElementById('userInput1').value;
  const resultDiv1 = document.getElementById('response1');

  if (!userInput1) {
    alert('アイデアを入力してください！');
    return;
  }

  resultDiv1.textContent = '処理中...';

  try {
    const response = await fetch('/api/idea', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: userInput1,
        model: 'gpt-4o-mini',
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      resultDiv1.textContent = `エラー: ${errorData.error || '不明なエラー'}`;
      return;
    }

    const data = await response.json();
    response1 = data.message; // response1 を保存
    resultDiv1.textContent = response1;

    // response1 が返ってきたら 10 秒後に自動送信を開始
    setTimeout(autoSendStep2, 10000);
  } catch (error) {
    resultDiv1.textContent = '通信エラーが発生しました。';
  }
});

// ステップ2: userInput2 の保存
document.getElementById('userInput2').addEventListener('input', (event) => {
  savedUserInput2 = event.target.value; // userInput2 をリアルタイムで保存
});

// ステップ2: response1 と保存された userInput2 を自動送信
async function autoSendStep2() {
  const resultDiv2 = document.getElementById('response2');

  if (!response1) {
    console.warn('response1 が存在しないため、自動送信をスキップします。');
    return;
  }

  if (!savedUserInput2) {
    console.warn('保存された userInput2 が空のため、自動送信をスキップします。');
    return;
  }

  resultDiv2.textContent = '処理中...';

  try {
    const combinedInput = `${response1}\n\n追加のアイデア: ${savedUserInput2}`;
    const response = await fetch('/api/idea', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: combinedInput,
        model: 'gpt-4o-mini',
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      resultDiv2.textContent = `エラー: ${errorData.error || '不明なエラー'}`;
      return;
    }

    const data = await response.json();
    resultDiv2.textContent = data.message; // response2 を表示
  } catch (error) {
    resultDiv2.textContent = '通信エラーが発生しました。';
  }
}
