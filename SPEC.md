# 原神ツール 設計仕様書

## 1. 文書情報

- 文書名：原神ツール 設計仕様書
- バージョン：v2（機能拡張対応）
- 対象：フロントエンド（静的Webアプリ / GitHub Pages想定）
- データ保存方式：ブラウザ localStorage
- データ移行：JSONエクスポート / インポート対応

---

# 2. システム概要

## 2.1 目的

原神プレイに関する個人管理を、軽量なWebアプリで行う。

設計思想：

- 入力が速い
- UIが崩れない
- データは端末内保存
- JSONで持ち運び可能
- スマホファースト設計

---

# 3. アーキテクチャ

## 3.1 構成

- SPA（Single Page Application）
- hashルーティング（#/home 形式）
- localStorageによる永続化
- 各ページは `Pages.xxx()` で描画

## 3.2 ファイル責務

| ファイル | 役割 |
|----------|------|
| index.html | ルートHTML / ナビ |
| app.js | ルーティング / 状態管理 |
| storage.js | localStorage制御 |
| utils.js | 共通関数 |
| js/pages/* | 各ページUI |
| js/data/* | マスタデータ |

---

# 4. ルーティング設計

| ルート | 機能 |
|--------|------|
| #/home | ホーム |
| #/weekly-boss | 週ボス素材管理 |
| #/primogem | 原石計算 |
| #/gacha-log | ガチャ回数記録 |
| #/artifact-score | 聖遺物スコア計算 |
| #/artifact-rolls | 聖遺物伸び値表 |

---

# 5. データ設計（state構造）

localStorageキー：

