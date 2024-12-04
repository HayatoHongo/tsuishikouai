let response1 = ''; // response1 を保存する変数

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
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: userInput1,
        model: 'gpt-4o-mini',
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      resultDiv1.textContent = `エラー: ${errorData.error || '不明なエラー'}`;
      return;
    }

    const data = await response.json();
    response1 = data.message; // response1 を保存
    resultDiv1.textContent = response1;
  } catch (error) {
    resultDiv1.textContent = '通信エラーが発生しました。';
  }
});

// ステップ2: response1 とユーザー入力2を送信
document.getElementById('submitBtn2').addEventListener('click', async () => {
  const userInput2 = document.getElementById('userInput2').value;
  const resultDiv2 = document.getElementById('response2');

  if (!response1) {
    alert('まず最初のステップを完了してください！');
    return;
  }

  if (!userInput2) {
    alert('追加のアイデアを入力してください！');
    return;
  }

  resultDiv2.textContent = '処理中...';

  try {
    const combinedInput = `${response1}\n\n追加のアイデア: ${userInput2}`;
    const response = await fetch('/api/idea', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: combinedInput,
        model: 'gpt-4o-mini',
        temperature: 0.7
      })
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
});
