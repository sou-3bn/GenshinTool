/**
 * storage.js
 * localStorage 永続化と import/export
 */

const STORAGE_KEY = "genshin_tool_state_v1";

window.StorageAPI = {
  /** 初期状態 */
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

      // ✅ ガチャ記録
      gachaLog: {
        entries: []
      },

      // ✅ 聖遺物スコア
      artifactScore: {
        mode: "presetA", // presetA | presetB | custom
        weights: { cr: 2, cd: 1, atk: 0, hp: 0, def: 0, em: 0, er: 0 },
        lastInput: { cr: 0, cd: 0, atk: 0, hp: 0, def: 0, em: 0, er: 0 }
      }
    };
  },

  /** ロード（古いデータでも壊れないようにマージ） */
  load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return this.createInitialState();

    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      parsed = null;
    }
    if (!parsed || typeof parsed !== "object") return this.createInitialState();

    return {
      ...this.createInitialState(),
      ...parsed
    };
  },

  /** 保存 */
  save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },

  /** エクスポート */
  export(state) {
    return JSON.stringify(state, null, 2);
  },

  /** インポート（最低限チェックしてマージ） */
  import(jsonText) {
    let parsed = null;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      parsed = null;
    }
    if (!parsed || typeof parsed !== "object") return null;

    // 最低限の形（壊れたJSONや別データ混入のガード）
    if (!parsed.weeklyBoss || !parsed.primogem) return null;

    return {
      ...this.createInitialState(),
      ...parsed
    };
  },

  /** リセット */
  reset() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
