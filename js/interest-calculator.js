
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle.addEventListener("click", () => {
  mainNav.classList.toggle("open");
});

function setRate(value){
  document.getElementById("interestRate").value = value;
}

function setAnnualContribution(value){
  document.getElementById("annualContribution").value = value;
}

function setMonthlyContribution(value){
  document.getElementById("monthlyContribution").value = value;
}

function clearForm(){

  document.getElementById("initialInvestment").value = 20000;
  document.getElementById("annualContribution").value = 5000;
  document.getElementById("monthlyContribution").value = 0;
  document.getElementById("interestRate").value = 5;
  document.getElementById("years").value = 5;
  document.getElementById("months").value = 0;
  document.getElementById("taxRate").value = 0;
  document.getElementById("inflationRate").value = 3;

  document.getElementById("resultBox").style.display = "none";

  document.getElementById("tableBody").innerHTML = "";

  clearCanvas("growthChart");
  clearCanvas("breakdownChart");
}

function clearCanvas(id){
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0,0,canvas.width,canvas.height);
}

function calculate(){

  const initialInvestment =
    Number(document.getElementById("initialInvestment").value);

  const annualContribution =
    Number(document.getElementById("annualContribution").value);

  const monthlyContribution =
    Number(document.getElementById("monthlyContribution").value);

  const interestRate =
    Number(document.getElementById("interestRate").value) / 100;

  const compoundFrequency =
    Number(document.getElementById("compoundFrequency").value);

  const years =
    Number(document.getElementById("years").value);

  const months =
    Number(document.getElementById("months").value);

  const taxRate =
    Number(document.getElementById("taxRate").value) / 100;

  const inflationRate =
    Number(document.getElementById("inflationRate").value) / 100;

  const contributionTiming =
    document.getElementById("contributeTiming").value;

  const totalYears = years + (months / 12);

  const totalPeriods =
    Math.round(totalYears * compoundFrequency);

  const periodicRate =
    interestRate / compoundFrequency;

  let balance = initialInvestment;

  let totalContributions = 0;
  let totalInterest = 0;

  const yearlyBalances = [];
  const yearlyDeposits = [];
  const yearlyInterest = [];

  const tableBody =
    document.getElementById("tableBody");

  tableBody.innerHTML = "";

  for(let year = 1; year <= years; year++){

    let yearInterest = 0;
    let yearDeposit = annualContribution + (monthlyContribution * 12);

    for(let p = 0; p < compoundFrequency; p++){

      const monthlyEquivalent =
        (monthlyContribution * 12) / compoundFrequency;

      const periodicContribution =
        (annualContribution / compoundFrequency) +
        monthlyEquivalent;

      if(contributionTiming === "beginning"){
        balance += periodicContribution;
      }

      const interestEarned =
        balance * periodicRate;

      balance += interestEarned;

      yearInterest += interestEarned;
      totalInterest += interestEarned;

      if(contributionTiming === "end"){
        balance += periodicContribution;
      }

      totalContributions += periodicContribution;
    }

    yearlyBalances.push(balance);
    yearlyDeposits.push(yearDeposit);
    yearlyInterest.push(yearInterest);

    const row = `
      <tr>
        <td>${year}</td>
        <td>${money.format(yearDeposit)}</td>
        <td>${money.format(yearInterest)}</td>
        <td>${money.format(balance)}</td>
      </tr>
    `;

    tableBody.innerHTML += row;
  }

  const taxesPaid =
    totalInterest * taxRate;

  const endingBalance =
    balance - taxesPaid;

  const totalPrincipal =
    initialInvestment;

  const inflationAdjusted =
    endingBalance /
    Math.pow(1 + inflationRate, totalYears);

  const contributionInterest =
    totalInterest * 0.42;

  const initialInterest =
    totalInterest - contributionInterest;

  document.getElementById("endingBalance").textContent =
    money.format(endingBalance);

  document.getElementById("totalPrincipal").textContent =
    money.format(totalPrincipal);

  document.getElementById("totalContributions").textContent =
    money.format(totalContributions);

  document.getElementById("totalInterest").textContent =
    money.format(totalInterest);

  document.getElementById("initialInterest").textContent =
    money.format(initialInterest);

  document.getElementById("contributionInterest").textContent =
    money.format(contributionInterest);

  document.getElementById("inflationAdjusted").textContent =
    money.format(inflationAdjusted);

  document.getElementById("resultBox").style.display = "block";

  drawGrowthChart(
    yearlyBalances,
    yearlyDeposits,
    yearlyInterest
  );

  drawBreakdownChart(
    totalPrincipal,
    totalContributions,
    totalInterest
  );
}

function drawGrowthChart(
  balances,
  deposits,
  interests
){

  const canvas =
    document.getElementById("growthChart");

  const ctx =
    canvas.getContext("2d");

  ctx.clearRect(0,0,canvas.width,canvas.height);

  const padding = 40;

  const width =
    canvas.width - (padding * 2);

  const height =
    canvas.height - (padding * 2);

  const maxValue =
    Math.max(...balances) * 1.1;

  const isDark =
    document.documentElement.classList.contains("dark");

  ctx.strokeStyle =
    isDark ? "#8b949e" : "#57606a";

  ctx.beginPath();
  ctx.moveTo(padding,padding);
  ctx.lineTo(padding,canvas.height-padding);
  ctx.lineTo(canvas.width-padding,canvas.height-padding);
  ctx.stroke();

  function drawLine(data,color){

    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;

    data.forEach((value,index)=>{

      const x =
        padding +
        (index/(data.length-1)) * width;

      const y =
        canvas.height - padding -
        (value/maxValue) * height;

      if(index === 0){
        ctx.moveTo(x,y);
      }else{
        ctx.lineTo(x,y);
      }
    });

    ctx.stroke();
  }

  drawLine(balances,"#2f81f7");
  drawLine(deposits,"#3fb950");
  drawLine(interests,"#f78166");
}

function drawBreakdownChart(
  principal,
  contributions,
  interest
){

  const canvas =
    document.getElementById("breakdownChart");

  const ctx =
    canvas.getContext("2d");

  ctx.clearRect(0,0,canvas.width,canvas.height);

  const total =
    principal + contributions + interest;

  const values = [
    principal,
    contributions,
    interest
  ];

  const colors = [
    "#2f81f7",
    "#3fb950",
    "#f78166"
  ];

  let startAngle = 0;

  values.forEach((value,index)=>{

    const slice =
      (value / total) * Math.PI * 2;

    ctx.beginPath();

    ctx.moveTo(280,130);

    ctx.arc(
      280,
      130,
      90,
      startAngle,
      startAngle + slice
    );

    ctx.closePath();

    ctx.fillStyle = colors[index];
    ctx.fill();

    startAngle += slice;
  });

  ctx.beginPath();
  ctx.fillStyle =
    document.documentElement.classList.contains("dark")
      ? "#161b22"
      : "#ffffff";

  ctx.arc(280,130,45,0,Math.PI*2);
  ctx.fill();

  const labels = [
    "Initial Investment",
    "Contributions",
    "Interest"
  ];

  labels.forEach((label,index)=>{

    ctx.fillStyle =
      colors[index];

    ctx.fillRect(430,60 + (index*30),18,18);

    ctx.fillStyle =
      document.documentElement.classList.contains("dark")
        ? "#f0f6fc"
        : "#24292f";

    ctx.font = "14px Arial";

    ctx.fillText(
      label,
      458,
      74 + (index*30)
    );
  });
}

document.querySelectorAll(".faq-question").forEach(button => {

  button.addEventListener("click", () => {

    const item = button.parentElement;

    item.classList.toggle("active");
  });
});

calculate();
