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

  const annualRate =
    Number(document.getElementById("rate").value) / 100;

  const compound =
    Number(document.getElementById("compound").value);

  const years =
    Number(document.getElementById("years").value);

  const months =
    Number(document.getElementById("months").value);

  const originationFeePercent =
    Number(document.getElementById("originationFee").value);

  const documentationFee =
    Number(document.getElementById("documentationFee").value);

  const otherFees =
    Number(document.getElementById("otherFees").value);

  if(
    loanAmount <= 0 ||
    annualRate < 0 ||
    years < 0 ||
    months < 0
  ){
    alert("Please enter valid numbers.");
    return;
  }

  const totalMonths =
    (years * 12) + months;

  if(totalMonths <= 0){
    alert("Please enter a valid loan term.");
    return;
  }

  const monthlyRate =
    annualRate / 12;

  const originationFee =
    loanAmount * (originationFeePercent / 100);

  const totalFees =
    originationFee +
    documentationFee +
    otherFees;

  let monthlyPayment = 0;

  if(monthlyRate === 0){

    monthlyPayment =
      loanAmount / totalMonths;

  }else{

    monthlyPayment =
      (
        loanAmount *
        monthlyRate *
        Math.pow(1 + monthlyRate, totalMonths)
      ) /
      (
        Math.pow(1 + monthlyRate, totalMonths) - 1
      );
  }

  const totalPayments =
    monthlyPayment * totalMonths;

  const totalInterest =
    totalPayments - loanAmount;

  const estimatedAPR =
    (
      (
        totalInterest + totalFees
      ) /
      loanAmount
    ) /
    (totalMonths / 12) * 100;

  document.getElementById("monthlyPayment").textContent =
    money.format(monthlyPayment);

  document.getElementById("totalPayments").textContent =
    money.format(totalPayments);

  document.getElementById("totalInterest").textContent =
    money.format(totalInterest);

  document.getElementById("totalFees").textContent =
    money.format(totalFees);

  document.getElementById("estimatedApr").textContent =
    estimatedAPR.toFixed(2) + "%";

  document.getElementById("resultBox").style.display =
    "block";

  const yearlyData = [];

  let balance = loanAmount;

  for(let year = 1; year <= years; year++){

    let yearlyInterest = 0;
    let yearlyPrincipal = 0;

    for(let month = 1; month <= 12; month++){

      if(balance <= 0) break;

      const interestPayment =
        balance * monthlyRate;

      let principalPayment =
        monthlyPayment - interestPayment;

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

  drawBreakdownChart(
    loanAmount,
    totalInterest,
    totalFees
  );

  drawBalanceChart(
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

  const dpr =
    window.devicePixelRatio || 1;

  const rect =
    canvas.getBoundingClientRect();

  const width =
    rect.width || 760;

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
  fees
){

  const canvas =
    document.getElementById("breakdownChart");

  const { ctx, width, height } =
    setupCanvas(canvas, 260);

  ctx.clearRect(0, 0, width, height);

  const total =
    principal + interest + fees;

  if(total <= 0) return;

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
      color:isDark ? "#3fb950" : "#2da44e"
    },
    {
      label:"Fees",
      value:fees,
      color:isDark ? "#f85149" : "#cf222e"
    }
  ];

  let startAngle = -Math.PI / 2;

  ctx.lineWidth = lineWidth;
  ctx.lineCap = "butt";

  parts.forEach(part => {

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

  ctx.font = "700 13px Arial";

  ctx.fillStyle =
    isDark ? "#f0f6fc" : "#24292f";

  ctx.textAlign = "center";

  ctx.fillText(
    "Total Cost",
    centerX,
    centerY - 4
  );

  ctx.font = "12px Arial";

  ctx.fillStyle =
    isDark ? "#8b949e" : "#57606a";

  ctx.fillText(
    money.format(total),
    centerX,
    centerY + 15
  );

  ctx.textAlign = "left";

  const legendY = 220;
  const legendX = width / 2 - 160;

  parts.forEach((part, index) => {

    const x =
      legendX + (index * 120);

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

function drawBalanceChart(
  data,
  originalLoan
){

  const canvas =
    document.getElementById("balanceChart");

  const { ctx, width, height } =
    setupCanvas(canvas, 260);

  ctx.clearRect(0, 0, width, height);

  if(!data.length) return;

  const padding = 36;

  const chartWidth =
    width - padding * 2;

  const chartHeight =
    height - padding * 2;

  const isDark =
    document.documentElement.classList.contains("dark");

  ctx.strokeStyle =
    isDark ? "#30363d" : "#d0d7de";

  ctx.lineWidth = 1;

  ctx.beginPath();

  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);

  ctx.stroke();

  ctx.beginPath();

  data.forEach((row, index) => {

    const x =
      padding +
      (index / (data.length - 1 || 1)) *
      chartWidth;

    const y =
      height - padding -
      (
        row.balance / originalLoan
      ) * chartHeight;

    if(index === 0){
      ctx.moveTo(x, y);
    }else{
      ctx.lineTo(x, y);
    }
  });

  ctx.strokeStyle =
    isDark ? "#2f81f7" : "#0969da";

  ctx.lineWidth = 3;

  ctx.stroke();

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
  document.getElementById("rate").value = "";
  document.getElementById("years").value = "";
  document.getElementById("months").value = "";
  document.getElementById("originationFee").value = "";
  document.getElementById("documentationFee").value = "";
  document.getElementById("otherFees").value = "";

  document.getElementById("resultBox").style.display =
    "none";

  document.getElementById("tableBody").innerHTML =
    "";

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
