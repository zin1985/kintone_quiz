---
layout: default
title: "Kintone アソシエイト模擬試験"
---
# Kintone アソシエイト模擬試験

出題数 (最大 50 問) を入力して「試験開始」を押してください。

<form id="startForm">
  <label>出題数:
    <input type="number" id="qCount" value="50" min="1" max="50" required>
  </label>
  <button type="submit">試験開始</button>
</form>

<script>
// 入力された出題数をクエリパラメータに付けて quiz.html へ遷移
document.getElementById('startForm').addEventListener('submit', e => {
  e.preventDefault();
  const n = document.getElementById('qCount').value;
  window.location.href = `quiz.html?count=${n}`;
});
</script>
