
Claro. Substitua todo o JavaScript por este código completo atualizado:

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
function setAnnualContribution(value){
  document.getElementById("annualContribution").value = value;
}
function setMonthlyContribution(value){
  document.getElementById("monthlyContribution").value = value;
}
function calculate(){
  const initialDeposit = Number(document.getElementById("initialDeposit").value);
  const annualContributionInput = Number(document.getElementById("annualContribution").value);
  const annualIncrease = Number(document.getElementById("annualIncrease").value) / 100;
  const monthlyContributionInput = Number(document.getElementById("monthlyContribution").value);
  const monthlyIncrease = Number(document.getElementById("monthlyIncrease").value) / 100;
  const annualRate = Number(document.getElementById("rate").value) / 100;
  const frequency = Number(document.getElementById("frequency").value);
  const years = Number(document.getElementById("years").value);
  const taxRate = Number(document.getElementById("taxRate").value) / 100;
  if(
    initialDeposit < 0 ||
    annualContributionInput < 0 ||
    monthlyContributionInput < 0 ||
    annualRate < 0 ||
    years <= 0 ||
    taxRate < 0
  ){
    return;
  }
  let balance = initialDeposit;
  let totalContributions = initialDeposit;
  let annualContribution = annualContributionInput;
  let monthlyContribution = monthlyContributionInput;
  let previousBalance = balance;
  const yearlyData = [];
  const monthlyRate = Math.pow(1 + annualRate / frequency, frequency / 12) - 1;
  for(let year = 1; year <= years; year++){
    let yearDeposit = 0;
    for(let month = 1; month <= 12; month++){
      const interestBeforeTax = balance * monthlyRate;
      const interestAfterTax = interestBeforeTax * (1 - taxRate);
      balance += interestAfterTax;
      balance += monthlyContribution;
      yearDeposit += monthlyContribution;
      totalContributions += monthlyContribution;
    }
    balance += annualContribution;
    yearDeposit += annualContribution;
    totalContributions += annualContribution;
    const yearInterest = balance - previousBalance - yearDeposit;
    yearlyData.push({
      year,
      deposit: yearDeposit,
      interest: yearInterest,
      balance,
      totalContributions
    });
    previousBalance = balance;
    annualContribution *= (1 + annualIncrease);
    monthlyContribution *= (1 + monthlyIncrease);
  }
  const totalInterest = balance - totalContributions;
  document.getElementById("endBalance").textContent = money.format(balance);
  document.getElementById("initialResult").textContent = money.format(initialDeposit);
  document.getElementById("totalContributions").textContent = money.format(totalContributions - initialDeposit);
  document.getElementById("interestEarned").textContent = money.format(totalInterest);
  document.getElementById("resultBox").style.display = "block";
  fillTable(yearlyData);
  drawGrowthChart(yearlyData, initialDeposit);
  drawBreakdownChart(
    initialDeposit,
    totalContributions - initialDeposit,
    totalInterest
  );
}
function fillTable(data){
  const tableBody = document.getElementById("tableBody");
  if(!tableBody) return;
  tableBody.innerHTML = "";
  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.year}</td>
      <td>${money.format(row.deposit)}</td>
      <td>${money.format(row.interest)}</td>
      <td>${money.format(row.balance)}</td>
    `;
    tableBody.appendChild(tr);
  });
}
function drawGrowthChart(data, initialDeposit){
  const canvas = document.getElementById("growthChart");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
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
  const maxValue = Math.max(...data.map(item => item.balance));
  const isDark = document.documentElement.classList.contains("dark");
  ctx.strokeStyle = isDark ? "#30363d" : "#d0d7de";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();
  data.forEach((item, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
    const contributionsOnly = Math.max(0, item.totalContributions - initialDeposit);
    const interestOnly = Math.max(0, item.balance - item.totalContributions);
    const initialHeight = (initialDeposit / maxValue) * chartHeight;
    const contributionHeight = (contributionsOnly / maxValue) * chartHeight;
    const interestHeight = (interestOnly / maxValue) * chartHeight;
    const barWidth = Math.max(
      12,
      Math.min(28, chartWidth / data.length * 0.45)
    );
    const baseY = height - padding;
    const barX = x - barWidth / 2;
    ctx.fillStyle = isDark ? "#2f81f7" : "#0969da";
    ctx.fillRect(
      barX,
      baseY - initialHeight,
      barWidth,
      initialHeight
    );
    ctx.fillStyle = isDark ? "#3fb950" : "#2da44e";
    ctx.fillRect(
      barX,
      baseY - initialHeight - contributionHeight,
      barWidth,
      contributionHeight
    );
    ctx.fillStyle = isDark ? "#f85149" : "#cf222e";
    ctx.fillRect(
      barX,
      baseY - initialHeight - contributionHeight - interestHeight,
      barWidth,
      interestHeight
    );
  });
  const last = data[data.length - 1];
  ctx.font = "12px Arial";
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText("Year 1", padding, height - 8);
  ctx.fillText("Year " + last.year, width - padding - 60, height - 8);
}
function drawBreakdownChart(initialDeposit, contributions, interest){
  const canvas = document.getElementById("breakdownChart");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  canvas.width = rect.width * dpr;
  canvas.height = 260 * dpr;
  ctx.scale(dpr, dpr);
  const width = rect.width;
  const height = 260;
  const isDark = document.documentElement.classList.contains("dark");
  ctx.clearRect(0, 0, width, height);
  const total = initialDeposit + contributions + interest;
  if(total <= 0) return;
  const centerX = width / 2;
  const centerY = 112;
  const radius = 70;
  const lineWidth = 22;
  let startAngle = -Math.PI / 2;
  const parts = [
    {
      value: initialDeposit,
      color: isDark ? "#2f81f7" : "#0969da"
    },
    {
      value: contributions,
      color: isDark ? "#3fb950" : "#2da44e"
    },
    {
      value: interest,
      color: isDark ? "#f85149" : "#cf222e"
    }
  ];
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  parts.forEach(part => {
    if(part.value <= 0) return;
    const angle = (part.value / total) * Math.PI * 2;
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
  ctx.fillStyle = isDark ? "#f0f6fc" : "#24292f";
  ctx.textAlign = "center";
  ctx.fillText("End Balance", centerX, centerY - 4);
  ctx.font = "12px Arial";
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText(money.format(total), centerX, centerY + 16);
  ctx.textAlign = "left";
  ctx.font = "12px Arial";
  const legendX = width / 2 - 130;
  const legendY = 218;
  ctx.fillStyle = isDark ? "#2f81f7" : "#0969da";
  ctx.fillRect(legendX, legendY, 10, 10);
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText("Initial", legendX + 16, legendY + 10);
  ctx.fillStyle = isDark ? "#3fb950" : "#2da44e";
  ctx.fillRect(legendX + 85, legendY, 10, 10);
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText("Contributions", legendX + 101, legendY + 10);
  ctx.fillStyle = isDark ? "#f85149" : "#cf222e";
  ctx.fillRect(legendX + 205, legendY, 10, 10);
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText("Interest", legendX + 221, legendY + 10);
}
function clearForm(){
  document.getElementById("initialDeposit").value = "";
  document.getElementById("annualContribution").value = "";
  document.getElementById("annualIncrease").value = "";
  document.getElementById("monthlyContribution").value = "";
  document.getElementById("monthlyIncrease").value = "";
  document.getElementById("rate").value = "";
  document.getElementById("frequency").value = "12";
  document.getElementById("years").value = "";
  document.getElementById("taxRate").value = "";
  document.getElementById("resultBox").style.display = "none";
  const tableBody = document.getElementById("tableBody");
  if(tableBody) tableBody.innerHTML = "";
  const growthCanvas = document.getElementById("growthChart");
  if(growthCanvas){
    const growthCtx = growthCanvas.getContext("2d");
    growthCtx.clearRect(0, 0, growthCanvas.width, growthCanvas.height);
  }
  const breakdownCanvas = document.getElementById("breakdownChart");
  if(breakdownCanvas){
    const breakdownCtx = breakdownCanvas.getContext("2d");
    breakdownCtx.clearRect(0, 0, breakdownCanvas.width, breakdownCanvas.height);
  }
}
document.querySelectorAll(".faq-question").forEach(button => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const isActive = item.classList.contains("active");
    document.querySelectorAll(".faq-item").forEach(faq => {
      faq.classList.remove("active");
      faq
        .querySelector(".faq-question")
        .setAttribute("aria-expanded", "false");
    });
    if(!isActive){
      item.classList.add("active");
      button.setAttribute("aria-expanded", "true");
    }
  });
});
window.addEventListener("resize", () => {
  calculate();
});
calculate();

Esse código remove a linha vertical do gráfico e mantém os resultados funcionando.
