// quiz.js — クライアントサイドの全機能を担当
// ============================================
// 1. _data/questions.json を fetch
// 2. 指定数 (URL ?count=) の問題をランダム抽出
// 3. 60 分タイマーを開始 (固定)
// 4. 動的にフォームを生成 (checkbox multiple)
// 5. 送信またはタイムアップで採点
// 6. カテゴリ別正答率を Chart.js で表示
// 7. 各問題の○×・解説を review セクションに表示
// ============================================

// --- URL パラメータから出題数を取得 ---
const params = new URLSearchParams(location.search);
const Q_COUNT = Math.min(parseInt(params.get('count') || '50', 10), 50);

// --- タイマー設定 (60 分固定) ---
const TIMER_SEC = 60 * 60;
let currentSec = TIMER_SEC;
let timerInterval;

// --- 質問データを取得して開始 ---
const base = "/kintone_quiz";
fetch(`${base}/assets/data/questions.json`)
  .then(res => res.json())
  .then(setupExam)
  .catch(err => alert('問題データの読み込みに失敗しました: ' + err));

// ---------------------------------
// Exam セットアップ
// ---------------------------------
function setupExam(bank) {
  // ランダムで Q_COUNT 問を抽出
  const pool = [...bank.questions];
  shuffle(pool);
  const selected = pool.slice(0, Q_COUNT);

  // 問題のフォーム生成
  const quizForm = document.getElementById('quizForm');
  selected.forEach((q, idx) => {
    const fs = document.createElement('fieldset');
    fs.innerHTML = `<legend>${idx + 1}. ${q.question}</legend>`;
    for (const key of Object.keys(q.options)) {
      const opt = q.options[key];
      const id = `q${idx}_${key}`;
      fs.insertAdjacentHTML(
        'beforeend',
        `<label><input type="checkbox" name="${idx}" value="${key}" id="${id}"> ${key}. ${opt}</label><br>`
      );
    }
    quizForm.appendChild(fs);
  });

  // 送信ボタン有効化
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.classList.remove('hidden');
  submitBtn.onclick = () => grade(selected);

  // タイマー開始
  timerInterval = setInterval(() => {
    currentSec--;
    updateTimer();
    if (currentSec <= 0) {
      clearInterval(timerInterval);
      grade(selected);
    }
  }, 1000);
  updateTimer();
}

// タイマー表示更新
function updateTimer() {
  const m = String(Math.floor(currentSec / 60)).padStart(2, '0');
  const s = String(currentSec % 60).padStart(2, '0');
  document.getElementById('timer').textContent = `${m}:${s}`;
}

// ---------------------------------
// 採点処理
// ---------------------------------
function grade(selected) {
  clearInterval(timerInterval);

  const formData = new FormData(document.getElementById('quizForm'));
  let correct = 0;
  const catMap = {};   // { category: { correct, total } }
  const reviewHTML = [];

  selected.forEach((q, idx) => {
    // ユーザー解答取得 (複数可)
    const chosen = formData.getAll(String(idx));
    const isCorrect = arraysEqual(chosen.sort(), q.answer.sort());
    if (isCorrect) correct++;

    // カテゴリ別 tally
    if (!catMap[q.category]) catMap[q.category] = { correct: 0, total: 0 };
    catMap[q.category].total++;
    if (isCorrect) catMap[q.category].correct++;

    // 各問題のレビュー
    reviewHTML.push(`
      <details>
        <summary>${idx + 1}. ${isCorrect ? '⭕️' : '❌'} ${q.question}</summary>
        <p><strong>あなたの解答:</strong> ${chosen.join(',') || '未回答'}</p>
        <p><strong>正解:</strong> ${q.answer.join(',')}</p>
        <p><em>${q.explanation}</em></p>
      </details>
    `);
  });

  // スコア概要
  const percent = Math.round((correct / selected.length) * 100);
  document.getElementById('scoreSummary').innerHTML =
    `<p>正解 ${correct} / ${selected.length} (${percent}%)</p>`;

  // カテゴリ別正答率グラフ
  const labels = Object.keys(catMap);
  const dataCorrect = labels.map(k => catMap[k].correct);
  const dataIncorrect = labels.map(k => catMap[k].total - catMap[k].correct);

  new Chart(document.getElementById('catChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: '正解', data: dataCorrect },
        { label: '不正解', data: dataIncorrect }
      ]
    }
  });

  // レビュー HTML 出力
  document.getElementById('fullReview').innerHTML = reviewHTML.join('');

  // 結果セクション表示
  document.getElementById('result').classList.remove('hidden');
  document.getElementById('submitBtn').disabled = true;
}

// ---------------------------------
// ユーティリティ
// ---------------------------------
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
function arraysEqual(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
