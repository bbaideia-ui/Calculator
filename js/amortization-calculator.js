
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if(menuToggle && mainNav){
  menuToggle.addEventListener("click", () => {
    mainNav.classList.toggle("open");
  });
}

function setRate(value){
  document.getElementById("rate").value = value;
}

function setYears(value){
  document.getElementById("years").value = value;
}

function calculate(){
  const loanAmount = Number(document.getElementById("loanAmount").value);
  const years = Number(document.getElementById("years").value);
  const annualRate = Number(document.getElementById("rate").value) / 100;

  if(loanAmount <= 0 || years <= 0 || annualRate < 0){
    alert("Please enter valid numbers.");
    return;
  }

  const monthlyRate = annualRate / 12;
  const totalMonths = years * 12;

  let monthlyPayment;

  if(monthlyRate === 0){
    monthlyPayment = loanAmount / totalMonths;
  }else{
    monthlyPayment =
      loanAmount *
      monthlyRate *
      Math.pow(1 + monthlyRate, totalMonths) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  const totalPayments = monthlyPayment * totalMonths;
  const totalInterest = totalPayments - loanAmount;

  document.getElementById("monthlyPayment").textContent = money.format(monthlyPayment);
  document.getElementById("totalPayments").textContent = money.format(totalPayments);
  document.getElementById("totalInterest").textContent = money.format(totalInterest);
  document.getElementById("resultBox").style.display = "block";

  const yearlyData = [];
  let balance = loanAmount;

  for(let year = 1; year <= years; year++){
    let yearlyInterest = 0;
    let yearlyPrincipal = 0;

    for(let month = 1; month <= 12; month++){
      const interestPayment = balance * monthlyRate;
      let principalPayment = monthlyPayment - interestPayment;

      if(principalPayment > balance){
        principalPayment = balance;
      }

      yearlyInterest += interestPayment;
      yearlyPrincipal += principalPayment;
      balance -= principalPayment;

      if(balance < 0.01){
        balance = 0;
      }
    }

    yearlyData.push({
      year,
      interest: yearlyInterest,
      principal: yearlyPrincipal,
      balance
    });
  }

  fillTable(yearlyData);
  drawBreakdownChart(loanAmount, totalInterest, totalPayments);
  drawAmortizationChart(yearlyData, loanAmount, totalPayments);
}

function fillTable(data){
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  data.forEach(row => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${row.year}</td>
      <td>${money.format(row.interest)}</td>
      <td>${money.format(row.principal)}</td>
      <td>${money.format(row.balance)}</td>
    `;

    tableBody.appendChild(tr);
  });
}

function setupCanvas(canvas, height = 260){
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || 560;

  canvas.style.width = "100%";
  canvas.style.height = height + "px";

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  return { ctx, width, height };
}

function drawBreakdownChart(principal, interest, totalPayments){
  const canvas = document.getElementById("breakdownChart");
  const { ctx, width, height } = setupCanvas(canvas, 260);

  ctx.clearRect(0, 0, width, height);

  const total = principal + interest;
  if(total <= 0) return;

  const isDark = document.documentElement.classList.contains("dark");

  const centerX = width / 2;
  const centerY = 105;
  const radius = 62;
  const lineWidth = 26;

  const parts = [
    {
      label: "Principal",
      value: principal,
      color: isDark ? "#2f81f7" : "#0969da"
    },
    {
      label: "Interest",
      value: interest,
      color: isDark ? "#3fb950" : "#2da44e"
    }
  ];

  let startAngle = -Math.PI / 2;

  ctx.lineWidth = lineWidth;
  ctx.lineCap = "butt";

  parts.forEach(part => {
    if(part.value <= 0) return;

    const angle = (part.value / total) * Math.PI * 2;

    ctx.beginPath();
    ctx.strokeStyle = part.color;
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
    ctx.stroke();

    startAngle += angle;
  });

  ctx.font = "700 13px Arial";
  ctx.fillStyle = isDark ? "#f0f6fc" : "#24292f";
  ctx.textAlign = "center";
  ctx.fillText("Monthly Pay", centerX, centerY - 4);

  ctx.font = "12px Arial";
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText(money.format(totalPayments / (document.getElementById("years").value * 12)), centerX, centerY + 15);

  ctx.textAlign = "left";
  ctx.font = "12px Arial";

  const legendY = 220;
  const legendX = Math.max(24, width / 2 - 95);

  parts.forEach((part, index) => {
    const x = legendX + index * 120;

    ctx.fillStyle = part.color;
    ctx.fillRect(x, legendY, 10, 10);

    ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
    ctx.fillText(part.label, x + 16, legendY + 10);
  });
}

function drawAmortizationChart(data, originalLoan, totalPayments){
  const canvas = document.getElementById("amortizationChart");
  const { ctx, width, height } = setupCanvas(canvas, 260);

  ctx.clearRect(0, 0, width, height);

  if(!data.length) return;

  const padding = 36;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const isDark = document.documentElement.classList.contains("dark");

  const maxValue = Math.max(originalLoan, totalPayments);

  ctx.strokeStyle = isDark ? "#30363d" : "#d0d7de";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  function drawLine(values, color){
    ctx.beginPath();

    values.forEach((value, index) => {
      const x = padding + (index / (values.length - 1 || 1)) * chartWidth;
      const y = height - padding - (value / maxValue) * chartHeight;

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

  const balanceValues = data.map(row => row.balance);
  const interestValues = data.map((row, index) => {
    return data.slice(0, index + 1).reduce((sum, item) => sum + item.interest, 0);
  });
  const paymentValues = data.map((row, index) => {
    return totalPayments * ((index + 1) / data.length);
  });

  drawLine(balanceValues, isDark ? "#2f81f7" : "#0969da");
  drawLine(interestValues, isDark ? "#3fb950" : "#2da44e");
  drawLine(paymentValues, isDark ? "#f85149" : "#cf222e");

  ctx.font = "12px Arial";
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText("Year 1", padding, height - 8);
  ctx.fillText("Year " + data[data.length - 1].year, width - padding - 60, height - 8);

  const legendX = padding;
  const legendY = padding + 12;

  const legends = [
    { label: "Balance", color: isDark ? "#2f81f7" : "#0969da" },
    { label: "Interest", color: isDark ? "#3fb950" : "#2da44e" },
    { label: "Payment", color: isDark ? "#f85149" : "#cf222e" }
  ];

  legends.forEach((item, index) => {
    const y = legendY + index * 18;

    ctx.fillStyle = item.color;
    ctx.fillRect(legendX, y - 9, 14, 4);

    ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
    ctx.fillText(item.label, legendX + 20, y);
  });
}

function clearForm(){
  document.getElementById("loanAmount").value = "";
  document.getElementById("years").value = "";
  document.getElementById("rate").value = "";

  document.getElementById("resultBox").style.display = "none";
  document.getElementById("tableBody").innerHTML = "";

  const breakdownCanvas = document.getElementById("breakdownChart");
  const breakdownCtx = breakdownCanvas.getContext("2d");
  breakdownCtx.clearRect(0, 0, breakdownCanvas.width, breakdownCanvas.height);

  const amortizationCanvas = document.getElementById("amortizationChart");
  const amortizationCtx = amortizationCanvas.getContext("2d");
  amortizationCtx.clearRect(0, 0, amortizationCanvas.width, amortizationCanvas.height);
}

document.querySelectorAll(".faq-question").forEach(button => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const isActive = item.classList.contains("active");

    document.querySelectorAll(".faq-item").forEach(faq => {
      faq.classList.remove("active");
      faq.querySelector(".faq-question").setAttribute("aria-expanded", "false");
    });

    if(!isActive){
      item.classList.add("active");
      button.setAttribute("aria-expanded", "true");
    }
  });
});

window.addEventListener("resize", calculate);

calculate();
