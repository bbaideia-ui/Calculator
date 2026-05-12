
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

  const principal = Number(document.getElementById("principal").value);
  const annualRate = Number(document.getElementById("rate").value) / 100;
  const years = Number(document.getElementById("years").value);

  if(principal < 0 || annualRate < 0 || years <= 0){
    alert("Please enter valid numbers.");
    return;
  }

  const totalInterest = principal * annualRate * years;
  const finalAmount = principal + totalInterest;
  const annualInterest = principal * annualRate;

  document.getElementById("finalAmount").textContent = money.format(finalAmount);
  document.getElementById("totalInterest").textContent = money.format(totalInterest);
  document.getElementById("annualInterest").textContent = money.format(annualInterest);
  document.getElementById("resultBox").style.display = "block";

  const yearlyData = [];

  for(let year = 1; year <= years; year++){

    const interest = principal * annualRate * year;
    const balance = principal + interest;

    yearlyData.push({
      year,
      principal,
      interest,
      balance
    });
  }

  fillTable(yearlyData);
  drawGrowthChart(yearlyData);
  drawBreakdownChart(principal, totalInterest);
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

function drawGrowthChart(data){

  const canvas = document.getElementById("growthChart");
  const ctx = canvas.getContext("2d");

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  ctx.setTransform(1,0,0,1,0,0);

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
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  data.forEach((item, index) => {

    const x = padding + (index / (data.length - 1 || 1)) * chartWidth;

    const principalHeight = (item.principal / maxValue) * chartHeight;
    const interestHeight = (item.interest / maxValue) * chartHeight;

    const barWidth = Math.max(
      12,
      Math.min(28, chartWidth / data.length * 0.45)
    );

    const baseY = height - padding;

    ctx.fillStyle = isDark ? "#2f81f7" : "#0969da";

    ctx.fillRect(
      x - barWidth / 2,
      baseY - principalHeight,
      barWidth,
      principalHeight
    );

    ctx.fillStyle = isDark ? "#3fb950" : "#2da44e";

    ctx.fillRect(
      x - barWidth / 2,
      baseY - principalHeight - interestHeight,
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

function drawBreakdownChart(principal, interest){

  const canvas = document.getElementById("breakdownChart");
  const ctx = canvas.getContext("2d");

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  ctx.setTransform(1,0,0,1,0,0);

  canvas.width = rect.width * dpr;
  canvas.height = 260 * dpr;

  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = 260;

  const isDark = document.documentElement.classList.contains("dark");

  ctx.clearRect(0, 0, width, height);

  const total = principal + interest;

  if(total <= 0) return;

  const centerX = width / 2;
  const centerY = 116;

  const radius = 70;
  const lineWidth = 22;

  const principalAngle = (principal / total) * Math.PI * 2;

  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";

  ctx.beginPath();

  ctx.strokeStyle = isDark ? "#2f81f7" : "#0969da";

  ctx.arc(
    centerX,
    centerY,
    radius,
    -Math.PI / 2,
    -Math.PI / 2 + principalAngle
  );

  ctx.stroke();

  ctx.beginPath();

  ctx.strokeStyle = isDark ? "#3fb950" : "#2da44e";

  ctx.arc(
    centerX,
    centerY,
    radius,
    -Math.PI / 2 + principalAngle,
    Math.PI * 1.5
  );

  ctx.stroke();

  ctx.font = "700 14px Arial";
  ctx.fillStyle = isDark ? "#f0f6fc" : "#24292f";
  ctx.textAlign = "center";

  ctx.fillText("Final Amount", centerX, centerY - 4);

  ctx.font = "12px Arial";
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";

  ctx.fillText(money.format(total), centerX, centerY + 16);

  ctx.textAlign = "left";

  ctx.fillStyle = isDark ? "#2f81f7" : "#0969da";
  ctx.fillRect(width / 2 - 115, 218, 10, 10);

  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText("Principal", width / 2 - 98, 228);

  ctx.fillStyle = isDark ? "#3fb950" : "#2da44e";
  ctx.fillRect(width / 2 + 20, 218, 10, 10);

  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText("Interest", width / 2 + 37, 228);
}

function clearForm(){

  document.getElementById("principal").value = "";
  document.getElementById("rate").value = "";
  document.getElementById("years").value = "";

  document.getElementById("resultBox").style.display = "none";

  document.getElementById("tableBody").innerHTML = "";

  const growthCanvas = document.getElementById("growthChart");
  const growthCtx = growthCanvas.getContext("2d");

  growthCtx.clearRect(
    0,
    0,
    growthCanvas.width,
    growthCanvas.height
  );

  const breakdownCanvas = document.getElementById("breakdownChart");
  const breakdownCtx = breakdownCanvas.getContext("2d");

  breakdownCtx.clearRect(
    0,
    0,
    breakdownCanvas.width,
    breakdownCanvas.height
  );
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

window.addEventListener("resize", calculate);

calculate();
