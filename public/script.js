let responses = {}; // 各ステップのレスポンスを保存するオブジェクト
let currentStepCount = 1; // 現在のステップ数（初期は1）

// ステップブロックを追加する関数
function addStep(afterStepElement) {
  currentStepCount++;
  const stepDiv = createStepBlock(currentStepCount);

  // 指定されたブロックの直下に追加
  afterStepElement.insertAdjacentElement('afterend', stepDiv);

  // ステップ番号を再割り振り
  reassignStepNumbers();
}

// ステップ番号を再割り振りする関数
function reassignStepNumbers() {
  const stepBlocks = document.querySelectorAll('.step-block');
  stepBlocks.forEach((block, index) => {
    const newStepNumber = index + 1; // 新しい番号
    block.setAttribute('data-step', newStepNumber);

    // IDとPlaceholderの更新
    const textarea = block.querySelector('textarea');
    const label = block.querySelector('label');
    const select = block.querySelector('select');
    const responseDiv = block.querySelector('.result');

    if (textarea) {
      textarea.id = `userInput${newStepNumber}`;
      textarea.placeholder = `プロンプトを編集してください (ステップ${newStepNumber})...`;
    }
    if (label) {
      label.setAttribute('for', `apiSelect${newStepNumber}`);
    }
    if (select) {
      select.id = `apiSelect${newStepNumber}`;
      select.addEventListener('change', () => updateBlockColor(block, select.value));
    }
    if (responseDiv) {
      responseDiv.id = `response${newStepNumber}`;
    }

    // ボタンイベント再設定
    const addButton = block.querySelector('.addStepBtn');
    const removeButton = block.querySelector('.removeStepBtn');
    if (addButton) {
      addButton.onclick = () => addStep(block);
    }
    if (removeButton) {
      removeButton.onclick = () => removeStep(block);
    }
  });
}

// 新しいステップブロックを作成する関数
function createStepBlock(stepNumber) {
  const stepDiv = document.createElement('div');
  stepDiv.classList.add('step-block');
  stepDiv.setAttribute('data-step', stepNumber);

  // 上中央コントロール部
  const topControls = document.createElement('div');
  topControls.className = 'block-controls top-center';
  const removeBtn = document.createElement('button');
  removeBtn.className = 'removeStepBtn';
  removeBtn.textContent = '− ブロック削除';
  removeBtn.onclick = () => removeStep(stepDiv);
  topControls.appendChild(removeBtn);

  // API選択
  const label = document.createElement('label');
  label.setAttribute('for', `apiSelect${stepNumber}`);
  label.textContent = '使用するAPI:';

  const select = document.createElement('select');
  select.id = `apiSelect${stepNumber}`;
  select.addEventListener('change', () => updateBlockColor(stepDiv, select.value));
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
  addBtn.onclick = () => addStep(stepDiv);

  bottomControls.appendChild(addBtn);

  stepDiv.appendChild(topControls);
  stepDiv.appendChild(label);
  stepDiv.appendChild(select);
  stepDiv.appendChild(textarea);
  stepDiv.appendChild(responseDiv);
  stepDiv.appendChild(bottomControls);

  // 初期色を設定
  updateBlockColor(stepDiv, select.value);

  return stepDiv;
}

// ステップを削除する関数
function removeStep(stepBlock) {
  stepBlock.remove();
  reassignStepNumbers();
}

// ステップ1の「送信」ボタンイベント
const submitBtn1 = document.getElementById('submitBtn1');
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
  } catch (error) {
    resultDiv1.textContent = 'エラーが発生しました。';
    console.error('Error:', error);
  }
});

// ステップ1のAPI選択による背景色変更
const apiSelect1 = document.getElementById('apiSelect1');
apiSelect1.addEventListener('change', () => {
  const stepDiv1 = document.querySelector('.step-block[data-step="1"]');
  updateBlockColor(stepDiv1, apiSelect1.value);
});

// ブロックの背景色をAPI選択に応じて更新
function updateBlockColor(block, apiType) {
  if (apiType === 'perplexity') {
    block.style.backgroundColor = '#d4f7d4'; // 緑色
  } else if (apiType === 'openai') {
    block.style.backgroundColor = '#e8d4f7'; // 紫色
  } else {
    block.style.backgroundColor = ''; // デフォルト
  }
}
