
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

function calculate(){
  let debts = [];

  for(let i = 1; i <= 4; i++){
    const name = document.getElementById("debtName" + i).value.trim();
    const balance = Number(document.getElementById("balance" + i).value);
    const payment = Number(document.getElementById("payment" + i).value);
    const rate = Number(document.getElementById("rate" + i).value) / 100;

    if(balance > 0 && payment > 0){
      debts.push({
        name: name || "Debt " + i,
        balance,
        payment,
        rate,
        originalBalance: balance
      });
    }
  }

  const extraMonthly = Number(document.getElementById("extraMonthly").value);
  const strategy = document.getElementById("strategy").value;

  if(debts.length === 0){
    alert("Please enter at least one valid debt.");
    return;
  }

  if(extraMonthly < 0){
    alert("Please enter valid extra payment.");
    return;
  }

  let month = 0;
  let totalPaid = 0;
  let totalInterest = 0;
  const schedule = [];

  while(debts.some(debt => debt.balance > 0) && month < 1200){
    month++;

    debts.forEach(debt => {
      if(debt.balance <= 0) return;

      const monthlyRate = debt.rate / 12;
      const interest = debt.balance * monthlyRate;

      debt.balance += interest;
      totalInterest += interest;
    });

    let availableExtra = extraMonthly;

    debts.forEach(debt => {
      if(debt.balance <= 0) return;

      const payment = Math.min(debt.payment, debt.balance);
      debt.balance -= payment;
      totalPaid += payment;
    });

    const activeDebts = debts.filter(debt => debt.balance > 0);

    if(activeDebts.length > 0 && availableExtra > 0){
      let targetDebt;

      if(strategy === "snowball"){
        targetDebt = activeDebts.sort((a, b) => a.balance - b.balance)[0];
      }else{
        targetDebt = activeDebts.sort((a, b) => b.rate - a.rate)[0];
      }

      const extraPayment = Math.min(availableExtra, targetDebt.balance);
      targetDebt.balance -= extraPayment;
      totalPaid += extraPayment;
    }

    const totalBalance = debts.reduce((sum, debt) => sum + Math.max(0, debt.balance), 0);

    schedule.push({
      month,
      balance: totalBalance,
      interest: totalInterest,
      paid: totalPaid
    });
  }

  const payoffYears = Math.floor(month / 12);
  const payoffMonths = month % 12;

  let payoffText = "";

  if(payoffYears > 0){
    payoffText += payoffYears + (payoffYears === 1 ? " year" : " years");
  }

  if(payoffMonths > 0){
    payoffText += payoffYears > 0 ? " " : "";
    payoffText += payoffMonths + (payoffMonths === 1 ? " month" : " months");
  }

  if(payoffText === ""){
    payoffText = "0 months";
  }

  document.getElementById("payoffTime").textContent = payoffText;
  document.getElementById("totalPaid").textContent = money.format(totalPaid);
  document.getElementById("totalInterest").textContent = money.format(totalInterest);
  document.getElementById("resultBox").style.display = "block";

  fillTable(schedule);
  drawPayoffChart(schedule);
}

function fillTable(schedule){
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  schedule.forEach((row, index) => {
    if(index % 6 !== 0 && index !== schedule.length - 1) return;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${row.month}</td>
      <td>${money.format(row.balance)}</td>
      <td>${money.format(row.interest)}</td>
      <td>${money.format(row.paid)}</td>
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

function drawPayoffChart(schedule){
  const canvas = document.getElementById("payoffChart");
  const { ctx, width, height } = setupCanvas(canvas, 260);

  ctx.clearRect(0, 0, width, height);

  if(!schedule.length) return;

  const padding = 36;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const isDark = document.documentElement.classList.contains("dark");

  const maxBalance = Math.max(...schedule.map(row => row.balance), 1);

  ctx.strokeStyle = isDark ? "#30363d" : "#d0d7de";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  ctx.beginPath();

  schedule.forEach((row, index) => {
    const x = padding + (index / (schedule.length - 1 || 1)) * chartWidth;
    const y = height - padding - (row.balance / maxBalance) * chartHeight;

    if(index === 0){
      ctx.moveTo(x, y);
    }else{
      ctx.lineTo(x, y);
    }
  });

  ctx.strokeStyle = isDark ? "#2f81f7" : "#0969da";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.font = "12px Arial";
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";

  ctx.fillText("Month 1", padding, height - 8);
  ctx.fillText("Month " + schedule[schedule.length - 1].month, width - padding - 80, height - 8);
}

function clearForm(){
  for(let i = 1; i <= 4; i++){
    document.getElementById("debtName" + i).value = "";
    document.getElementById("balance" + i).value = "";
    document.getElementById("payment" + i).value = "";
    document.getElementById("rate" + i).value = "";
  }

  document.getElementById("extraMonthly").value = "";
  document.getElementById("strategy").value = "avalanche";
  document.getElementById("resultBox").style.display = "none";
  document.getElementById("tableBody").innerHTML = "";

  const payoffCanvas = document.getElementById("payoffChart");
  const payoffCtx = payoffCanvas.getContext("2d");

  payoffCtx.clearRect(0, 0, payoffCanvas.width, payoffCanvas.height);
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
