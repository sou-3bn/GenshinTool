/**
 * home.js
 * ホーム（メニュー）ページ。
 */

window.Pages = window.Pages || {};
window.Pages.home = function renderHomePage({ state }) {
  return `
    <section class="card">
      <h2>ホーム</h2>
      <p class="muted">
        よく使う機能にすぐ移動できます。スマホでもPCでも崩れないレイアウトで作成しています。
      </p>

      <div class="form-grid" style="margin-top:12px;">
        <div class="card" style="box-shadow:none;">
          <h3 style="margin-top:0;">週ボス素材</h3>
          <p class="muted">素材名から週ボスを逆引きし、所持数も管理できます。</p>
          <a class="btn" href="#/weekly-boss" style="display:inline-block;text-decoration:none;">開く</a>
        </div>

        <div class="card" style="box-shadow:none;">
          <h3 style="margin-top:0;">原石計算</h3>
          <p class="muted">登場日までに必要な原石/日を計算します（運命・確定状態対応）。</p>
          <a class="btn" href="#/primogem" style="display:inline-block;text-decoration:none;">開く</a>
        </div>

        <div class="card" style="box-shadow:none;">
          <h3 style="margin-top:0;">ガチャ記録</h3>
          <p class="muted">ガチャ回数を日付・種別ごとに記録し、合計を確認できます。</p>
          <a class="btn" href="#/gacha-log" style="display:inline-block;text-decoration:none;">開く</a>
        </div>

        <div class="card" style="box-shadow:none;">
          <h3 style="margin-top:0;">聖遺物スコア</h3>
          <p class="muted">会心率/会心ダメ中心に、スコアを計算します（カスタム倍率対応）。</p>
          <a class="btn" href="#/artifact-score" style="display:inline-block;text-decoration:none;">開く</a>
        </div>

        <div class="card" style="box-shadow:none;">
          <h3 style="margin-top:0;">伸び値表</h3>
          <p class="muted">サブステの初期値・伸び幅（★4/★5）を一覧で確認できます。</p>
          <a class="btn" href="#/artifact-rolls" style="display:inline-block;text-decoration:none;">開く</a>
        </div>
      </div>
    </section>
  `;
};
