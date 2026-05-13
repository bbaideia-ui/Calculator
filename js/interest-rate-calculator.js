
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle.addEventListener("click", () => {
  mainNav.classList.toggle("open");
});

function setYears(value){
  document.getElementById("years").value = value;
}

function setMonthlyPayment(value){
  document.getElementById("monthlyPayment").value = value;
}

function calculate(){
  const loanAmount = Number(document.getElementById("loanAmount").value);
  const years = Number(document.getElementById("years").value);
  const months = Number(document.getElementById("months").value);
  const monthlyPayment = Number(document.getElementById("monthlyPayment").value);

  const totalMonths = years * 12 + months;

  if(loanAmount <= 0 || totalMonths <= 0 || monthlyPayment <= 0){
    alert("Please enter valid numbers.");
    return;
  }

  if(monthlyPayment * totalMonths <= loanAmount){
    alert("Monthly payment is too low to repay this loan within the selected term.");
    return;
  }

  const monthlyRate = findMonthlyRate(loanAmount, monthlyPayment, totalMonths);
  const annualRate = monthlyRate * 12;
  const totalPayments = monthlyPayment * totalMonths;
  const totalInterest = totalPayments - loanAmount;

  document.getElementById("interestRateResult").textContent = (annualRate * 100).toFixed(2) + "%";
  document.getElementById("totalPayments").textContent = money.format(totalPayments);
  document.getElementById("totalInterest").textContent = money.format(totalInterest);
  document.getElementById("resultBox").style.display = "block";

  const yearlyData = buildSchedule(loanAmount, monthlyPayment, monthlyRate, totalMonths);

  fillTable(yearlyData);
  drawBalanceChart(yearlyData, loanAmount);
  drawBreakdownChart(loanAmount, totalInterest);
}

function findMonthlyRate(loanAmount, monthlyPayment, totalMonths){
  let low = 0;
  let high = 1;

  for(let i = 0; i < 120; i++){
    const mid = (low + high) / 2;
    const estimatedPayment = loanAmount * mid / (1 - Math.pow(1 + mid, -totalMonths));

    if(estimatedPayment > monthlyPayment){
      high = mid;
    }else{
      low = mid;
    }
  }

  return (low + high) / 2;
}

function buildSchedule(loanAmount, monthlyPayment, monthlyRate, totalMonths){
  let balance = loanAmount;
  const yearlyData = [];

  for(let month = 1; month <= totalMonths; month++){
    const interest = balance * monthlyRate;
    const principal = Math.min(monthlyPayment - interest, balance);

    balance -= principal;

    const yearIndex = Math.ceil(month / 12);

    if(!yearlyData[yearIndex - 1]){
      yearlyData[yearIndex - 1] = {
        year: yearIndex,
        balance: 0,
        interest: 0,
        principal: 0
      };
    }

    yearlyData[yearIndex - 1].interest += interest;
    yearlyData[yearIndex - 1].principal += principal;
    yearlyData[yearIndex - 1].balance = Math.max(0, balance);

    if(balance <= 0) break;
  }

  return yearlyData;
}

function fillTable(data){
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  data.forEach(row => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${row.year}</td>
      <td>${money.format(row.balance)}</td>
      <td>${money.format(row.interest)}</td>
      <td>${money.format(row.principal)}</td>
    `;

    tableBody.appendChild(tr);
  });
}

function setupCanvas(canvas){
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || 560;
  const height = 260;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  return { ctx, width, height };
}

function drawBalanceChart(data, loanAmount){
  const canvas = document.getElementById("balanceChart");
  const { ctx, width, height } = setupCanvas(canvas);

  ctx.clearRect(0, 0, width, height);

  if(!data.length) return;

  const padding = 34;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const isDark = document.documentElement.classList.contains("dark");

  ctx.strokeStyle = isDark ? "#30363d" : "#d0d7de";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
  gradient.addColorStop(0, isDark ? "rgba(47,129,247,0.35)" : "rgba(9,105,218,0.22)");
  gradient.addColorStop(1, "rgba(9,105,218,0)");

  ctx.beginPath();

  data.forEach((row, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
    const y = height - padding - (row.balance / loanAmount) * chartHeight;

    if(index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.lineTo(width - padding, height - padding);
  ctx.lineTo(padding, height - padding);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();

  data.forEach((row, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
    const y = height - padding - (row.balance / loanAmount) * chartHeight;

    if(index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.strokeStyle = isDark ? "#2f81f7" : "#0969da";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.font = "12px Arial";
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText("Year 1", padding, height - 8);
  ctx.fillText("Year " + data[data.length - 1].year, width - padding - 60, height - 8);
}

function drawBreakdownChart(principal, interest){
  const canvas = document.getElementById("breakdownChart");
  const { ctx, width, height } = setupCanvas(canvas);

  ctx.clearRect(0, 0, width, height);

  const total = principal + interest;
  if(total <= 0) return;

  const isDark = document.documentElement.classList.contains("dark");

  const centerX = width / 2;
  const centerY = 112;
  const radius = 70;
  const lineWidth = 22;
  const principalAngle = (principal / total) * Math.PI * 2;

  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.strokeStyle = isDark ? "#2f81f7" : "#0969da";
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + principalAngle);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = isDark ? "#3fb950" : "#2da44e";
  ctx.arc(centerX, centerY, radius, -Math.PI / 2 + principalAngle, Math.PI * 1.5);
  ctx.stroke();

  ctx.font = "700 14px Arial";
  ctx.fillStyle = isDark ? "#f0f6fc" : "#24292f";
  ctx.textAlign = "center";
  ctx.fillText("Total Payments", centerX, centerY - 4);

  ctx.font = "12px Arial";
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText(money.format(total), centerX, centerY + 16);

  ctx.textAlign = "left";
  ctx.font = "12px Arial";

  const legendX = width / 2 - 115;
  const legendY = 218;

  ctx.fillStyle = isDark ? "#2f81f7" : "#0969da";
  ctx.fillRect(legendX, legendY, 10, 10);
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText("Principal", legendX + 16, legendY + 10);

  ctx.fillStyle = isDark ? "#3fb950" : "#2da44e";
  ctx.fillRect(legendX + 125, legendY, 10, 10);
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText("Interest", legendX + 141, legendY + 10);
}

function clearForm(){
  document.getElementById("loanAmount").value = "";
  document.getElementById("years").value = "";
  document.getElementById("months").value = "";
  document.getElementById("monthlyPayment").value = "";
  document.getElementById("resultBox").style.display = "none";
  document.getElementById("tableBody").innerHTML = "";

  const balanceCanvas = document.getElementById("balanceChart");
  const balanceCtx = balanceCanvas.getContext("2d");
  balanceCtx.clearRect(0, 0, balanceCanvas.width, balanceCanvas.height);

  const breakdownCanvas = document.getElementById("breakdownChart");
  const breakdownCtx = breakdownCanvas.getContext("2d");
  breakdownCtx.clearRect(0, 0, breakdownCanvas.width, breakdownCanvas.height);
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
