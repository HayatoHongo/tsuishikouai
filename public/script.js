let responses = {}; // 各ステップのレスポンスを保存するオブジェクト

// ステップ1送信 (Perplexity API)
document.getElementById('submitBtn1').addEventListener('click', async () => {
  const userInput1 = document.getElementById('userInput1').value;
  const resultDiv1 = document.getElementById('response1');

  if (!userInput1) {
    alert('プロンプトを入力してください！');
    return;
  }

  resultDiv1.textContent = '処理中...';

  try {
    const response = await sendRequestToPerplexity(userInput1);
    responses[1] = response;
    resultDiv1.textContent = response;

    // 10秒後に次のステップを開始
    setTimeout(() => autoSendStep(2), 10000);
  } catch (error) {
    resultDiv1.textContent = 'エラーが発生しました。';
    console.error('Error communicating with Perplexity API:', error);
  }
});

// 自動送信処理 (OpenAI API)
async function autoSendStep(step) {
  const prevResponse = responses[step - 1];
  const userInput = document.getElementById(`userInput${step}`).value;
  const resultDiv = document.getElementById(`response${step}`);

  if (!prevResponse) {
    console.warn(`ステップ${step - 1}のレスポンスが存在しないため、処理をスキップします。`);
    return;
  }

  if (!userInput) {
    console.warn(`ステップ${step}のプロンプトが空のため、処理をスキップします。`);
    return;
  }

  resultDiv.textContent = '処理中...';

  try {
    const combinedInput = `${prevResponse}\n\n${userInput}`;
    const response = await sendRequestToOpenAI(combinedInput);
    responses[step] = response;
    resultDiv.textContent = response;

    // 次のステップがある場合、10秒後に実行
    if (step < 4) {
      setTimeout(() => autoSendStep(step + 1), 10000);
    }
  } catch (error) {
    resultDiv.textContent = 'エラーが発生しました。';
  }
}

// Perplexity APIリクエスト送信
async function sendRequestToPerplexity(input) {
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        { role: 'system', content: 'Be precise and concise.' },
        { role: 'user', content: input },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '不明なエラー');
  }

  const data = await response.json();
  return data.choices
    ? data.choices.map(choice => choice.message.content).join('\n\n')
    : 'No response received from Perplexity API.';
}

// OpenAI APIリクエスト送信
async function sendRequestToOpenAI(input) {
  const response = await fetch('/api/idea', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input,
      model: 'gpt-4o-mini',
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '不明なエラー');
  }

  const data = await response.json();
  return data.message;
}
