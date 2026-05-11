
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle.addEventListener("click", () => {
  mainNav.classList.toggle("open");
});
function setBudget(value){
  document.getElementById("monthlyBudget").value = value;
}
function calculate(){
  const monthlyBudget = Number(document.getElementById("monthlyBudget").value);
  let cards = [
    {
      balance:Number(document.getElementById("balance1").value),
      min:Number(document.getElementById("min1").value),
      rate:Number(document.getElementById("rate1").value) / 100
    },
    {
      balance:Number(document.getElementById("balance2").value),
      min:Number(document.getElementById("min2").value),
      rate:Number(document.getElementById("rate2").value) / 100
    },
    {
      balance:Number(document.getElementById("balance3").value),
      min:Number(document.getElementById("min3").value),
      rate:Number(document.getElementById("rate3").value) / 100
    }
  ].filter(card => card.balance > 0);
  if(monthlyBudget <= 0 || !cards.length){
    alert("Please enter valid numbers.");
    return;
  }
  const totalStartingDebt = cards.reduce((sum, card) => sum + card.balance, 0);
  const totalMinimum = cards.reduce((sum, card) => sum + card.min, 0);
  if(monthlyBudget < totalMinimum){
    alert("Monthly budget must be at least equal to total minimum payments.");
    return;
  }
  let month = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  let payoffData = [];
  while(cards.some(card => card.balance > 0.01) && month < 600){
    month++;
    let monthInterest = 0;
    let monthPayment = 0;
    cards.forEach(card => {
      if(card.balance <= 0) return;
      const interest = card.balance * (card.rate / 12);
      card.balance += interest;
      monthInterest += interest;
    });
    cards.forEach(card => {
      if(card.balance <= 0.01) return;
      let payment = Math.min(card.min, card.balance);
      card.balance -= payment;
      monthPayment += payment;
    });
    let extra = monthlyBudget - monthPayment;
    while(extra > 0.01 && cards.some(card => card.balance > 0.01)){
      let target = cards.filter(card => card.balance > 0.01).sort((a,b) => b.rate - a.rate)[0];
      let extraPayment = Math.min(extra, target.balance);
      target.balance -= extraPayment;
      monthPayment += extraPayment;
      extra -= extraPayment;
    }
    cards.forEach(card => {
      if(card.balance < 0.01) card.balance = 0;
    });
    const remainingBalance = cards.reduce((sum, card) => sum + card.balance, 0);
    totalInterest += monthInterest;
    totalPaid += monthPayment;
    payoffData.push({
      month,
      payment:monthPayment,
      interest:monthInterest,
      balance:remainingBalance
    });
  }
  document.getElementById("payoffTime").textContent = month + " months";
  document.getElementById("totalDebt").textContent = money.format(totalStartingDebt);
  document.getElementById("totalInterest").textContent = money.format(totalInterest);
  document.getElementById("totalPayments").textContent = money.format(totalPaid);
  document.getElementById("resultBox").style.display = "block";
  fillTable(payoffData);
  drawPayoffChart(payoffData, totalStartingDebt);
  drawBreakdownChart(totalStartingDebt, totalInterest);
}
function fillTable(data){
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";
  data.slice(0, 120).forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.month}</td>
      <td>${money.format(row.payment)}</td>
      <td>${money.format(row.interest)}</td>
      <td>${money.format(row.balance)}</td>
    `;
    tableBody.appendChild(tr);
  });
}
function drawPayoffChart(data, startingDebt){
  const canvas = document.getElementById("payoffChart");
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
    const y = height - padding - (item.balance / startingDebt) * chartHeight;
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
    const y = height - padding - (item.balance / startingDebt) * chartHeight;
    if(index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = isDark ? "#2f81f7" : "#0969da";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.font = "12px Arial";
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText("Month 1", padding, height - 8);
  ctx.fillText("Month " + data[data.length - 1].month, width - padding - 75, height - 8);
}
function drawBreakdownChart(principal, interest){
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
  const total = principal + interest;
  if(total <= 0) return;
  const centerX = width / 2;
  const centerY = 112;
  const radius = 70;
  const lineWidth = 22;
  const principalAngle = (principal / total) * Math.PI * 2;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.strokeStyle = isDark ? "#2f81f7" : "#0969da";
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + principalAngle);
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeStyle = isDark ? "#3fb950" : "#2da44e";
  ctx.arc(centerX, centerY, radius, -Math.PI / 2 + principalAngle, Math.PI * 1.5);
  ctx.stroke();
  ctx.font = "700 14px Arial";
  ctx.fillStyle = isDark ? "#f0f6fc" : "#24292f";
  ctx.textAlign = "center";
  ctx.fillText("Total Paid", centerX, centerY - 4);
  ctx.font = "12px Arial";
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText(money.format(total), centerX, centerY + 16);
  ctx.textAlign = "left";
  ctx.font = "12px Arial";
  const legendX = width / 2 - 105;
  const legendY = 218;
  ctx.fillStyle = isDark ? "#2f81f7" : "#0969da";
  ctx.fillRect(legendX, legendY, 10, 10);
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText("Principal", legendX + 16, legendY + 10);
  ctx.fillStyle = isDark ? "#3fb950" : "#2da44e";
  ctx.fillRect(legendX + 120, legendY, 10, 10);
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText("Interest", legendX + 136, legendY + 10);
}
function clearForm(){
  document.getElementById("monthlyBudget").value = "";
  document.getElementById("balance1").value = "";
  document.getElementById("min1").value = "";
  document.getElementById("rate1").value = "";
  document.getElementById("balance2").value = "";
  document.getElementById("min2").value = "";
  document.getElementById("rate2").value = "";
  document.getElementById("balance3").value = "";
  document.getElementById("min3").value = "";
  document.getElementById("rate3").value = "";
  document.getElementById("resultBox").style.display = "none";
  document.getElementById("tableBody").innerHTML = "";
  const payoffCanvas = document.getElementById("payoffChart");
  const payoffCtx = payoffCanvas.getContext("2d");
  payoffCtx.clearRect(0, 0, payoffCanvas.width, payoffCanvas.height);
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
