
const themeToggle = document.getElementById("themeToggle");

// Carrega tema salvo
const savedTheme = localStorage.getItem("financeToolsTheme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
  if (themeToggle) themeToggle.textContent = "☀️ Light";
} else {
  document.body.classList.remove("dark");
  if (themeToggle) themeToggle.textContent = "🌙 Dark";
}

// Clique no botão
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.add("fade-transition");

    setTimeout(() => {
      document.body.classList.toggle("dark");

      if (document.body.classList.contains("dark")) {
        localStorage.setItem("financeToolsTheme", "dark");
        themeToggle.textContent = "☀️ Light";
      } else {
        localStorage.setItem("financeToolsTheme", "light");
        themeToggle.textContent = "🌙 Dark";
      }

      requestAnimationFrame(() => {
        document.body.classList.remove("fade-transition");
      });
    }, 140);
  });
}
