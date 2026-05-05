const themeToggle = document.getElementById("themeToggle");

// Carregar tema salvo
const savedTheme = localStorage.getItem("financeToolsTheme");

if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
  document.body.classList.add("dark");
  if (themeToggle) themeToggle.textContent = "☀️ Light";
} else {
  document.documentElement.classList.remove("dark");
  document.body.classList.remove("dark");
  if (themeToggle) themeToggle.textContent = "🌙 Dark";
}

// Clique no botão
if (themeToggle) {
  themeToggle.addEventListener("click", () => {

    document.body.classList.add("fade-transition");

    setTimeout(() => {

      const isDark = document.documentElement.classList.contains("dark");

      if (isDark) {
        // Vai para LIGHT
        document.documentElement.classList.remove("dark");
        document.body.classList.remove("dark");
        localStorage.setItem("financeToolsTheme", "light");
        themeToggle.textContent = "🌙 Dark";
      } else {
        // Vai para DARK
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark");
        localStorage.setItem("financeToolsTheme", "dark");
        themeToggle.textContent = "☀️ Light";
      }

      requestAnimationFrame(() => {
        document.body.classList.remove("fade-transition");
      });

    }, 140);
  });
}


