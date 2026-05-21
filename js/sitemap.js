
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  if(menuToggle && mainNav){
    menuToggle.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();

      mainNav.classList.toggle("open");
    });
  }
});
