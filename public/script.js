let responses = {}; // 各ステップのレスポンスを保存するオブジェクト
let currentStepCount = 1; // 現在のステップ数(最初は1)
const submitBtn1 = document.getElementById('submitBtn1');
const stepsContainer = document.getElementById('stepsContainer');

// ステップブロックを追加する関数
function addStep() {
  currentStepCount++;
  const stepNumber = currentStepCount;
  
  const stepDiv = document.createElement('div');
  stepDiv.classList.add('step-block');
  stepDiv.setAttribute('data-step', stepNumber);

  // 上中央コントロール部
  const topControls = document.createElement('div');
  topControls.className = 'block-controls top-center';
  const removeBtn = document.createElement('button');
  removeBtn.className = 'removeStepBtn';
  removeBtn.textContent = '− ブロック削除';
  removeBtn.addEventListener('click', () => removeStep(stepNumber));
  topControls.appendChild(removeBtn);

  // API選択
  const label = document.createElement('label');
  label.setAttribute('for', `apiSelect${stepNumber}`);
  label.textContent = '使用するAPI:';

  const select = document.createElement('select');
  select.id = `apiSelect${stepNumber}`;
  const optionP = document.createElement('option');
  optionP.value = 'perplexity';
  optionP.textContent = 'Perplexity';
  const optionO = document.createElement('option');
  optionO.value = 'openai';
  optionO.textContent = 'OpenAI';
  optionO.selected = true;
  
  select.appendChild(optionP);
  select.appendChild(optionO);

  const textarea = document.createElement('textarea');
  textarea.id = `userInput${stepNumber}`;
  textarea.placeholder = `プロンプトを編集してください (ステップ${stepNumber})...`;

  const responseDiv = document.createElement('div');
  responseDiv.id = `response${stepNumber}`;
  responseDiv.className = 'result';

  // 下中央コントロール部
  const bottomControls = document.createElement('div');
  bottomControls.className = 'block-controls bottom-center';
  const addBtn = document.createElement('button');
  addBtn.className = 'addStepBtn';
  addBtn.textContent = '＋ ブロック追加';
  addBtn.addEventListener('click', addStep);
  bottomControls.appendChild(addBtn);

  stepDiv.appendChild(topControls);
  stepDiv.appendChild(label);
  stepDiv.appendChild(select);
  stepDiv.appendChild(textarea);
  stepDiv.appendChild(responseDiv);
  stepDiv.appendChild(bottomControls);

  stepsContainer.appendChild(stepDiv);
}

// ステップを削除する関数
function removeStep(stepNumber) {
  // ステップ1は削除不可
  if (stepNumber === 1) {
    alert('ステップ1は削除できません。');
    return;
  }

  const stepBlock = document.querySelector(`.step-block[data-step="${stepNumber}"]`);
  if (stepBlock) {
    stepBlock.remove();
    delete responses[stepNumber];
    // currentStepCountは減らさず、そのままにしておく（ユニークIDとして扱う）
  }
}

// ステップ1送信イベント
submitBtn1.addEventListener('click', async () => {
  const userInput1 = document.getElementById('userInput1').value;
  const resultDiv1 = document.getElementById('response1');
  const apiSelect1 = document.getElementById('apiSelect1').value;

  if (!userInput1) {
    alert('プロンプトを入力してください！');
    return;
  }

  resultDiv1.textContent = '処理中...';

  try {
    const response = await processStep(1, '', userInput1, apiSelect1);
    responses[1] = response;
    resultDiv1.textContent = response;

    // 次のステップがあれば10秒後に実行
    if (currentStepCount > 1) {
      setTimeout(() => autoSendStep(2), 10000);
    }
  } catch (error) {
    resultDiv1.textContent = 'エラーが発生しました。';
    console.error('Error:', error);
  }
});

// 共通処理関数
async function processStep(step, prevResponse, userInput, apiType) {
  const combinedInput = prevResponse ? `${prevResponse}\n\n${userInput}` : userInput;
  if (apiType === 'perplexity') {
    return await sendRequestToPerplexity(combinedInput);
  } else if (apiType === 'openai') {
    return await sendRequestToOpenAI(combinedInput);
  } else {
    throw new Error(`不明なAPIタイプ: ${apiType}`);
  }
}

// 自動送信処理 (ステップ2以降)
async function autoSendStep(step) {
  const prevResponse = responses[step - 1];
  const userInputElement = document.getElementById(`userInput${step}`);
  const resultDiv = document.getElementById(`response${step}`);
  const apiSelect = document.getElementById(`apiSelect${step}`);

  if (!prevResponse) {
    console.warn(`ステップ${step - 1}のレスポンスが存在しないため処理をスキップします。`);
    return;
  }

  if (!userInputElement) {
    console.warn(`ステップ${step}の要素が存在しないため、処理を終了します。`);
    return;
  }

  const userInput = userInputElement.value;
  const apiType = apiSelect ? apiSelect.value : 'openai';

  if (!userInput) {
    console.warn(`ステップ${step}のプロンプトが空です。処理をスキップします。`);
    return;
  }

  resultDiv.textContent = '処理中...';

  try {
    const response = await processStep(step, prevResponse, userInput, apiType);
    responses[step] = response;
    resultDiv.textContent = response;

    // 次のステップがある場合、10秒後に実行
    if (Array.from(document.querySelectorAll('.step-block')).some(b => parseInt(b.getAttribute('data-step')) === step + 1)) {
      setTimeout(() => autoSendStep(step + 1), 10000);
    }
  } catch (error) {
    resultDiv.textContent = 'エラーが発生しました。';
    console.error('Error:', error);
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
