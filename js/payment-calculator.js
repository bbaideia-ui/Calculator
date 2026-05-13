
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

  const loanAmount =
    Number(document.getElementById("loanAmount").value);

  const years =
    Number(document.getElementById("years").value);

  const annualRate =
    Number(document.getElementById("rate").value) / 100;

  if(
    loanAmount <= 0 ||
    years <= 0 ||
    annualRate < 0
  ){
    alert("Please enter valid numbers.");
    return;
  }

  const monthlyRate = annualRate / 12;
  const totalPaymentsCount = years * 12;

  let monthlyPayment = 0;

  if(monthlyRate === 0){

    monthlyPayment =
      loanAmount / totalPaymentsCount;

  }else{

    monthlyPayment =
      (
        loanAmount *
        monthlyRate *
        Math.pow(1 + monthlyRate, totalPaymentsCount)
      ) /
      (
        Math.pow(1 + monthlyRate, totalPaymentsCount) - 1
      );
  }

  const totalPayments =
    monthlyPayment * totalPaymentsCount;

  const totalInterest =
    totalPayments - loanAmount;

  document.getElementById("monthlyPayment").textContent =
    money.format(monthlyPayment);

  document.getElementById("totalPayments").textContent =
    money.format(totalPayments);

  document.getElementById("totalInterest").textContent =
    money.format(totalInterest);

  document.getElementById("resultBox").style.display = "block";

  const yearlyData = [];

  let balance = loanAmount;

  for(let year = 1; year <= years; year++){

    let yearlyInterest = 0;
    let yearlyPrincipal = 0;

    for(let month = 1; month <= 12; month++){

      const interestPayment =
        balance * monthlyRate;

      const principalPayment =
        monthlyPayment - interestPayment;

      yearlyInterest += interestPayment;
      yearlyPrincipal += principalPayment;

      balance -= principalPayment;

      if(balance < 0){
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

  drawBreakdownChart(
    loanAmount,
    totalInterest,
    totalPayments
  );

  drawAmortizationChart(
    yearlyData,
    loanAmount
  );
}

function fillTable(data){

  const tableBody =
    document.getElementById("tableBody");

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

function drawBreakdownChart(
  principal,
  interest,
  totalPayments
){

  const canvas =
    document.getElementById("breakdownChart");

  const { ctx, width, height } =
    setupCanvas(canvas, 260);

  ctx.clearRect(0, 0, width, height);

  const total =
    principal + interest;

  const isDark =
    document.documentElement.classList.contains("dark");

  const centerX = width / 2;
  const centerY = 105;

  const radius = 62;
  const lineWidth = 26;

  const parts = [
    {
      label:"Principal",
      value:principal,
      color:isDark ? "#2f81f7" : "#0969da"
    },
    {
      label:"Interest",
      value:interest,
      color:isDark ? "#f85149" : "#cf222e"
    }
  ];

  let startAngle = -Math.PI / 2;

  ctx.lineWidth = lineWidth;
  ctx.lineCap = "butt";

  parts.forEach(part => {

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

  ctx.font = "700 13px Arial";

  ctx.fillStyle =
    isDark ? "#f0f6fc" : "#24292f";

  ctx.textAlign = "center";

  ctx.fillText(
    "Total Paid",
    centerX,
    centerY - 4
  );

  ctx.font = "12px Arial";

  ctx.fillStyle =
    isDark ? "#8b949e" : "#57606a";

  ctx.fillText(
    money.format(totalPayments),
    centerX,
    centerY + 15
  );

  ctx.textAlign = "left";

  const legendY = 220;

  const legendX =
    Math.max(24, width / 2 - 80);

  parts.forEach((part, index) => {

    const x = legendX + (index * 120);

    ctx.fillStyle = part.color;

    ctx.fillRect(
      x,
      legendY,
      10,
      10
    );

    ctx.fillStyle =
      isDark ? "#8b949e" : "#57606a";

    ctx.fillText(
      part.label,
      x + 16,
      legendY + 10
    );
  });
}

function drawAmortizationChart(
  data,
  originalLoan
){

  const canvas =
    document.getElementById("amortizationChart");

  const { ctx, width, height } =
    setupCanvas(canvas, 260);

  ctx.clearRect(0, 0, width, height);

  const padding = 36;

  const chartWidth =
    width - padding * 2;

  const chartHeight =
    height - padding * 2;

  const isDark =
    document.documentElement.classList.contains("dark");

  const maxValue =
    originalLoan;

  const baseY =
    height - padding;

  data.forEach((row, index) => {

    const x =
      padding +
      (index / (data.length - 1 || 1)) * chartWidth;

    const balanceHeight =
      (row.balance / maxValue) * chartHeight;

    const barWidth =
      Math.max(
        12,
        Math.min(
          28,
          chartWidth / data.length * 0.45
        )
      );

    ctx.fillStyle =
      isDark ? "#2f81f7" : "#0969da";

    ctx.fillRect(
      x - barWidth / 2,
      baseY - balanceHeight,
      barWidth,
      balanceHeight
    );
  });

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
}

function clearForm(){

  document.getElementById("loanAmount").value = "";
  document.getElementById("years").value = "";
  document.getElementById("rate").value = "";

  document.getElementById("resultBox").style.display = "none";

  document.getElementById("tableBody").innerHTML = "";

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

  const amortizationCanvas =
    document.getElementById("amortizationChart");

  const amortizationCtx =
    amortizationCanvas.getContext("2d");

  amortizationCtx.clearRect(
    0,
    0,
    amortizationCanvas.width,
    amortizationCanvas.height
  );
}

document
  .querySelectorAll(".faq-question")
  .forEach(button => {

    button.addEventListener("click", () => {

      const item =
        button.closest(".faq-item");

      const isActive =
        item.classList.contains("active");

      document
        .querySelectorAll(".faq-item")
        .forEach(faq => {

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
