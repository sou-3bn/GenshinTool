/**
 * gachaLog.js
 * ガチャ回数記録ページ
 */

window.Pages = window.Pages || {};

function formatBannerLabel(banner) {
  switch (banner) {
    case "character": return "キャラ";
    case "weapon": return "武器";
    case "standard": return "通常";
    case "chronicled": return "集録";
    default: return banner;
  }
}

function todayISO() {
  // 端末ローカル日付で YYYY-MM-DD
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseISODate(s) {
  // "YYYY-MM-DD" を Date に（ローカル扱い）
  const [y, m, d] = String(s || "").split("-").map(n => parseInt(n, 10));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function sumPulls(entries) {
  return entries.reduce((acc, e) => acc + (Number(e.pulls) || 0), 0);
}

function isSameMonth(dateObj, y, m) {
  return dateObj && dateObj.getFullYear() === y && (dateObj.getMonth() + 1) === m;
}

function withinDays(dateObj, days) {
  if (!dateObj) return false;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 今日の0時
  const diffMs = start.getTime() - new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays < days;
}

window.Pages.gachaLog = function renderGachaLog({ state }) {
  const entries = (state.gachaLog?.entries || []).slice();

  // 新しい順
  entries.sort((a, b) => {
    if (a.date !== b.date) return a.date > b.date ? -1 : 1;
    return (b.id || "").localeCompare(a.id || "");
  });

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;

  const allTotal = sumPulls(entries);
  const monthTotal = sumPulls(entries.filter(e => isSameMonth(parseISODate(e.date), y, m)));
  const last30Total = sumPulls(entries.filter(e => withinDays(parseISODate(e.date), 30)));

  const rows = entries.map(e => `
    <tr>
      <td>${e.date || ""}</td>
      <td>${formatBannerLabel(e.banner)}</td>
      <td style="text-align:right;font-variant-numeric:tabular-nums;">${Number(e.pulls) || 0}</td>
      <td style="text-align:left;">${(e.note || "").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</td>
      <td style="text-align:center;">
        <button class="btn btn--danger" data-action="delete" data-id="${e.id}">削除</button>
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
          <input class="input" type="date" id="gachaDate" value="${todayISO()}">
        </div>

        <div>
          <label class="label">種別</label>
          <select class="select" id="gachaBanner">
            <option value="character">キャラ</option>
            <option value="weapon">武器</option>
            <option value="standard">通常</option>
            <option value="chronicled">集録</option>
          </select>
        </div>

        <div>
          <label class="label">回数</label>
          <input class="input" type="number" min="0" step="1" id="gachaPulls" placeholder="例：10">
        </div>

        <div>
          <label class="label">メモ（任意）</label>
          <input class="input" type="text" id="gachaNote" placeholder="例：〇〇狙い / すり抜け など">
        </div>
      </div>

      <div style="display:flex; gap:10px; margin-top:12px; flex-wrap:wrap;">
        <button class="btn" id="btnGachaAdd">追加</button>
        <button class="btn btn--ghost" id="btnGachaClearAll">全削除</button>
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
          <tbody>
            ${rows || `<tr><td colspan="5" class="muted" style="text-align:center;">まだ記録がありません</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
};

window.Pages.gachaLogSetup = function setupGachaLog({ state, setState }) {
  const btnAdd = document.getElementById("btnGachaAdd");
  const btnClearAll = document.getElementById("btnGachaClearAll");

  function update(nextEntries) {
    setState({
      ...state,
      gachaLog: {
        ...(state.gachaLog || {}),
        entries: nextEntries
      }
    }, { rerender: true });
  }

  btnAdd.addEventListener("click", () => {
    const date = document.getElementById("gachaDate").value;
    const banner = document.getElementById("gachaBanner").value;
    const pullsRaw = document.getElementById("gachaPulls").value;
    const note = document.getElementById("gachaNote").value || "";

    const pulls = Number(pullsRaw);

    if (!date) {
      alert("日付を入力してください。");
      return;
    }
    if (!Number.isFinite(pulls) || pulls <= 0) {
      alert("回数は1以上で入力してください。");
      return;
    }

    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const next = (state.gachaLog?.entries || []).concat([{
      id, date, banner, pulls: Math.floor(pulls), note
    }]);

    update(next);

    // 入力リセット（回数とメモだけ）
    document.getElementById("gachaPulls").value = "";
    document.getElementById("gachaNote").value = "";
  });

  btnClearAll.addEventListener("click", () => {
    const ok = confirm("ガチャ記録を全削除します。よろしいですか？");
    if (!ok) return;
    update([]);
  });

  // 削除（イベント委譲）
  document.getElementById("app").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action='delete']");
    if (!btn) return;

    const id = btn.getAttribute("data-id");
    const ok = confirm("この記録を削除しますか？");
    if (!ok) return;

    const next = (state.gachaLog?.entries || []).filter(x => x.id !== id);
    update(next);
  }, { once: true }); // rerenderでDOM再生成されるので once でOK
};
