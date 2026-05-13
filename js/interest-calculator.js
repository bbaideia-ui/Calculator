



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
  document.getElementById("interestRate").value = value;
}
function setAnnualContribution(value){
  document.getElementById("annualContribution").value = value;
}
function setMonthlyContribution(value){
  document.getElementById("monthlyContribution").value = value;
}
function calculate(){
  const initialInvestment = Number(document.getElementById("initialInvestment").value);
  const annualContributionInput = Number(document.getElementById("annualContribution").value);
  const monthlyContributionInput = Number(document.getElementById("monthlyContribution").value);
  const annualRate = Number(document.getElementById("interestRate").value) / 100;
  const frequency = Number(document.getElementById("compoundFrequency").value);
  const years = Number(document.getElementById("years").value);
  const months = Number(document.getElementById("months").value);
  const taxRate = Number(document.getElementById("taxRate").value) / 100;
  const inflationRate = Number(document.getElementById("inflationRate").value) / 100;
  const timingElement = document.getElementById("contributeTiming");
  const contributionTiming = timingElement ? timingElement.value : "end";
  if(
    initialInvestment < 0 ||
    annualContributionInput < 0 ||
    monthlyContributionInput < 0 ||
    annualRate < 0 ||
    frequency <= 0 ||
    years < 0 ||
    months < 0 ||
    taxRate < 0 ||
    inflationRate < 0
  ){
    alert("Please enter valid numbers.");
    return;
  }
  const totalMonths = years * 12 + months;
  if(totalMonths <= 0){
    alert("Please enter a valid time period.");
    return;
  }
  let balance = initialInvestment;
  let totalContributions = 0;
  let totalInterest = 0;
  const monthlyRate = Math.pow(1 + annualRate / frequency, frequency / 12) - 1;
  const yearlyData = [];
  for(let month = 1; month <= totalMonths; month++){
    const yearNumber = Math.ceil(month / 12);
    const yearIndex = yearNumber - 1;
    if(!yearlyData[yearIndex]){
      yearlyData[yearIndex] = {
        year: yearNumber,
        deposit: 0,
        interest: 0,
        balance: balance,
        totalContributions: totalContributions
      };
    }
    if(contributionTiming === "beginning"){
      balance += monthlyContributionInput;
      totalContributions += monthlyContributionInput;
      yearlyData[yearIndex].deposit += monthlyContributionInput;
    }
    const interestBeforeTax = balance * monthlyRate;
    const interestAfterTax = interestBeforeTax * (1 - taxRate);
    balance += interestAfterTax;
    totalInterest += interestAfterTax;
    yearlyData[yearIndex].interest += interestAfterTax;
    if(contributionTiming === "end"){
      balance += monthlyContributionInput;
      totalContributions += monthlyContributionInput;
      yearlyData[yearIndex].deposit += monthlyContributionInput;
    }
    if(month % 12 === 0){
      balance += annualContributionInput;
      totalContributions += annualContributionInput;
      yearlyData[yearIndex].deposit += annualContributionInput;
    }
    yearlyData[yearIndex].balance = balance;
    yearlyData[yearIndex].totalContributions = totalContributions;
  }
  const endingBalance = balance;
  const totalPrincipal = initialInvestment;
  const totalYears = totalMonths / 12;
  const inflationAdjusted = endingBalance / Math.pow(1 + inflationRate, totalYears);
  const initialOnlyBalance = initialInvestment * Math.pow(1 + annualRate, totalYears);
  const initialInterest = Math.max(0, initialOnlyBalance - initialInvestment);
  const contributionInterest = Math.max(0, totalInterest - initialInterest);
  document.getElementById("endingBalance").textContent = money.format(endingBalance);
  document.getElementById("totalPrincipal").textContent = money.format(totalPrincipal);
  document.getElementById("totalContributions").textContent = money.format(totalContributions);
  document.getElementById("totalInterest").textContent = money.format(totalInterest);
  document.getElementById("initialInterest").textContent = money.format(initialInterest);
  document.getElementById("contributionInterest").textContent = money.format(contributionInterest);
  document.getElementById("inflationAdjusted").textContent = money.format(inflationAdjusted);
  document.getElementById("resultBox").style.display = "block";
  fillTable(yearlyData);
  drawGrowthChart(yearlyData, initialInvestment);
  drawBreakdownChart(initialInvestment, totalContributions, totalInterest, endingBalance);
}
function fillTable(data){
  const tableBody = document.getElementById("tableBody");
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
function setupCanvas(canvas, height = 260){
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || 560;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height };
}
function setupSquareCanvas(canvas){
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const parentWidth = canvas.parentElement.clientWidth || 560;
  const size = Math.min(parentWidth, 260);
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + "px";
  canvas.style.height = size + "px";
  canvas.style.margin = "0 auto";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width: size, height: size };
}
function drawGrowthChart(data, initialInvestment){
  const canvas = document.getElementById("growthChart");
  const { ctx, width, height } = setupCanvas(canvas, 260);
  ctx.clearRect(0, 0, width, height);
  if(!data.length) return;
  const padding = 36;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const isDark = document.documentElement.classList.contains("dark");
  const maxValue = Math.max(...data.map(row => row.balance), 1);
  data.forEach((row, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
    const baseY = height - padding;
    const totalDeposits = row.totalContributions;
    const interestOnly = Math.max(0, row.balance - initialInvestment - totalDeposits);
    const initialHeight = (initialInvestment / maxValue) * chartHeight;
    const contributionHeight = (totalDeposits / maxValue) * chartHeight;
    const interestHeight = (interestOnly / maxValue) * chartHeight;
    const barWidth = Math.max(12, Math.min(28, chartWidth / data.length * 0.45));
    ctx.fillStyle = isDark ? "#2f81f7" : "#0969da";
    ctx.fillRect(x - barWidth / 2, baseY - initialHeight, barWidth, initialHeight);
    ctx.fillStyle = isDark ? "#3fb950" : "#2da44e";
    ctx.fillRect(x - barWidth / 2, baseY - initialHeight - contributionHeight, barWidth, contributionHeight);
    ctx.fillStyle = isDark ? "#f85149" : "#cf222e";
    ctx.fillRect(x - barWidth / 2, baseY - initialHeight - contributionHeight - interestHeight, barWidth, interestHeight);
  });
  ctx.font = "12px Arial";
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText("Year 1", padding, height - 8);
  ctx.fillText("Year " + data[data.length - 1].year, width - padding - 60, height - 8);
}
function drawBreakdownChart(principal, contributions, interest, endingBalance){
  const canvas = document.getElementById("breakdownChart");
  const { ctx, width, height } = setupSquareCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const total = principal + contributions + interest;
  if(total <= 0) return;
  const isDark = document.documentElement.classList.contains("dark");
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.31;
  const lineWidth = Math.min(width, height) * 0.12;
  const parts = [
    { value: principal, color: isDark ? "#2f81f7" : "#0969da" },
    { value: contributions, color: isDark ? "#3fb950" : "#2da44e" },
    { value: interest, color: isDark ? "#f85149" : "#cf222e" }
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
  ctx.fillText("End Balance", centerX, centerY - 4);
  ctx.font = "12px Arial";
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText(money.format(endingBalance), centerX, centerY + 15);
}
function clearForm(){
  document.getElementById("initialInvestment").value = "";
  document.getElementById("annualContribution").value = "";
  document.getElementById("monthlyContribution").value = "";
  document.getElementById("interestRate").value = "";
  document.getElementById("compoundFrequency").value = "1";
  document.getElementById("years").value = "";
  document.getElementById("months").value = "";
  document.getElementById("taxRate").value = "";
  document.getElementById("inflationRate").value = "";
  document.getElementById("resultBox").style.display = "none";
  document.getElementById("tableBody").innerHTML = "";
  const growthCanvas = document.getElementById("growthChart");
  const growthCtx = growthCanvas.getContext("2d");
  growthCtx.clearRect(0, 0, growthCanvas.width, growthCanvas.height);
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
