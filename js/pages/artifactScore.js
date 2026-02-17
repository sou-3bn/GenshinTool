window.Pages = window.Pages || {};

function calcArtifactScore(mode, weights, v) {
  if (mode === "presetA") return v.cd + v.cr * 2;
  if (mode === "presetB") return v.cd + v.cr;

  // custom
  return (
    v.cr * (weights.cr || 0) +
    v.cd * (weights.cd || 0) +
    v.atk * (weights.atk || 0) +
    v.hp * (weights.hp || 0) +
    v.def * (weights.def || 0) +
    v.em * (weights.em || 0) +
    v.er * (weights.er || 0)
  );
}

function fmt(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0";
  return (Math.round(x * 100) / 100).toString();
}

window.Pages.artifactScore = function ({ state }) {
  const s = state.artifactScore || {};
  const mode = s.mode || "presetA";
  const w = s.weights || { cr: 2, cd: 1, atk: 0, hp: 0, def: 0, em: 0, er: 0 };
  const v = s.lastInput || { cr: 0, cd: 0, atk: 0, hp: 0, def: 0, em: 0, er: 0 };

  const score = calcArtifactScore(mode, w, v);

  const customAreaStyle = mode === "custom" ? "" : "display:none;";

  return `
    <section class="card">
      <h2>聖遺物スコア</h2>
      <p class="muted">会心系中心のスコア計算。カスタム倍率にも対応します。</p>

      <div class="form-grid" style="margin-top:12px;">
        <div>
          <label class="label">モード</label>
          <select class="select" id="asMode">
            <option value="presetA" ${mode==="presetA"?"selected":""}>Preset A（CD + CR×2）</option>
            <option value="presetB" ${mode==="presetB"?"selected":""}>Preset B（CD + CR）</option>
            <option value="custom" ${mode==="custom"?"selected":""}>Custom（重み）</option>
          </select>
        </div>
      </div>

      <div class="form-grid" style="margin-top:12px;">
        <div><label class="label">会心率(%)</label><input class="input" id="asCR" type="number" step="0.1" min="0" value="${fmt(v.cr)}"></div>
        <div><label class="label">会心ダメ(%)</label><input class="input" id="asCD" type="number" step="0.1" min="0" value="${fmt(v.cd)}"></div>
        <div><label class="label">攻撃力%(任意)</label><input class="input" id="asATK" type="number" step="0.1" min="0" value="${fmt(v.atk)}"></div>
        <div><label class="label">HP%(任意)</label><input class="input" id="asHP" type="number" step="0.1" min="0" value="${fmt(v.hp)}"></div>
        <div><label class="label">防御%(任意)</label><input class="input" id="asDEF" type="number" step="0.1" min="0" value="${fmt(v.def)}"></div>
        <div><label class="label">元素熟知(任意)</label><input class="input" id="asEM" type="number" step="1" min="0" value="${fmt(v.em)}"></div>
        <div><label class="label">元素チャージ%(任意)</label><input class="input" id="asER" type="number" step="0.1" min="0" value="${fmt(v.er)}"></div>
      </div>

      <div class="card" style="box-shadow:none;margin-top:12px;">
        <div class="muted">スコア</div>
        <div style="font-size:26px;font-weight:900;" id="asScore">${fmt(score)}</div>
      </div>

      <div class="card" style="box-shadow:none;margin-top:12px; ${customAreaStyle}" id="asCustomBox">
        <h3 style="margin-top:0;">Custom 重み</h3>
        <p class="muted">スコア = Σ(値 × 重み)</p>

        <div class="form-grid">
          <div><label class="label">CR 重み</label><input class="input" id="wCR" type="number" step="0.1" value="${fmt(w.cr)}"></div>
          <div><label class="label">CD 重み</label><input class="input" id="wCD" type="number" step="0.1" value="${fmt(w.cd)}"></div>
          <div><label class="label">ATK% 重み</label><input class="input" id="wATK" type="number" step="0.1" value="${fmt(w.atk)}"></div>
          <div><label class="label">HP% 重み</label><input class="input" id="wHP" type="number" step="0.1" value="${fmt(w.hp)}"></div>
          <div><label class="label">DEF% 重み</label><input class="input" id="wDEF" type="number" step="0.1" value="${fmt(w.def)}"></div>
          <div><label class="label">EM 重み</label><input class="input" id="wEM" type="number" step="0.1" value="${fmt(w.em)}"></div>
          <div><label class="label">ER% 重み</label><input class="input" id="wER" type="number" step="0.1" value="${fmt(w.er)}"></div>
        </div>
      </div>

      <div style="display:flex; gap:10px; margin-top:12px; flex-wrap:wrap;">
        <button class="btn" id="btnAsSave">保存</button>
        <button class="btn btn--ghost" id="btnAsReset">入力リセット</button>
      </div>
    </section>
  `;
};

window.Pages.artifactScoreSetup = function ({ state, setState }) {
  const s = state.artifactScore || {};
  const modeEl = document.getElementById("asMode");
  const scoreEl = document.getElementById("asScore");
  const customBox = document.getElementById("asCustomBox");

  function readValues() {
    return {
      cr: Utils.toNumber(document.getElementById("asCR").value),
      cd: Utils.toNumber(document.getElementById("asCD").value),
      atk: Utils.toNumber(document.getElementById("asATK").value),
      hp: Utils.toNumber(document.getElementById("asHP").value),
      def: Utils.toNumber(document.getElementById("asDEF").value),
      em: Utils.toNumber(document.getElementById("asEM").value),
      er: Utils.toNumber(document.getElementById("asER").value)
    };
  }

  function readWeights() {
    return {
      cr: Utils.toNumber(document.getElementById("wCR")?.value),
      cd: Utils.toNumber(document.getElementById("wCD")?.value),
      atk: Utils.toNumber(document.getElementById("wATK")?.value),
      hp: Utils.toNumber(document.getElementById("wHP")?.value),
      def: Utils.toNumber(document.getElementById("wDEF")?.value),
      em: Utils.toNumber(document.getElementById("wEM")?.value),
      er: Utils.toNumber(document.getElementById("wER")?.value)
    };
  }

  function recompute() {
    const mode = modeEl.value;
    const v = readValues();
    const w = mode === "custom" ? readWeights() : (s.weights || { cr: 2, cd: 1, atk: 0, hp: 0, def: 0, em: 0, er: 0 });

    const score = calcArtifactScore(mode, w, v);
    scoreEl.textContent = fmt(score);
  }

  modeEl.addEventListener("change", () => {
    const mode = modeEl.value;
    customBox.style.display = (mode === "custom") ? "" : "none";
    recompute();
  });

  // 入力変更で即再計算（保存はボタン）
  document.querySelectorAll("#asCR,#asCD,#asATK,#asHP,#asDEF,#asEM,#asER,#wCR,#wCD,#wATK,#wHP,#wDEF,#wEM,#wER")
    .forEach(el => el && el.addEventListener("input", recompute));

  document.getElementById("btnAsSave").addEventListener("click", () => {
    const mode = modeEl.value;
    const lastInput = readValues();
    const weights = (mode === "custom") ? readWeights() : (s.weights || { cr: 2, cd: 1, atk: 0, hp: 0, def: 0, em: 0, er: 0 });

    setState({
      ...state,
      artifactScore: {
        ...(state.artifactScore || {}),
        mode,
        weights,
        lastInput
      }
    }, { rerender: true });
  });

  document.getElementById("btnAsReset").addEventListener("click", () => {
    document.getElementById("asCR").value = "0";
    document.getElementById("asCD").value = "0";
    document.getElementById("asATK").value = "0";
    document.getElementById("asHP").value = "0";
    document.getElementById("asDEF").value = "0";
    document.getElementById("asEM").value = "0";
    document.getElementById("asER").value = "0";
    recompute();
  });

  recompute();
};
