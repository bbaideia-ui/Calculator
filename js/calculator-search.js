
const calculators = [
  {
    name: "Compound Interest Calculator",
    description: "Estimate investment growth with compound interest.",
    url: "/Calculator/index.html"
  },
  {
    name: "Simple Interest Calculator",
    description: "Calculate simple interest over time.",
    url: "/Calculator/calculators/simple-interest-calculator.html"
  },
  {
    name: "Savings Calculator",
    description: "Estimate how your savings may grow.",
    url: "/Calculator/calculators/savings-calculator.html"
  },
  {
    name: "Investment Calculator",
    description: "Estimate future value, contributions, and investment growth.",
    url: "/Calculator/calculators/investment-calculator.html"
  },
  {
    name: "Finance Calculator",
    description: "Estimate present value, future value, payments, rate, and time.",
    url: "/Calculator/calculators/finance-calculator.html"
  },
  {
    name: "Interest Calculator",
    description: "Estimate interest growth, contributions, taxes, inflation, and ending balance.",
    url: "/Calculator/calculators/interest-calculator.html"
  },
  {
    name: "Interest Rate Calculator",
    description: "Estimate the annual interest rate based on loan amount, term, and monthly payment.",
    url: "/Calculator/calculators/interest-rate-calculator.html"
  },
  {
    name: "Loan Calculator",
    description: "Estimate loan payments, interest, and payoff schedule.",
    url: "/Calculator/calculators/loan-calculator.html"
  },
  {
    name: "Payment Calculator",
    description: "Estimate monthly payments, total interest, and total payments for fixed-rate loans.",
    url: "/Calculator/calculators/payment-calculator.html"
  },
  {
    name: "Amortization Calculator",
    description: "Estimate monthly payments, total interest, and yearly loan amortization schedule.",
    url: "/Calculator/calculators/amortization-calculator.html"
  },
  {
    name: "Business Loan Calculator",
    description: "Estimate business loan payments, interest, fees, APR, and repayment schedule.",
    url: "/Calculator/calculators/business-loan-calculator.html"
  },
  {
    name: "Deferred Payment Loan Calculator",
    description: "Estimate amount due at loan maturity.",
    url: "/Calculator/calculators/deferred-payment-loan-calculator.html"
  },
  {
    name: "Bond Calculator",
    description: "Estimate present value of a future lump sum.",
    url: "/Calculator/calculators/bond-calculator.html"
  },
  {
    name: "Mortgage Calculator",
    description: "Estimate mortgage payments and loan breakdown.",
    url: "/Calculator/calculators/mortgage-calculator.html"
  },
  {
    name: "Credit Card Payoff Calculator",
    description: "Estimate payoff time and interest for credit cards.",
    url: "/Calculator/calculators/credit-card-payoff-calculator.html"
  },
  {
    name: "Debt Payoff Calculator",
    description: "Estimate payoff time, balances, and debt repayment progress.",
    url: "/Calculator/calculators/debt-payoff-calculator.html"
  },
  {
    name: "Retirement Calculator",
    description: "Estimate retirement savings needs and projected gap.",
    url: "/Calculator/calculators/retirement-calculator.html"
  },
  {
    name: "Retirement Savings Calculator",
    description: "Estimate how much to save monthly for retirement.",
    url: "/Calculator/calculators/retirement-savings-calculator.html"
  },
  {
    name: "Retirement Withdrawal Calculator",
    description: "Estimate monthly withdrawals from retirement savings.",
    url: "/Calculator/calculators/retirement-withdrawal-calculator.html"
  },
  {
    name: "Retirement Duration Calculator",
    description: "Estimate how long your retirement savings may last.",
    url: "/Calculator/calculators/retirement-duration-calculator.html"
  }
];

function setupCalculatorSearch(inputId, listId){
  const searchInput = document.getElementById(inputId);
  const autocompleteList = document.getElementById(listId);

  if(!searchInput || !autocompleteList) return;

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();

    autocompleteList.innerHTML = "";

    if(!query){
      autocompleteList.style.display = "none";
      return;
    }

    const matches = calculators
      .filter(calc =>
        calc.name.toLowerCase().includes(query) ||
        calc.description.toLowerCase().includes(query)
      )
      .slice(0, 8);

    if(matches.length === 0){
      autocompleteList.style.display = "none";
      return;
    }

    matches.forEach(calc => {
      const item = document.createElement("a");

      item.href = calc.url;
      item.className = "autocomplete-item";
      item.innerHTML = `<strong>${calc.name}</strong><span>${calc.description}</span>`;

      autocompleteList.appendChild(item);
    });

    autocompleteList.style.display = "block";
  });

  document.addEventListener("click", event => {
    if(
      !searchInput.contains(event.target) &&
      !autocompleteList.contains(event.target)
    ){
      autocompleteList.style.display = "none";
    }
  });
}

setupCalculatorSearch(
  "sidebarCalculatorSearch",
  "sidebarAutocompleteList"
);

setupCalculatorSearch(
  "mobileCalculatorSearch",
  "mobileAutocompleteList"
);

setupCalculatorSearch(
  "mobileHeaderCalculatorSearch",
  "mobileHeaderAutocompleteList"
);

const mobileSearchToggle = document.getElementById("mobileSearchToggle");
const mobileSearchBox = document.getElementById("mobileSearchBox");

if(mobileSearchToggle && mobileSearchBox){
  mobileSearchToggle.addEventListener("click", event => {
    event.stopPropagation();

    const isOpen = mobileSearchBox.classList.contains("open");

    mobileSearchBox.classList.toggle("open", !isOpen);
    mobileSearchToggle.classList.toggle("open", !isOpen);
  });

  document.addEventListener("click", event => {
    if(
      !mobileSearchToggle.contains(event.target) &&
      !mobileSearchBox.contains(event.target)
    ){
      mobileSearchBox.classList.remove("open");
      mobileSearchToggle.classList.remove("open");
    }
  });
}




document.addEventListener("click", event => {
  const menuBtn = document.getElementById("menuToggle");
  const navMenu = document.getElementById("mainNav");
  const searchBtn = document.getElementById("mobileSearchToggle");
  const themeBtn = document.getElementById("themeToggle");

  if(!navMenu || !menuBtn) return;

  if(searchBtn && searchBtn.contains(event.target)){
    navMenu.classList.remove("open");
    return;
  }

  if(themeBtn && themeBtn.contains(event.target)){
    navMenu.classList.remove("open");
    return;
  }

  if(
    !menuBtn.contains(event.target) &&
    !navMenu.contains(event.target)
  ){
    navMenu.classList.remove("open");
  }
});
