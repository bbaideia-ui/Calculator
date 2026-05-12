
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

function calculate(){
  const currentAge = Number(document.getElementById("currentAge").value);
  const retirementAge = Number(document.getElementById("retirementAge").value);
  const goalAmount = Number(document.getElementById("goalAmount").value);
  const currentSavings = Number(document.getElementById("currentSavings").value);
  const annualRate = Number(document.getElementById("rate").value) / 100;

  if(currentAge < 0 || retirementAge <= currentAge || goalAmount <= 0 || currentSavings < 0 || annualRate < 0){
    alert("Please enter valid numbers.");
    return;
  }

  const years = retirementAge - currentAge;
  const months = years * 12;
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;

  const futureCurrentSavings = currentSavings * Math.pow(1 + annualRate, years);
  const remainingGoal = Math.max(0, goalAmount - futureCurrentSavings);

  let monthlyNeeded;

  if(remainingGoal <= 0){
    monthlyNeeded = 0;
  }else if(monthlyRate === 0){
    monthlyNeeded = remainingGoal / months;
  }else{
    monthlyNeeded = remainingGoal * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
  }

  document.getElementById("monthlyNeeded").textContent = money.format(monthlyNeeded);
  document.getElementById("yearsToSave").textContent = years + " years";
  document.getElementById("futureCurrent").textContent = money.format(futureCurrentSavings);
  document.getElementById("remainingGoal").textContent = money.format(remainingGoal);
  document.getElementById("resultBox").style.display = "block";

  const yearlyData = [];
  let balance = currentSavings;
  let annualContribution = monthlyNeeded * 12;

  for(let year = 1; year <= years; year++){
    for(let month = 1; month <= 12; month++){
      balance = balance * (1 + monthlyRate) + monthlyNeeded;
    }

    yearlyData.push({
      year,
      age: currentAge + year,
      contribution: annualContribution,
      balance
    });
  }

  fillTable(yearlyData);
  drawGrowthChart(yearlyData, goalAmount);
  drawBreakdownChart(futureCurrentSavings, Math.max(0, goalAmount - futureCurrentSavings));
}

function fillTable(data){
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.year}</td>
      <td>${row.age}</td>
      <td>${money.format(row.contribution)}</td>
      <td>${money.format(row.balance)}</td>
    `;
    tableBody.appendChild(tr);
  });
}

function drawGrowthChart(data, goalAmount){
  const canvas = document.getElementById("growthChart");
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
  const maxValue = Math.max(goalAmount, ...data.map(item => item.balance));

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
    const y = height - padding - (item.balance / maxValue) * chartHeight;

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
    const y = height - padding - (item.balance / maxValue) * chartHeight;

    if(index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.strokeStyle = isDark ? "#2f81f7" : "#0969da";
  ctx.lineWidth = 3;
  ctx.stroke();

  const goalY = height - padding - (goalAmount / maxValue) * chartHeight;
  ctx.beginPath();
  ctx.setLineDash([6,6]);
  ctx.moveTo(padding, goalY);
  ctx.lineTo(width - padding, goalY);
  ctx.strokeStyle = isDark ? "#3fb950" : "#2da44e";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = "12px Arial";
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText("Year 1", padding, height - 8);
  ctx.fillText("Year " + data[data.length - 1].year, width - padding - 60, height - 8);
}

function drawBreakdownChart(currentGrowth, newSavings){
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

  const total = currentGrowth + newSavings;
  if(total <= 0) return;

  const centerX = width / 2;
  const centerY = 112;
  const radius = 70;
  const lineWidth = 22;
  const currentAngle = (currentGrowth / total) * Math.PI * 2;

  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.strokeStyle = isDark ? "#2f81f7" : "#0969da";
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + currentAngle);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = isDark ? "#3fb950" : "#2da44e";
  ctx.arc(centerX, centerY, radius, -Math.PI / 2 + currentAngle, Math.PI * 1.5);
  ctx.stroke();

  ctx.font = "700 14px Arial";
  ctx.fillStyle = isDark ? "#f0f6fc" : "#24292f";
  ctx.textAlign = "center";
  ctx.fillText("Retirement Goal", centerX, centerY - 4);

  ctx.font = "12px Arial";
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText(money.format(total), centerX, centerY + 16);

  ctx.textAlign = "left";
  ctx.font = "12px Arial";

  const legendX = width / 2 - 125;
  const legendY = 218;

  ctx.fillStyle = isDark ? "#2f81f7" : "#0969da";
  ctx.fillRect(legendX, legendY, 10, 10);
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText("Current Savings", legendX + 16, legendY + 10);

  ctx.fillStyle = isDark ? "#3fb950" : "#2da44e";
  ctx.fillRect(legendX + 155, legendY, 10, 10);
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText("New Savings", legendX + 171, legendY + 10);
}

function clearForm(){
  document.getElementById("currentAge").value = "";
  document.getElementById("retirementAge").value = "";
  document.getElementById("goalAmount").value = "";
  document.getElementById("currentSavings").value = "";
  document.getElementById("rate").value = "";
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
