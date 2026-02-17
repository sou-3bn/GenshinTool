window.Pages = window.Pages || {};

function gachaTodayISO() {
  return Utils.todayISO();
}

function gachaBannerLabel(b) {
  switch (b) {
    case "character": return "キャラ";
    case "weapon": return "武器";
    case "standard": return "通常";
    case "chronicled": return "集録";
    default: return b;
  }
}

function gachaParseDate(iso) {
  const [y, m, d] = String(iso || "").split("-").map(n => parseInt(n, 10));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function gachaSum(entries) {
  return entries.reduce((a, e) => a + (Number(e.pulls) || 0), 0);
}

function gachaIsSameMonth(dateObj, y, m) {
  return dateObj && dateObj.getFullYear() === y && (dateObj.getMonth() + 1) === m;
}

function gachaWithinDays(dateObj, days) {
  if (!dateObj) return false;
  const now = new Date();
  const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d0 = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const diffDays = (today0.getTime() - d0.getTime()) / 86400000;
  return diffDays >= 0 && diffDays < days;
}

window.Pages.gachaLog = function ({ state }) {
  const entries = (state.gachaLog?.entries || []).slice().sort((a, b) => {
    if (a.date !== b.date) return a.date > b.date ? -1 : 1;
    return (b.id || "").localeCompare(a.id || "");
  });

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;

  const allTotal = gachaSum(entries);
  const monthTotal = gachaSum(entries.filter(e => gachaIsSameMonth(gachaParseDate(e.date), y, m)));
  const last30Total = gachaSum(entries.filter(e => gachaWithinDays(gachaParseDate(e.date), 30)));

  const rows = entries.map(e => `
    <tr>
      <td>${e.date || ""}</td>
      <td>${gachaBannerLabel(e.banner)}</td>
      <td style="text-align:right;font-variant-numeric:tabular-nums;">${Number(e.pulls) || 0}</td>
      <td>${(e.note || "").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</td>
      <td style="text-align:center;">
        <button class="btn btn--danger" data-id="${e.id}">削除</button>
      </td>
    </tr>
  `).join("");

  return `
    <section class="card">
      <h2>ガチャ記録</h2>
      <p class="muted">日付と種別ごとにガチャ回数を記録し、合計を確認できます。</p>

      <div class="form-grid" style="margin-top:12px;">
        <div>
          <label class="label">日付</label>
          <input class="input" type="date" id="gDate" value="${gachaTodayISO()}">
        </div>

        <div>
          <label class="label">種別</label>
          <select class="select" id="gBanner">
            <option value="character">キャラ</option>
            <option value="weapon">武器</option>
            <option value="standard">通常</option>
            <option value="chronicled">集録</option>
          </select>
        </div>

        <div>
          <label class="label">回数</label>
          <input class="input" type="number" min="1" step="1" id="gPulls" placeholder="例：10">
        </div>

        <div>
          <label class="label">メモ（任意）</label>
          <input class="input" type="text" id="gNote" placeholder="例：すり抜け / 〇〇狙い">
        </div>
      </div>

      <div style="display:flex; gap:10px; margin-top:12px; flex-wrap:wrap;">
        <button class="btn" id="btnGAdd">追加</button>
        <button class="btn btn--ghost" id="btnGClear">全削除</button>
      </div>
    </section>

    <section class="card">
      <h3 style="margin-top:0;">集計</h3>
      <div class="form-grid">
        <div class="card" style="box-shadow:none;">
          <div class="muted">全期間</div>
          <div style="font-size:22px;font-weight:800;">${allTotal} 連</div>
        </div>
        <div class="card" style="box-shadow:none;">
          <div class="muted">今月</div>
          <div style="font-size:22px;font-weight:800;">${monthTotal} 連</div>
        </div>
        <div class="card" style="box-shadow:none;">
          <div class="muted">直近30日</div>
          <div style="font-size:22px;font-weight:800;">${last30Total} 連</div>
        </div>
      </div>
    </section>

    <section class="card">
      <h3 style="margin-top:0;">履歴</h3>
      <div class="table-wrap">
        <table style="min-width: 860px;">
          <thead>
            <tr>
              <th>日付</th>
              <th>種別</th>
              <th>回数</th>
              <th>メモ</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody id="gTbody">
            ${rows || `<tr><td colspan="5" class="muted" style="text-align:center;">まだ記録がありません</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
};

window.Pages.gachaLogSetup = function ({ state, setState }) {
  const btnAdd = document.getElementById("btnGAdd");
  const btnClear = document.getElementById("btnGClear");
  const tbody = document.getElementById("gTbody");

  function updateEntries(nextEntries) {
    setState({
      ...state,
      gachaLog: { ...(state.gachaLog || {}), entries: nextEntries }
    }, { rerender: true });
  }

  btnAdd.addEventListener("click", () => {
    const date = document.getElementById("gDate").value;
    const banner = document.getElementById("gBanner").value;
    const pulls = Utils.toInt(document.getElementById("gPulls").value);
    const note = document.getElementById("gNote").value || "";

    if (!date) return alert("日付を入力してください。");
    if (pulls <= 0) return alert("回数は1以上で入力してください。");

    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const next = (state.gachaLog?.entries || []).concat([{ id, date, banner, pulls, note }]);
    updateEntries(next);

    document.getElementById("gPulls").value = "";
    document.getElementById("gNote").value = "";
  });

  btnClear.addEventListener("click", () => {
    if (!confirm("ガチャ記録を全削除します。よろしいですか？")) return;
    updateEntries([]);
  });

  // 削除（イベント委譲）
  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-id]");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    if (!confirm("この記録を削除しますか？")) return;

    const next = (state.gachaLog?.entries || []).filter(x => x.id !== id);
    updateEntries(next);
  });
};
