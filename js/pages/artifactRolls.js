window.Pages = window.Pages || {};

function arFmt(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "";
  // %系は小数2桁、実数は小数2桁でもOK（表示揃え）
  return (Math.round(x * 100) / 100).toString();
}

window.Pages.artifactRolls = function () {
  const list = window.ArtifactSubstatRolls;
  const options = list.keys.map(k => `<option value="${k.key}">${k.label}</option>`).join("");

  return `
    <section class="card">
      <h2>伸び値表（サブステ）</h2>
      <p class="muted">★4/★5のサブステが取りうる値（初期値/伸び幅の候補）を確認できます。</p>

      <div class="form-grid" style="margin-top:12px;">
        <div>
          <label class="label">レア度</label>
          <select class="select" id="arStar">
            <option value="5">★5</option>
            <option value="4">★4</option>
          </select>
        </div>

        <div>
          <label class="label">サブステ</label>
          <select class="select" id="arKey">
            ${options}
          </select>
        </div>
      </div>

      <div class="card" style="box-shadow:none;margin-top:12px;">
        <h3 style="margin-top:0;">値の候補</h3>
        <div class="table-wrap">
          <table style="min-width: 760px;">
            <thead>
              <tr>
                <th>候補値（= 初期値/1回の伸び）</th>
                <th>1ロール合計</th>
                <th>2ロール合計</th>
                <th>3ロール合計</th>
                <th>4ロール合計</th>
                <th>5ロール合計</th>
                <th>6ロール合計</th>
              </tr>
            </thead>
            <tbody id="arBody"></tbody>
          </table>
        </div>
        <p class="muted" style="margin-top:10px;">
          ※「nロール合計」は、その候補値をn回引いた場合の合計です（最大理論確認用）。<br>
          ※ゲーム内表示の丸めにより見た目が微妙にズレる場合があります。
        </p>
      </div>
    </section>
  `;
};

window.Pages.artifactRollsSetup = function () {
  const starEl = document.getElementById("arStar");
  const keyEl = document.getElementById("arKey");
  const bodyEl = document.getElementById("arBody");

  function render() {
    const star = starEl.value;
    const key = keyEl.value;
    const values = (ArtifactSubstatRolls.values[star] || {})[key] || [];

    const rows = values.map(v => {
      const n1 = v * 1, n2 = v * 2, n3 = v * 3, n4 = v * 4, n5 = v * 5, n6 = v * 6;
      return `
        <tr>
          <td style="font-variant-numeric:tabular-nums;">${arFmt(v)}</td>
          <td style="text-align:right;font-variant-numeric:tabular-nums;">${arFmt(n1)}</td>
          <td style="text-align:right;font-variant-numeric:tabular-nums;">${arFmt(n2)}</td>
          <td style="text-align:right;font-variant-numeric:tabular-nums;">${arFmt(n3)}</td>
          <td style="text-align:right;font-variant-numeric:tabular-nums;">${arFmt(n4)}</td>
          <td style="text-align:right;font-variant-numeric:tabular-nums;">${arFmt(n5)}</td>
          <td style="text-align:right;font-variant-numeric:tabular-nums;">${arFmt(n6)}</td>
        </tr>
      `;
    }).join("");

    bodyEl.innerHTML = rows || `<tr><td colspan="7" class="muted" style="text-align:center;">データがありません</td></tr>`;
  }

  starEl.addEventListener("change", render);
  keyEl.addEventListener("change", render);
  render();
};
