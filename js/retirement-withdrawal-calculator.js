
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

function calculate(){
  const retirementSavings = Number(document.getElementById("retirementSavings").value);
  const years = Number(document.getElementById("years").value);
  const annualRate = Number(document.getElementById("rate").value) / 100;
  const desiredEndingBalance = Number(document.getElementById("endingBalance").value);

  if(retirementSavings <= 0 || years <= 0 || annualRate < 0 || desiredEndingBalance < 0 || desiredEndingBalance >= retirementSavings){
    alert("Please enter valid numbers. Desired ending balance should be lower than retirement savings.");
    return;
  }

  const months = years * 12;
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;

  let monthlyWithdrawal;

  if(monthlyRate === 0){
    monthlyWithdrawal = (retirementSavings - desiredEndingBalance) / months;
  }else{
    monthlyWithdrawal = (retirementSavings - desiredEndingBalance / Math.pow(1 + monthlyRate, months)) * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
  }

  const yearlyData = [];
  let balance = retirementSavings;
  let totalWithdrawn = 0;
  let totalInterest = 0;

  for(let year = 1; year <= years; year++){
    const startBalance = balance;
    let yearWithdrawn = 0;
    let yearInterest = 0;

    for(let month = 1; month <= 12; month++){
      const interest = balance * monthlyRate;
      balance += interest;
      yearInterest += interest;

      const withdrawal = Math.min(monthlyWithdrawal, balance);
      balance -= withdrawal;
      yearWithdrawn += withdrawal;
    }

    if(balance < 0.01){
      balance = 0;
    }

    totalWithdrawn += yearWithdrawn;
    totalInterest += yearInterest;

    yearlyData.push({
      year,
      startBalance,
      withdrawn: yearWithdrawn,
      interest: yearInterest,
      balance
    });
  }

  document.getElementById("monthlyWithdrawal").textContent = money.format(monthlyWithdrawal);
  document.getElementById("totalWithdrawn").textContent = money.format(totalWithdrawn);
  document.getElementById("totalInterest").textContent = money.format(totalInterest);
  document.getElementById("endingBalanceResult").textContent = money.format(balance);
  document.getElementById("resultBox").style.display = "block";

  fillTable(yearlyData);
  drawBalanceChart(yearlyData, retirementSavings);
  drawBreakdownChart(totalWithdrawn, totalInterest);
}

function fillTable(data){
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.year}</td>
      <td>${money.format(row.startBalance)}</td>
      <td>${money.format(row.withdrawn)}</td>
      <td>${money.format(row.balance)}</td>
    `;
    tableBody.appendChild(tr);
  });
}

function drawBalanceChart(data, startingBalance){
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

  data.forEach((item, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
    const y = height - padding - (item.balance / startingBalance) * chartHeight;

    if(index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.lineTo(width - padding, height - padding);
  ctx.lineTo(padding, height - padding);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();

  data.forEach((item, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
    const y = height - padding - (item.balance / startingBalance) * chartHeight;

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

function drawBreakdownChart(withdrawn, interest){
  const canvas = document.getElementById("breakdownChart");
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = 260 * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = 260;
  const isDark = document.documentElement.classList.contains("dark");

  ctx.clearRect(0, 0, width, height);

  const total = withdrawn + interest;
  if(total <= 0) return;

  const centerX = width / 2;
  const centerY = 112;
  const radius = 70;
  const lineWidth = 22;
  const withdrawnAngle = (withdrawn / total) * Math.PI * 2;

  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.strokeStyle = isDark ? "#2f81f7" : "#0969da";
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + withdrawnAngle);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = isDark ? "#3fb950" : "#2da44e";
  ctx.arc(centerX, centerY, radius, -Math.PI / 2 + withdrawnAngle, Math.PI * 1.5);
  ctx.stroke();

  ctx.font = "700 14px Arial";
  ctx.fillStyle = isDark ? "#f0f6fc" : "#24292f";
  ctx.textAlign = "center";
  ctx.fillText("Total Value", centerX, centerY - 4);

  ctx.font = "12px Arial";
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText(money.format(total), centerX, centerY + 16);

  ctx.textAlign = "left";
  ctx.font = "12px Arial";

  const legendX = width / 2 - 112;
  const legendY = 218;

  ctx.fillStyle = isDark ? "#2f81f7" : "#0969da";
  ctx.fillRect(legendX, legendY, 10, 10);
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText("Withdrawn", legendX + 16, legendY + 10);

  ctx.fillStyle = isDark ? "#3fb950" : "#2da44e";
  ctx.fillRect(legendX + 125, legendY, 10, 10);
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText("Interest", legendX + 141, legendY + 10);
}

function clearForm(){
  document.getElementById("retirementSavings").value = "";
  document.getElementById("years").value = "";
  document.getElementById("rate").value = "";
  document.getElementById("endingBalance").value = "";
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
