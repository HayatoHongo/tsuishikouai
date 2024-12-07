let responses = {}; // 各ステップのレスポンスを保存するオブジェクト
let currentStepCount = 1; // 現在何ステップあるか（userInput1は固定で存在するため初期値1）

const submitBtn1 = document.getElementById('submitBtn1');
const addStepBtn = document.getElementById('addStepBtn');
const removeStepBtn = document.getElementById('removeStepBtn');
const stepsContainer = document.getElementById('stepsContainer');

// ステップ2以降を追加する関数
function addStep() {
  currentStepCount++;
  const stepNumber = currentStepCount;
  const stepDiv = document.createElement('div');
  stepDiv.classList.add('step-block');
  stepDiv.setAttribute('data-step', stepNumber);

  const textarea = document.createElement('textarea');
  textarea.id = `userInput${stepNumber}`;
  textarea.placeholder = `プロンプトを編集してください (ステップ${stepNumber})...`;

  const responseDiv = document.createElement('div');
  responseDiv.id = `response${stepNumber}`;
  responseDiv.className = 'result';

  stepDiv.appendChild(textarea);
  stepDiv.appendChild(responseDiv);

  stepsContainer.appendChild(stepDiv);
}

// 最後のステップを削除する関数
function removeStep() {
  if (currentStepCount <= 1) {
    alert('これ以上ステップを削除できません。ステップ1は必須です。');
    return;
  }
  const stepBlocks = stepsContainer.querySelectorAll('.step-block');
  const lastStep = stepBlocks[stepBlocks.length - 1];
  lastStep.remove();
  delete responses[currentStepCount];
  currentStepCount--;
}

// ステップ1送信 (Perplexity API)
submitBtn1.addEventListener('click', async () => {
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

    // 10秒後に次のステップを開始（もし存在すれば）
    if (currentStepCount > 1) {
      setTimeout(() => autoSendStep(2), 10000);
    }
  } catch (error) {
    resultDiv1.textContent = 'エラーが発生しました。';
    console.error('Error communicating with Perplexity API:', error);
  }
});

// 自動送信処理 (OpenAI API) - step 2以降
async function autoSendStep(step) {
  const prevResponse = responses[step - 1];
  const userInputElement = document.getElementById(`userInput${step}`);
  const resultDiv = document.getElementById(`response${step}`);

  if (!prevResponse) {
    console.warn(`ステップ${step - 1}のレスポンスが存在しないため、処理をスキップします。`);
    return;
  }

  if (!userInputElement) {
    console.warn(`ステップ${step}の要素が存在しないため、処理を終了します。`);
    return;
  }

  const userInput = userInputElement.value;

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
    if (step < currentStepCount) {
      setTimeout(() => autoSendStep(step + 1), 10000);
    }
  } catch (error) {
    resultDiv.textContent = 'エラーが発生しました。';
    console.error('Error communicating with OpenAI API:', error);
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

// ボタンイベント
addStepBtn.addEventListener('click', addStep);
removeStepBtn.addEventListener('click', removeStep);

// 初期状態では追加ステップなし（userInput1のみ）
