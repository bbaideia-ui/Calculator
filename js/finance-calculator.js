
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle.addEventListener("click", () => {
  mainNav.classList.toggle("open");
});

const calculateFor = document.getElementById("calculateFor");
const tabButtons = document.querySelectorAll(".tab-btn");

tabButtons.forEach(button => {
  button.addEventListener("click", () => {
    const target = button.getAttribute("data-target");
    calculateFor.value = target;
    updateTabs();
    calculate();
  });
});

calculateFor.addEventListener("change", () => {
  updateTabs();
  calculate();
});

function updateTabs(){
  const selected = calculateFor.value;

  tabButtons.forEach(button => {
    button.classList.toggle(
      "active",
      button.getAttribute("data-target") === selected
    );
  });

  document.querySelectorAll(".input-row").forEach(row => {
    row.style.display = "grid";
  });

  if(selected === "fv"){
    document.getElementById("rowFV").style.display = "none";
  }

  if(selected === "pmt"){
    document.getElementById("rowPMT").style.display = "none";
  }

  if(selected === "rate"){
    document.getElementById("rowRate").style.display = "none";
  }

  if(selected === "periods"){
    document.getElementById("rowPeriods").style.display = "none";
  }

  if(selected === "pv"){
    document.getElementById("rowPV").style.display = "none";
  }
}

function calculate(){
  const selected = calculateFor.value;

  let n = Number(document.getElementById("periods").value);
  let annualRate = Number(document.getElementById("rate").value) / 100;
  let pv = Number(document.getElementById("presentValue").value);
  let pmt = Number(document.getElementById("payment").value);
  let fv = Number(document.getElementById("futureValue").value);
  const frequency = Number(document.getElementById("compoundFrequency").value);
  const timing = document.getElementById("paymentTiming").value;

  if(frequency <= 0){
    alert("Please enter valid numbers.");
    return;
  }

  let r = annualRate / frequency;
  const type = timing === "beginning" ? 1 : 0;

  if(selected === "fv"){
    if(n <= 0){
      alert("Please enter valid numbers.");
      return;
    }

    fv = calculateFV(pv, pmt, r, n, type);
    document.getElementById("futureValue").value = roundValue(fv);
    showResults("Future Value", fv, pv, pmt, r, n, type);
  }

  if(selected === "pv"){
    if(n <= 0){
      alert("Please enter valid numbers.");
      return;
    }

    pv = calculatePV(fv, pmt, r, n, type);
    document.getElementById("presentValue").value = roundValue(pv);
    showResults("Present Value", pv, pv, pmt, r, n, type);
  }

  if(selected === "pmt"){
    if(n <= 0){
      alert("Please enter valid numbers.");
      return;
    }

    pmt = calculatePMT(pv, fv, r, n, type);
    document.getElementById("payment").value = roundValue(pmt);
    showResults("Payment", pmt, pv, pmt, r, n, type);
  }

  if(selected === "rate"){
    if(n <= 0){
      alert("Please enter valid numbers.");
      return;
    }

    r = calculateRate(pv, pmt, fv, n, type);
    annualRate = r * frequency;
    document.getElementById("rate").value = roundValue(annualRate * 100);
    showResults("Interest Rate", annualRate, pv, pmt, r, n, type);
  }

  if(selected === "periods"){
    n = calculatePeriods(pv, pmt, fv, r, type);
    document.getElementById("periods").value = roundValue(n);
    showResults("Number of Periods", n, pv, pmt, r, n, type);
  }
}

function calculateFV(pv, pmt, r, n, type){
  if(r === 0){
    return -(pv + pmt * n);
  }

  return -(pv * Math.pow(1 + r, n) + pmt * (1 + r * type) * ((Math.pow(1 + r, n) - 1) / r));
}

function calculatePV(fv, pmt, r, n, type){
  if(r === 0){
    return -(fv + pmt * n);
  }

  return -(fv + pmt * (1 + r * type) * ((Math.pow(1 + r, n) - 1) / r)) / Math.pow(1 + r, n);
}

function calculatePMT(pv, fv, r, n, type){
  if(r === 0){
    return -(fv + pv) / n;
  }

  return -(fv + pv * Math.pow(1 + r, n)) / ((1 + r * type) * ((Math.pow(1 + r, n) - 1) / r));
}

function calculateRate(pv, pmt, fv, n, type){
  let low = -0.9999;
  let high = 1;
  let mid = 0;

  for(let i = 0; i < 100; i++){
    mid = (low + high) / 2;

    const testFV = calculateFV(pv, pmt, mid, n, type);

    if(testFV > fv){
      high = mid;
    }else{
      low = mid;
    }
  }

  return mid;
}

function calculatePeriods(pv, pmt, fv, r, type){
  let balance = pv;

  for(let period = 1; period <= 1000; period++){
    if(type === 1){
      balance += pmt;
    }

    balance *= (1 + r);

    if(type === 0){
      balance += pmt;
    }

    if(Math.abs(balance + fv) < 1 || balance <= -fv){
      return period;
    }
  }

  return 1000;
}

function showResults(label, primaryValue, pv, pmt, r, n, type){
  const schedule = buildSchedule(pv, pmt, r, n, type);
  const totalPayments = pmt * n;
  const ending = schedule.length ? schedule[schedule.length - 1].fv : 0;
  const totalInterest = ending - pv - totalPayments;

  document.getElementById("primaryResultLabel").textContent = label;

  if(label === "Interest Rate"){
    document.getElementById("primaryResult").textContent = percent.format(primaryValue);
  }else if(label === "Number of Periods"){
    document.getElementById("primaryResult").textContent = roundValue(primaryValue);
  }else{
    document.getElementById("primaryResult").textContent = money.format(primaryValue);
  }

  document.getElementById("pvResult").textContent = money.format(pv);
  document.getElementById("totalPayments").textContent = money.format(totalPayments);
  document.getElementById("totalInterest").textContent = money.format(totalInterest);
  document.getElementById("resultBox").style.display = "block";

  fillTable(schedule);
  drawFinanceChart(schedule);
}

function buildSchedule(pv, pmt, r, n, type){
  const data = [];
  let balance = pv;

  for(let period = 1; period <= Math.ceil(n); period++){
    const startingPV = balance;

    if(type === 1){
      balance += pmt;
    }

    const interest = balance * r;
    balance += interest;

    if(type === 0){
      balance += pmt;
    }

    data.push({
      period,
      pv: startingPV,
      pmt,
      interest,
      fv: balance
    });
  }

  return data;
}

function fillTable(data){
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  data.forEach(row => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${row.period}</td>
      <td>${money.format(row.pv)}</td>
      <td>${money.format(row.pmt)}</td>
      <td>${money.format(row.interest)}</td>
      <td>${money.format(row.fv)}</td>
    `;

    tableBody.appendChild(tr);
  });
}

function drawFinanceChart(data){
  const canvas = document.getElementById("financeChart");
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = 260 * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const width = rect.width;
  const height = 260;

  ctx.clearRect(0, 0, width, height);

  if(!data.length){
    return;
  }

  const padding = 38;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const isDark = document.documentElement.classList.contains("dark");

  const values = data.flatMap(row => [
    row.pv,
    row.pmt,
    row.interest,
    row.fv
  ]);

  const maxValue = Math.max(...values.map(value => Math.abs(value)), 1);

  ctx.strokeStyle = isDark ? "#30363d" : "#d0d7de";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  function yPoint(value){
    return height - padding - ((value + maxValue) / (maxValue * 2)) * chartHeight;
  }

  function xPoint(index){
    return padding + (index / (data.length - 1 || 1)) * chartWidth;
  }

  function drawLine(values, color){
    ctx.beginPath();

    values.forEach((value, index) => {
      const x = xPoint(index);
      const y = yPoint(value);

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

  drawLine(data.map(row => row.pv), isDark ? "#2f81f7" : "#0969da");
  drawLine(data.map(row => row.fv), isDark ? "#3fb950" : "#2da44e");
  drawLine(data.map(row => row.pmt), isDark ? "#f85149" : "#cf222e");
  drawLine(data.map(row => row.interest), isDark ? "#a371f7" : "#8250df");

  ctx.font = "12px Arial";
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText("Period 1", padding, height - 8);
  ctx.fillText("Period " + data[data.length - 1].period, width - padding - 70, height - 8);

  const legends = [
    {label:"PV", color:isDark ? "#2f81f7" : "#0969da"},
    {label:"FV", color:isDark ? "#3fb950" : "#2da44e"},
    {label:"PMT", color:isDark ? "#f85149" : "#cf222e"},
    {label:"Interest", color:isDark ? "#a371f7" : "#8250df"}
  ];

  legends.forEach((item, index) => {
    const x = padding + index * 90;

    ctx.fillStyle = item.color;
    ctx.fillRect(x, 18, 10, 10);

    ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
    ctx.fillText(item.label, x + 16, 28);
  });
}

function clearForm(){
  document.getElementById("periods").value = "";
  document.getElementById("rate").value = "";
  document.getElementById("presentValue").value = "";
  document.getElementById("payment").value = "";
  document.getElementById("futureValue").value = "";
  document.getElementById("compoundFrequency").value = "1";
  document.getElementById("paymentTiming").value = "end";
  document.getElementById("resultBox").style.display = "none";
  document.getElementById("tableBody").innerHTML = "";

  const canvas = document.getElementById("financeChart");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function roundValue(value){
  return Math.round(value * 100) / 100;
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

updateTabs();
calculate();
