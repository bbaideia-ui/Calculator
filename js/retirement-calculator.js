
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle.addEventListener("click", () => {
  mainNav.classList.toggle("open");
});

function calculate(){

  const currentAge = Number(document.getElementById("currentAge").value);
  const retirementAge = Number(document.getElementById("retirementAge").value);
  const lifeExpectancy = Number(document.getElementById("lifeExpectancy").value);

  const currentIncome = Number(document.getElementById("currentIncome").value);
  const incomeIncrease = Number(document.getElementById("incomeIncrease").value) / 100;

  const incomeNeeded = Number(document.getElementById("incomeNeeded").value) / 100;

  const investmentReturn = Number(document.getElementById("investmentReturn").value) / 100;
  const inflationRate = Number(document.getElementById("inflationRate").value) / 100;

  const otherIncome = Number(document.getElementById("otherIncome").value);

  const currentSavings = Number(document.getElementById("currentSavings").value);
  const futureSavings = Number(document.getElementById("futureSavings").value) / 100;

  if(
    currentAge < 0 ||
    retirementAge <= currentAge ||
    lifeExpectancy <= retirementAge ||
    currentIncome < 0 ||
    currentSavings < 0
  ){
    alert("Please enter valid numbers.");
    return;
  }

  const yearsToRetirement = retirementAge - currentAge;
  const retirementYears = lifeExpectancy - retirementAge;

  const incomeAtRetirement =
    currentIncome * Math.pow(1 + incomeIncrease, yearsToRetirement);

  const annualIncomeNeeded = incomeAtRetirement * incomeNeeded;

  const otherAnnualIncome = otherIncome * 12;

  const netAnnualNeed =
    Math.max(0, annualIncomeNeeded - otherAnnualIncome);

  const realReturn =
    ((1 + investmentReturn) / (1 + inflationRate)) - 1;

  let amountNeeded;

  if(realReturn === 0){
    amountNeeded = netAnnualNeed * retirementYears;
  }else{
    amountNeeded =
      netAnnualNeed *
      (1 - Math.pow(1 + realReturn, -retirementYears)) /
      realReturn;
  }

  let projectedSavings = currentSavings;
  let income = currentIncome;

  const yearlyData = [];

  for(let year = 1; year <= yearsToRetirement; year++){

    const contribution = income * futureSavings;

    projectedSavings =
      projectedSavings * (1 + investmentReturn) + contribution;

    yearlyData.push({
      year,
      age: currentAge + year,
      contribution,
      savings: projectedSavings
    });

    income *= (1 + incomeIncrease);
  }

  const gap = projectedSavings - amountNeeded;

  document.getElementById("amountNeeded").textContent =
    money.format(amountNeeded);

  document.getElementById("projectedSavings").textContent =
    money.format(projectedSavings);

  document.getElementById("retirementGap").textContent =
    money.format(gap);

  document.getElementById("annualNeed").textContent =
    money.format(netAnnualNeed);

  document.getElementById("resultBox").style.display = "block";

  fillTable(yearlyData);

  drawRetirementChart(yearlyData, amountNeeded);

  drawGapChart(projectedSavings, amountNeeded);
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
      <td>${money.format(row.savings)}</td>
    `;

    tableBody.appendChild(tr);
  });
}

function drawRetirementChart(data, target){

  const canvas = document.getElementById("retirementChart");

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

  const maxValue = Math.max(
    target,
    ...data.map(item => item.savings)
  );

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

      const x =
        padding +
        (index / (values.length - 1 || 1)) * chartWidth;

      const y =
        height -
        padding -
        (value / maxValue) * chartHeight;

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
    data.map(row => row.savings),
    isDark ? "#2f81f7" : "#0969da"
  );

  drawLine(
    data.map(() => target),
    isDark ? "#3fb950" : "#2da44e"
  );

  ctx.font = "12px Arial";

  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";

  ctx.fillText("Year 1", padding, height - 8);

  ctx.fillText(
    "Year " + data[data.length - 1].year,
    width - padding - 60,
    height - 8
  );

  const legends = [
    {
      label:"Projected",
      color:isDark ? "#2f81f7" : "#0969da"
    },
    {
      label:"Target",
      color:isDark ? "#3fb950" : "#2da44e"
    }
  ];

  legends.forEach((item, index) => {

    const x = padding + index * 115;

    ctx.fillStyle = item.color;

    ctx.fillRect(x, 20, 10, 10);

    ctx.fillStyle = isDark ? "#8b949e" : "#57606a";

    ctx.fillText(item.label, x + 16, 30);
  });
}

function drawGapChart(projected, target){

  const canvas = document.getElementById("gapChart");

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

  const gap = Math.max(0, target - projected);

  const surplus = Math.max(0, projected - target);

  const total = projected + gap + surplus;

  if(total <= 0) return;

  const centerX = width / 2;

  const centerY = 112;

  const radius = 70;

  const lineWidth = 22;

  let startAngle = -Math.PI / 2;

  const parts = [
    {
      label:"Projected",
      value:projected,
      color:isDark ? "#2f81f7" : "#0969da"
    },
    {
      label:gap > 0 ? "Gap" : "Surplus",
      value:gap > 0 ? gap : surplus,
      color:
        gap > 0
          ? (isDark ? "#f85149" : "#cf222e")
          : (isDark ? "#3fb950" : "#2da44e")
    }
  ];

  ctx.lineWidth = lineWidth;

  ctx.lineCap = "round";

  parts.forEach(part => {

    if(part.value <= 0) return;

    const angle =
      (part.value / total) * Math.PI * 2;

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

  ctx.fillText(
    gap > 0 ? "Gap" : "Surplus",
    centerX,
    centerY - 4
  );

  ctx.font = "12px Arial";

  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";

  ctx.fillText(
    money.format(gap > 0 ? gap : surplus),
    centerX,
    centerY + 16
  );

  ctx.textAlign = "left";

  ctx.font = "12px Arial";

  const legendX = width / 2 - 115;

  const legendY = 218;

  parts.forEach((part, index) => {

    const x = legendX + index * 120;

    ctx.fillStyle = part.color;

    ctx.fillRect(x, legendY, 10, 10);

    ctx.fillStyle = isDark ? "#8b949e" : "#57606a";

    ctx.fillText(part.label, x + 16, legendY + 10);
  });
}

function clearForm(){

  document.getElementById("currentAge").value = "";

  document.getElementById("retirementAge").value = "";

  document.getElementById("lifeExpectancy").value = "";

  document.getElementById("currentIncome").value = "";

  document.getElementById("incomeIncrease").value = "";

  document.getElementById("incomeNeeded").value = "";

  document.getElementById("investmentReturn").value = "";

  document.getElementById("inflationRate").value = "";

  document.getElementById("otherIncome").value = "";

  document.getElementById("currentSavings").value = "";

  document.getElementById("futureSavings").value = "";

  document.getElementById("resultBox").style.display = "none";

  document.getElementById("tableBody").innerHTML = "";

  const retirementCanvas =
    document.getElementById("retirementChart");

  const retirementCtx =
    retirementCanvas.getContext("2d");

  retirementCtx.clearRect(
    0,
    0,
    retirementCanvas.width,
    retirementCanvas.height
  );

  const gapCanvas =
    document.getElementById("gapChart");

  const gapCtx =
    gapCanvas.getContext("2d");

  gapCtx.clearRect(
    0,
    0,
    gapCanvas.width,
    gapCanvas.height
  );
}

document.querySelectorAll(".faq-question").forEach(button => {

  button.addEventListener("click", () => {

    const item = button.closest(".faq-item");

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

      button.setAttribute("aria-expanded", "true");
    }
  });
});

window.addEventListener("resize", calculate);

calculate();
