
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
  document.getElementById("rate").value = value;
}

function setYears(value){
  document.getElementById("years").value = value;
}

function setDownPayment(value){
  document.getElementById("downPaymentPercent").value = value;
}

function calculate(){

  const homePrice = Number(document.getElementById("homePrice").value);
  const downPaymentPercent = Number(document.getElementById("downPaymentPercent").value) / 100;
  const years = Number(document.getElementById("years").value);
  const annualRate = Number(document.getElementById("rate").value) / 100;
  const propertyTaxRate = Number(document.getElementById("propertyTaxRate").value) / 100;
  const homeInsurance = Number(document.getElementById("homeInsurance").value);
  const pmi = Number(document.getElementById("pmi").value);
  const hoa = Number(document.getElementById("hoa").value);
  const otherCosts = Number(document.getElementById("otherCosts").value);

  if(homePrice <= 0 || downPaymentPercent < 0 || years <= 0 || annualRate < 0){
    alert("Please enter valid numbers.");
    return;
  }

  const downPayment = homePrice * downPaymentPercent;
  const loanAmount = homePrice - downPayment;
  const totalMonths = years * 12;
  const monthlyRate = annualRate / 12;

  let monthlyPI;

  if(monthlyRate === 0){
    monthlyPI = loanAmount / totalMonths;
  }else{
    monthlyPI = loanAmount * (
      monthlyRate * Math.pow(1 + monthlyRate, totalMonths)
    ) / (
      Math.pow(1 + monthlyRate, totalMonths) - 1
    );
  }

  const monthlyTax = (homePrice * propertyTaxRate) / 12;
  const monthlyInsurance = homeInsurance / 12;
  const monthlyOtherCosts = otherCosts / 12;

  const totalMonthly =
    monthlyPI +
    monthlyTax +
    monthlyInsurance +
    pmi +
    hoa +
    monthlyOtherCosts;

  const totalPI = monthlyPI * totalMonths;
  const totalInterest = totalPI - loanAmount;

  document.getElementById("totalMonthly").textContent = money.format(totalMonthly);
  document.getElementById("monthlyPI").textContent = money.format(monthlyPI);
  document.getElementById("loanAmountResult").textContent = money.format(loanAmount);
  document.getElementById("totalInterest").textContent = money.format(totalInterest);

  document.getElementById("resultBox").style.display = "block";

  const yearlyData = [];

  let balance = loanAmount;
  let yearPrincipal = 0;
  let yearInterest = 0;

  for(let month = 1; month <= totalMonths; month++){

    const interestPayment = balance * monthlyRate;

    let principalPayment = monthlyPI - interestPayment;

    if(principalPayment > balance){
      principalPayment = balance;
    }

    balance -= principalPayment;

    if(balance < 0.01){
      balance = 0;
    }

    yearPrincipal += principalPayment;
    yearInterest += interestPayment;

    if(month % 12 === 0 || month === totalMonths){

      yearlyData.push({
        year: Math.ceil(month / 12),
        principal: yearPrincipal,
        interest: yearInterest,
        balance: balance
      });

      yearPrincipal = 0;
      yearInterest = 0;
    }
  }

  fillTable(yearlyData);

  drawBalanceChart(yearlyData, loanAmount);

  drawBreakdownChart(
    monthlyPI,
    monthlyTax,
    monthlyInsurance,
    pmi + hoa + monthlyOtherCosts
  );

  drawOverviewChart(
    yearlyData,
    loanAmount,
    totalPI
  );
}

function fillTable(data){

  const tableBody = document.getElementById("tableBody");

  tableBody.innerHTML = "";

  data.forEach(row => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${row.year}</td>
      <td>${money.format(row.principal)}</td>
      <td>${money.format(row.interest)}</td>
      <td>${money.format(row.balance)}</td>
    `;

    tableBody.appendChild(tr);
  });
}

function drawBalanceChart(data, originalLoan){

  const canvas = document.getElementById("balanceChart");
  const ctx = canvas.getContext("2d");

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = 260 * dpr;

  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = 260;

  ctx.clearRect(0, 0, width, height);

  if(!data.length) return;

  const padding = 34;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const isDark =
    document.documentElement.classList.contains("dark");

  ctx.strokeStyle = isDark ? "#30363d" : "#d0d7de";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  const gradient = ctx.createLinearGradient(
    0,
    padding,
    0,
    height - padding
  );

  gradient.addColorStop(
    0,
    isDark
      ? "rgba(47,129,247,0.35)"
      : "rgba(9,105,218,0.22)"
  );

  gradient.addColorStop(
    1,
    "rgba(9,105,218,0)"
  );

  ctx.beginPath();

  data.forEach((item, index) => {

    const x =
      padding +
      (index / (data.length - 1 || 1)) *
      chartWidth;

    const y =
      height -
      padding -
      (item.balance / originalLoan) *
      chartHeight;

    if(index === 0){
      ctx.moveTo(x, y);
    }else{
      ctx.lineTo(x, y);
    }
  });

  ctx.lineTo(width - padding, height - padding);
  ctx.lineTo(padding, height - padding);

  ctx.closePath();

  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();

  data.forEach((item, index) => {

    const x =
      padding +
      (index / (data.length - 1 || 1)) *
      chartWidth;

    const y =
      height -
      padding -
      (item.balance / originalLoan) *
      chartHeight;

    if(index === 0){
      ctx.moveTo(x, y);
    }else{
      ctx.lineTo(x, y);
    }
  });

  ctx.strokeStyle = isDark ? "#2f81f7" : "#0969da";
  ctx.lineWidth = 3;

  ctx.stroke();

  const last = data[data.length - 1];

  ctx.font = "12px Arial";

  ctx.fillStyle =
    isDark ? "#8b949e" : "#57606a";

  ctx.fillText(
    "Year 1",
    padding,
    height - 8
  );

  ctx.fillText(
    "Year " + last.year,
    width - padding - 60,
    height - 8
  );
}

function drawBreakdownChart(
  principalInterest,
  propertyTax,
  insurance,
  otherCosts
){

  const canvas = document.getElementById("breakdownChart");
  const ctx = canvas.getContext("2d");

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = 260 * dpr;

  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = 260;

  const isDark =
    document.documentElement.classList.contains("dark");

  ctx.clearRect(0, 0, width, height);

  const total =
    principalInterest +
    propertyTax +
    insurance +
    otherCosts;

  if(total <= 0) return;

  const centerX = width / 2;
  const centerY = 112;
  const radius = 70;
  const lineWidth = 22;

  let startAngle = -Math.PI / 2;

  const parts = [
    {
      label:"P&I",
      value: principalInterest,
      color: isDark ? "#2f81f7" : "#0969da"
    },
    {
      label:"Tax",
      value: propertyTax,
      color: isDark ? "#3fb950" : "#2da44e"
    },
    {
      label:"Insurance",
      value: insurance,
      color: isDark ? "#f85149" : "#cf222e"
    },
    {
      label:"Other",
      value: otherCosts,
      color: isDark ? "#a371f7" : "#8250df"
    }
  ];

  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";

  parts.forEach(part => {

    if(part.value <= 0) return;

    const angle =
      (part.value / total) *
      Math.PI * 2;

    ctx.beginPath();

    ctx.strokeStyle = part.color;

    ctx.arc(
      centerX,
      centerY,
      radius,
      startAngle,
      startAngle + angle
    );

    ctx.stroke();

    startAngle += angle;
  });

  ctx.font = "700 14px Arial";

  ctx.fillStyle =
    isDark ? "#f0f6fc" : "#24292f";

  ctx.textAlign = "center";

  ctx.fillText(
    "Monthly Pay",
    centerX,
    centerY - 4
  );

  ctx.font = "12px Arial";

  ctx.fillStyle =
    isDark ? "#8b949e" : "#57606a";

  ctx.fillText(
    money.format(total),
    centerX,
    centerY + 16
  );

  ctx.textAlign = "left";
  ctx.font = "12px Arial";

  const legendX = width / 2 - 135;
  const legendY = 218;

  parts.forEach((part, index) => {

    const x = legendX + index * 70;

    ctx.fillStyle = part.color;
    ctx.fillRect(x, legendY, 10, 10);

    ctx.fillStyle =
      isDark ? "#8b949e" : "#57606a";

    ctx.fillText(
      part.label,
      x + 15,
      legendY + 10
    );
  });
}

function drawOverviewChart(
  data,
  originalLoan,
  totalPayments
){

  const canvas = document.getElementById("overviewChart");
  const ctx = canvas.getContext("2d");

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = 260 * dpr;

  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = 260;

  ctx.clearRect(0, 0, width, height);

  if(!data.length) return;

  const padding = 38;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const isDark =
    document.documentElement.classList.contains("dark");

  let cumulativeInterest = [];
  let cumulativePayment = [];

  let principalTotal = 0;
  let interestTotal = 0;

  data.forEach(row => {

    principalTotal += row.principal;
    interestTotal += row.interest;

    cumulativeInterest.push(interestTotal);

    cumulativePayment.push(
      principalTotal + interestTotal
    );
  });

  const maxValue = Math.max(
    originalLoan,
    totalPayments,
    ...data.map(item => item.balance),
    ...cumulativeInterest,
    ...cumulativePayment
  );

  ctx.strokeStyle =
    isDark ? "#30363d" : "#d0d7de";

  ctx.lineWidth = 1;

  ctx.beginPath();

  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);

  ctx.stroke();

  function drawLine(values, color){

    ctx.beginPath();

    values.forEach((value, index) => {

      const x =
        padding +
        (index / (values.length - 1 || 1)) *
        chartWidth;

      const y =
        height -
        padding -
        (value / maxValue) *
        chartHeight;

      if(index === 0){
        ctx.moveTo(x, y);
      }else{
        ctx.lineTo(x, y);
      }
    });

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    ctx.stroke();
  }

  drawLine(
    data.map(row => row.balance),
    isDark ? "#2f81f7" : "#0969da"
  );

  drawLine(
    cumulativeInterest,
    isDark ? "#3fb950" : "#2da44e"
  );

  drawLine(
    cumulativePayment,
    isDark ? "#f85149" : "#cf222e"
  );

  ctx.font = "12px Arial";

  ctx.fillStyle =
    isDark ? "#8b949e" : "#57606a";

  ctx.fillText(
    "Year 1",
    padding,
    height - 8
  );

  ctx.fillText(
    "Year " + data[data.length - 1].year,
    width - padding - 60,
    height - 8
  );

  const legendY = 20;
  const legendX = padding;

  const legends = [
    {
      label:"Balance",
      color:isDark ? "#2f81f7" : "#0969da"
    },
    {
      label:"Interest",
      color:isDark ? "#3fb950" : "#2da44e"
    },
    {
      label:"Payments",
      color:isDark ? "#f85149" : "#cf222e"
    }
  ];

  legends.forEach((item, index) => {

    const x = legendX + index * 105;

    ctx.fillStyle = item.color;
    ctx.fillRect(x, legendY, 10, 10);

    ctx.fillStyle =
      isDark ? "#8b949e" : "#57606a";

    ctx.fillText(
      item.label,
      x + 16,
      legendY + 10
    );
  });
}

function clearForm(){

  document.getElementById("homePrice").value = "";
  document.getElementById("downPaymentPercent").value = "";
  document.getElementById("years").value = "";
  document.getElementById("rate").value = "";
  document.getElementById("propertyTaxRate").value = "";
  document.getElementById("homeInsurance").value = "";
  document.getElementById("pmi").value = "";
  document.getElementById("hoa").value = "";
  document.getElementById("otherCosts").value = "";

  document.getElementById("resultBox").style.display = "none";

  document.getElementById("tableBody").innerHTML = "";

  const balanceCanvas =
    document.getElementById("balanceChart");

  const balanceCtx =
    balanceCanvas.getContext("2d");

  balanceCtx.clearRect(
    0,
    0,
    balanceCanvas.width,
    balanceCanvas.height
  );

  const breakdownCanvas =
    document.getElementById("breakdownChart");

  const breakdownCtx =
    breakdownCanvas.getContext("2d");

  breakdownCtx.clearRect(
    0,
    0,
    breakdownCanvas.width,
    breakdownCanvas.height
  );

  const overviewCanvas =
    document.getElementById("overviewChart");

  const overviewCtx =
    overviewCanvas.getContext("2d");

  overviewCtx.clearRect(
    0,
    0,
    overviewCanvas.width,
    overviewCanvas.height
  );
}

document.querySelectorAll(".faq-question").forEach(button => {

  button.addEventListener("click", () => {

    const item =
      button.closest(".faq-item");

    const isActive =
      item.classList.contains("active");

    document.querySelectorAll(".faq-item").forEach(faq => {

      faq.classList.remove("active");

      faq
        .querySelector(".faq-question")
        .setAttribute("aria-expanded", "false");
    });

    if(!isActive){

      item.classList.add("active");

      button.setAttribute(
        "aria-expanded",
        "true"
      );
    }
  });
});

window.addEventListener("resize", calculate);

calculate();
