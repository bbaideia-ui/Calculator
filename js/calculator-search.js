

const calculators = [
  {
    name: "Compound Interest Calculator",
    description: "Estimate investment growth with compound interest.",
    url: "../index.html"
  },
  {
    name: "Simple Interest Calculator",
    description: "Calculate simple interest over time.",
    url: "../calculators/simple-interest-calculator.html"
  },
  {
    name: "Savings Calculator",
    description: "Estimate how your savings may grow.",
    url: "../calculators/savings-calculator.html"
  },
  {
    name: "Investment Calculator",
    description: "Estimate future value, contributions, and investment growth.",
    url: "../calculators/investment-calculator.html"
  },
  {
    name: "Finance Calculator",
    description: "Estimate present value, future value, payments, rate, and time.",
    url: "../calculators/finance-calculator.html"
  },
  {
    name: "Interest Calculator",
    description: "Estimate interest growth, contributions, taxes, inflation, and ending balance.",
    url: "../calculators/interest-calculator.html"
  },
  {
    name: "Interest Rate Calculator",
    description: "Estimate the annual interest rate based on loan amount, term, and monthly payment.",
    url: "../calculators/interest-rate-calculator.html"
  },
  {
    name: "Loan Calculator",
    description: "Estimate loan payments, interest, and payoff schedule.",
    url: "../calculators/loan-calculator.html"
  },
  {
    name: "Payment Calculator",
    description: "Estimate monthly payments, total interest, and total payments for fixed-rate loans.",
    url: "../calculators/payment-calculator.html"
  },
  {
    name: "Amortization Calculator",
    description: "Estimate monthly payments, total interest, and yearly loan amortization schedule.",
    url: "../calculators/amortization-calculator.html"
  },
  {
    name: "Business Loan Calculator",
    description: "Estimate business loan payments, interest, fees, APR, and repayment schedule.",
    url: "../calculators/business-loan-calculator.html"
  },
  {
    name: "Deferred Payment Loan Calculator",
    description: "Estimate amount due at loan maturity.",
    url: "../calculators/deferred-payment-loan-calculator.html"
  },
  {
    name: "Bond Calculator",
    description: "Estimate present value of a future lump sum.",
    url: "../calculators/bond-calculator.html"
  },
  {
    name: "Mortgage Calculator",
    description: "Estimate mortgage payments and loan breakdown.",
    url: "../calculators/mortgage-calculator.html"
  },
  {
    name: "Credit Card Payoff Calculator",
    description: "Estimate payoff time and interest for credit cards.",
    url: "../calculators/credit-card-payoff-calculator.html"
  },
  {
    name: "Debt Payoff Calculator",
    description: "Estimate payoff time, balances, and debt repayment progress.",
    url: "../calculators/debt-payoff-calculator.html"
  },
  {
    name: "Retirement Calculator",
    description: "Estimate retirement savings needs and projected gap.",
    url: "../calculators/retirement-calculator.html"
  },
  {
    name: "Retirement Savings Calculator",
    description: "Estimate how much to save monthly for retirement.",
    url: "../calculators/retirement-savings-calculator.html"
  },
  {
    name: "Retirement Withdrawal Calculator",
    description: "Estimate monthly withdrawals from retirement savings.",
    url: "../calculators/retirement-withdrawal-calculator.html"
  },
  {
    name: "Retirement Duration Calculator",
    description: "Estimate how long your retirement savings may last.",
    url: "../calculators/retirement-duration-calculator.html"
  }
];
const searchInput = document.getElementById("sidebarCalculatorSearch");
const autocompleteList = document.getElementById("sidebarAutocompleteList");
if(searchInput && autocompleteList){
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
    if(!event.target.closest(".sidebar-card")){
      autocompleteList.style.display = "none";
    }
  });
}


