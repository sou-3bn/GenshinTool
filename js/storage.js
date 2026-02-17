/**
 * storage.js
 * データの保存/読込/エクスポート/インポートを1箇所にまとめる。
 * 将来、クラウド（Supabase/Firebase）に移すときもここを差し替えるだけで済む。
 */

const STORAGE_KEY = "genshin_tool_state_v1";

window.StorageAPI = {
  /** 初期状態を作る（保存が無いときに使う） */
  createInitialState() {
    return {
      weeklyBoss: {
        ownedByBoss: {}
      },
      primogem: {
        characterDate: "",
        currentPrimo: 0,
        currentPulls: 0,
        currentFates: 0,
        assumeLose5050: false,
        guaranteed: false
      },

      // ✅ 追加：ガチャ記録
      gachaLog: {
        entries: []
      }

      // ✅ 追加：聖遺物スコア
      artifactScore: {
        mode: "presetA", // presetA | presetB | custom
        weights: { cr: 2, cd: 1, atk: 0, hp: 0, def: 0, em: 0, er: 0 },
        lastInput: { cr: 0, cd: 0, atk: 0, hp: 0, def: 0, em: 0, er: 0 }
      }
    };
  },

  /** stateをロード */
  load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return this.createInitialState();

    const parsed = Utils.safeJsonParse(raw);
    if (!parsed) return this.createInitialState();

    // 破損・古い形式の保険（最低限）
    return {
      ...this.createInitialState(),
      ...parsed
    };
  },

  /** stateを保存 */
  save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },

  /** JSON文字列としてエクスポート */
  export(state) {
    return JSON.stringify(state, null, 2);
  },

  /** JSON文字列からインポート（成功時はstateを返す、失敗ならnull） */
  import(jsonText) {
    const parsed = Utils.safeJsonParse(jsonText);
    if (!parsed) return null;

    // 最低限の形チェック（厳密にしすぎない）
    if (!parsed.weeklyBoss || !parsed.primogem) return null;

    return {
      ...this.createInitialState(),
      ...parsed
    };
  },

  /** 全リセット */
  reset() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
