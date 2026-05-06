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
  const monthly = Number(document.getElementById("monthly").value);
  const annualRate = Number(document.getElementById("rate").value) / 100;
  const years = Number(document.getElementById("years").value);
  const frequency = Number(document.getElementById("frequency").value);

  if(principal < 0 || monthly < 0 || annualRate < 0 || years <= 0){
    alert("Please enter valid numbers.");
    return;
  }

  let balance = principal;
  let totalContributions = principal;
  const totalMonths = years * 12;
  const monthlyRate = Math.pow(1 + annualRate / frequency, frequency / 12) - 1;
  const yearlyData = [];

  for(let month = 1; month <= totalMonths; month++){
    balance = balance * (1 + monthlyRate);
    balance += monthly;
    totalContributions += monthly;

    if(month % 12 === 0){
      yearlyData.push({
        year: month / 12,
        balance: balance,
        contributions: totalContributions,
        interest: balance - totalContributions
      });
    }
  }

  document.getElementById("futureValue").textContent = money.format(balance);
  document.getElementById("totalContributions").textContent = money.format(totalContributions);
  document.getElementById("interestEarned").textContent = money.format(balance - totalContributions);
  document.getElementById("resultBox").style.display = "block";

  fillTable(yearlyData);
  drawChart(yearlyData);
}

function fillTable(data){
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.year}</td>
      <td>${money.format(row.balance)}</td>
      <td>${money.format(row.contributions)}</td>
      <td>${money.format(row.interest)}</td>
    `;
    tableBody.appendChild(tr);
  });
}

function drawChart(data){
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
  const maxValue = Math.max(...data.map(item => item.balance));
  const isDark = document.documentElement.classList.contains("dark");

  ctx.strokeStyle = isDark ? "#30363d" : "#d0d7de";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
  gradient.addColorStop(0, isDark ? "rgba(63,185,80,0.35)" : "rgba(45,164,78,0.25)");
  gradient.addColorStop(1, "rgba(45,164,78,0)");

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

  ctx.strokeStyle = isDark ? "#3fb950" : "#2da44e";
  ctx.lineWidth = 3;
  ctx.stroke();

  const last = data[data.length - 1];

  ctx.font = "12px Arial";
  ctx.fillStyle = isDark ? "#8b949e" : "#57606a";
  ctx.fillText("Year 1", padding, height - 8);
  ctx.fillText("Year " + last.year, width - padding - 60, height - 8);
}

function clearForm(){
  document.getElementById("principal").value = "";
  document.getElementById("monthly").value = "";
  document.getElementById("rate").value = "";
  document.getElementById("years").value = "";
  document.getElementById("frequency").value = "12";
  document.getElementById("resultBox").style.display = "none";
  document.getElementById("tableBody").innerHTML = "";

  const canvas = document.getElementById("growthChart");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
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
