/**
 * app.js
 * - ルーティング（#/home など）を処理してページを描画
 * - state管理（保存/復元）
 * - 共通のエクスポート/インポート/リセット
 */

(function () {
  const appEl = document.getElementById("app");
  let state = StorageAPI.load();

  /**
   * state更新
   * @param {Object} next
   * @param {Object} options { rerender: boolean }
   */
  function setState(next, options = { rerender: true }) {
    state = next;
    StorageAPI.save(state);
    if (options.rerender) renderRoute();
  }

  /** 現在ルート */
  function getRoute() {
    const hash = location.hash || "#/home";
    const route = hash.replace("#/", "");
    return route || "home";
  }

  /** ナビのアクティブ反映 */
  function setActiveNav(route) {
    const navMap = {
      home: "navHome",
      "weekly-boss": "navWeekly",
      primogem: "navPrimo",
      "gacha-log": "navGacha",
      "artifact-score": "navArtifactScore",
      "artifact-rolls": "navArtifactRolls"
    };

    Object.values(navMap).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove("is-active");
    });

    const activeId = navMap[route];
    const activeEl = document.getElementById(activeId);
    if (activeEl) activeEl.classList.add("is-active");
  }

  /** ルート描画 */
  function renderRoute() {
    const route = getRoute();
    setActiveNav(route);

    // ✅ ここがズレてると「遷移しない」
    if (route === "weekly-boss") {
      appEl.innerHTML = Pages.weeklyBoss({ state });
      Pages.weeklyBossSetup?.({ state, setState });
      return;
    }

    if (route === "primogem") {
      appEl.innerHTML = Pages.primogem({ state });
      Pages.primogemSetup?.({ state, setState });
      return;
    }

    if (route === "gacha-log") {
      appEl.innerHTML = Pages.gachaLog({ state });
      Pages.gachaLogSetup?.({ state, setState });
      return;
    }

    if (route === "artifact-score") {
      // Pages.artifactScore が未定義だとここで落ちる（読み込み順かファイル名が原因）
      appEl.innerHTML = Pages.artifactScore({ state });
      Pages.artifactScoreSetup?.({ state, setState });
      return;
    }

    if (route === "artifact-rolls") {
      appEl.innerHTML = Pages.artifactRolls({ state });
      Pages.artifactRollsSetup?.({ state, setState });
      return;
    }

    // default: home
    appEl.innerHTML = Pages.home({ state });
  }

  /** エクスポート */
  function handleExport() {
    const json = StorageAPI.export(state);

    // クリップボード（失敗してもalertは出す）
    navigator.clipboard?.writeText(json).catch(() => {});
    alert(
      "エクスポートしました（JSONをクリップボードにコピーしました）\n" +
      "必要ならメモ帳などに貼り付けて保存してください。"
    );
  }

  /** インポート */
  function openImportDialog() {
    const dlg = document.getElementById("importDialog");
    const ta = document.getElementById("importTextarea");
    ta.value = "";
    dlg.showModal();
  }

  function applyImport() {
    const ta = document.getElementById("importTextarea");
    const imported = StorageAPI.import(ta.value);
    if (!imported) {
      alert("インポートに失敗しました。JSON形式を確認してください。");
      return;
    }
    setState(imported, { rerender: true });
    alert("インポートしました。");
  }

  /** リセット */
  function handleReset() {
    const ok = confirm("全データをリセットします。よろしいですか？");
    if (!ok) return;

    StorageAPI.reset();
    state = StorageAPI.load();
    renderRoute();
  }

  // 共通イベント
  document.getElementById("btnExport")?.addEventListener("click", handleExport);
  document.getElementById("btnImport")?.addEventListener("click", openImportDialog);
  document.getElementById("btnReset")?.addEventListener("click", handleReset);
  document.getElementById("btnImportApply")?.addEventListener("click", (e) => {
    e.preventDefault();
    applyImport();
    document.getElementById("importDialog")?.close();
  });

  // ルート変化
  window.addEventListener("hashchange", renderRoute);

  // 初期表示
  if (!location.hash) location.hash = "#/home";
  renderRoute();
})();
