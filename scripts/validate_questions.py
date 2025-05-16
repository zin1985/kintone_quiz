#!/usr/bin/env python3
"""問題 JSON バンクを検証・結合するスクリプト

使い方:
    python scripts/validate_questions.py _data/questions.json [other.json ...]

- 必須キーの存在確認
- ID 重複チェック
- 複数ファイルを結合して _data/questions.json に保存
"""

import json
import sys
import pathlib
import itertools
import datetime

REQUIRED = {"id", "category", "question", "options", "answer", "explanation"}

def load_questions(path: pathlib.Path):
    """JSON ファイルから questions 配列を取得"""
    with path.open(encoding="utf-8") as f:
        return json.load(f)["questions"]

def validate(bank):
    """バンク全体を検証"""
    ids = set()
    for q in bank:
        missing = REQUIRED - q.keys()
        if missing:
            raise ValueError(f"ID {q.get('id')} 欠損キー: {missing}")
        if q["id"] in ids:
            raise ValueError(f"重複 ID: {q['id']}")
        ids.add(q["id"])
    print(f"✔ 検証 OK — {len(bank)} 問")

def main(paths):
    bank = list(itertools.chain.from_iterable(load_questions(p) for p in paths))
    validate(bank)
    out = pathlib.Path("_data/questions.json")
    out.write_text(
        json.dumps({"generated": str(datetime.date.today()), "questions": bank}, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"✅ 保存完了: {out} ({len(bank)} 問)")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: validate_questions.py bank1.json [bank2.json ...]")
        sys.exit(1)
    main([pathlib.Path(p) for p in sys.argv[1:]])
