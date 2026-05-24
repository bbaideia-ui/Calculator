
(() => {
  const searchInput = document.getElementById("calculatorSearch");
  const cards = document.querySelectorAll(".calculator-card");
  const categories = document.querySelectorAll(".category");
  const noResults = document.getElementById("noResults");
  const autocompleteList = document.getElementById("autocompleteList");

  if(!searchInput || !autocompleteList) return;

  let activeSuggestionIndex = -1;

  const allPageCalculators = Array.from(cards).map(card => ({
    name: card.querySelector("strong").textContent.trim(),
    description: card.querySelector("span").textContent.trim(),
    href: card.getAttribute("href"),
    element: card
  }));

  function filterCards(query){
    let visibleCount = 0;

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const match = text.includes(query);

      card.style.display = match ? "block" : "none";

      if(match) visibleCount++;
    });

    categories.forEach(category => {
      let hasVisible = false;

      category.querySelectorAll(".calculator-card").forEach(card => {
        if(card.style.display !== "none"){
          hasVisible = true;
        }
      });

      category.style.display = hasVisible ? "block" : "none";
    });

    if(noResults){
      noResults.style.display = visibleCount === 0 ? "block" : "none";
    }
  }

  function showSuggestions(query){
    autocompleteList.innerHTML = "";
    activeSuggestionIndex = -1;

    if(!query){
      autocompleteList.style.display = "none";
      return;
    }

    const matches = allPageCalculators
      .filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      )
      .slice(0, 8);

    if(matches.length === 0){
      autocompleteList.style.display = "none";
      return;
    }

    matches.forEach(match => {
      const item = document.createElement("div");

      item.className = "autocomplete-item";
      item.innerHTML = `
        <strong>${match.name}</strong>
        <span>${match.description}</span>
      `;

      item.addEventListener("click", () => {
        chooseSuggestion(match);
      });

      autocompleteList.appendChild(item);
    });

    autocompleteList.style.display = "block";
  }

  function chooseSuggestion(match){
    searchInput.value = match.name;
    autocompleteList.style.display = "none";

    filterCards(match.name.toLowerCase());

    match.element.scrollIntoView({
      behavior:"smooth",
      block:"center"
    });

    match.element.style.borderColor = "var(--blue)";

    setTimeout(() => {
      match.element.style.borderColor = "";
    }, 900);
  }

  function updateActiveSuggestion(items){
    items.forEach(item => {
      item.classList.remove("active");
    });

    if(activeSuggestionIndex >= 0 && items[activeSuggestionIndex]){
      items[activeSuggestionIndex].classList.add("active");
    }
  }

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();

    filterCards(query);
    showSuggestions(query);
  });

  searchInput.addEventListener("keydown", event => {
    const items = autocompleteList.querySelectorAll(".autocomplete-item");

    if(autocompleteList.style.display !== "block" || items.length === 0){
      return;
    }

    if(event.key === "ArrowDown"){
      event.preventDefault();
      activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
      updateActiveSuggestion(items);
    }

    if(event.key === "ArrowUp"){
      event.preventDefault();
      activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length;
      updateActiveSuggestion(items);
    }

    if(event.key === "Enter"){
      if(activeSuggestionIndex >= 0){
        event.preventDefault();
        items[activeSuggestionIndex].click();
      }
    }

    if(event.key === "Escape"){
      autocompleteList.style.display = "none";
    }
  });

  document.addEventListener("click", event => {
    if(!event.target.closest(".search-box")){
      autocompleteList.style.display = "none";
    }
  });
})();
