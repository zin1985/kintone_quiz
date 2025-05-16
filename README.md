# Kintone Associate Mock Exam Starter Kit

GitHub Pages + Jekyll で動作する kintone アソシエイト試験 模擬試験サイトのスターターキットです。

## 特徴
* JSON からランダム抽出（50 問以上登録しても OK）
* 出題数を開始前に指定
* 60 分タイマー、解答送信、自動採点
* カテゴリ別正答率グラフ (Chart.js)
* 全問題の解説を `details` で確認可能
* Python スクリプトで JSON バンクを検証・結合

## セットアップ
1. zip を展開し、GitHub リポジトリへ push
2. GitHub Pages で `main` ブランチを公開
3. カスタムドメインも設定可

### ローカル確認
```bash
gem install bundler
bundle install
bundle exec jekyll serve
# => http://localhost:4000
```

## 問題追加
`_data/questions.json` の `questions` 配列に以下形式で追加し、
```bash
python scripts/validate_questions.py _data/questions.json
```
で検証すると安全です。

```jsonc
{
  "id": 51,
  "category": "アプリ",
  "question": "…",
  "options": { "A": "…", "B": "…", "C": "…", "D": "…" },
  "answer": ["B"],
  "explanation": "…"
}
```

happy hacking!
