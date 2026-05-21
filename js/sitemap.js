
(function(){
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  if(!menuToggle || !mainNav) return;

  menuToggle.addEventListener("click", function(event){
    event.preventDefault();
    event.stopPropagation();

    mainNav.classList.toggle("open");
  });

  document.addEventListener("click", function(event){
    if(
      !menuToggle.contains(event.target) &&
      !mainNav.contains(event.target)
    ){
      mainNav.classList.remove("open");
    }
  });
})();
