
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("financeToolsCookieAccepted")) {
    return;
  }

  const banner = document.createElement("div");
  banner.innerHTML = `
    <div id="cookieBanner" style="
      position:fixed;
      left:16px;
      right:16px;
      bottom:16px;
      max-width:1120px;
      margin:auto;
      background:var(--card);
      color:var(--text);
      border:1px solid var(--soft-border);
      border-radius:16px;
      box-shadow:var(--soft-shadow);
      padding:16px;
      z-index:9999;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:16px;
    ">
      <p style="margin:0;color:var(--muted);font-size:14px;">
        We use cookies and similar technologies to improve your experience.
        Read our <a href="/privacy.html" style="color:var(--blue);font-weight:700;text-decoration:underline;">Privacy Policy</a>.
      </p>
      <button id="cookieAccept" style="
        background:var(--green);
        color:white;
        padding:10px 18px;
        border-radius:10px;
        border:none;
        cursor:pointer;
        font-weight:700;
        white-space:nowrap;
      ">Accept</button>
    </div>
  `;

  document.body.appendChild(banner);

  document.getElementById("cookieAccept").addEventListener("click", () => {
    localStorage.setItem("financeToolsCookieAccepted", "true");
    document.getElementById("cookieBanner").style.display = "none";
  });
});
