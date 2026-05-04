
const themeToggle = document.getElementById("themeToggle");

const savedTheme = localStorage.getItem("financeToolsTheme");

if(savedTheme === "dark"){
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️ Light";
}else{
  document.body.classList.remove("dark");
  themeToggle.textContent = "🌙 Dark";
}

themeToggle.addEventListener("click", () => {
  document.body.classList.add("fade-transition");

  setTimeout(() => {
    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){
      themeToggle.textContent = "☀️ Light";
      localStorage.setItem("financeToolsTheme", "dark");
    }else{
      themeToggle.textContent = "🌙 Dark";
      localStorage.setItem("financeToolsTheme", "light");
    }

    requestAnimationFrame(() => {
      document.body.classList.remove("fade-transition");
    });
  }, 140);
});
