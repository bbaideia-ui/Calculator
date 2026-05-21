
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if(menuToggle && mainNav){

  menuToggle.addEventListener("click", event => {
    event.stopPropagation();

    const isOpen = mainNav.classList.contains("open");

    mainNav.classList.toggle("open", !isOpen);
    menuToggle.classList.toggle("open", !isOpen);
  });

  document.addEventListener("click", event => {

    if(
      !menuToggle.contains(event.target) &&
      !mainNav.contains(event.target)
    ){
      mainNav.classList.remove("open");
      menuToggle.classList.remove("open");
    }

  });

}
