const toggleThemeButton = document.getElementById("toggle-theme");
const body = document.body;

toggleThemeButton.addEventListener("click", () => {
  body.classList.toggle("dark-theme");
  body.classList.toggle("light-theme");

  const labelColor = body.classList.contains("dark-theme") ? "white" : "black";

  expenseChart.options.plugins.legend.labels.color = labelColor;
  expenseChart.options.plugins.tooltip.callbacks.label = function (context) {
    return context.label + ": " + context.formattedValue;
  };

  barChart.options.plugins.legend.labels.color = labelColor;
  barChart.options.plugins.tooltip.callbacks.label = function (context) {
    return context.label + ": " + context.formattedValue;
  };

  barChart.options.scales.x.ticks.color = labelColor;
  barChart.options.scales.y.ticks.color = labelColor;

  expenseChart.update();
  barChart.update();
});

const balance = document.getElementById("balance");
const money_plus = document.getElementById("money-plus");
const money_minus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const expenseType = document.getElementById("expense-type");

const localStorageTransactions = JSON.parse(
  localStorage.getItem("transactions")
);

let transactions =
  localStorage.getItem("transactions") !== null ? localStorageTransactions : [];

function addTransaction(e) {
  e.preventDefault();

  const transactionType = document.getElementById("transaction-type").value;

  if (
    expenseType.value.trim() === "" ||
    text.value.trim() === "" ||
    amount.value.trim() === ""
  ) {
    alert("please add text and amount");
  } else {
    const transaction = {
      id: generateID(),
      expense: expenseType.value,
      text: text.value,
      amount:
        transactionType === "expense"
          ? -Math.abs(amount.value)
          : +Math.abs(amount.value),
    };

    transactions.push(transaction);

    addTransactionDOM(transaction);
    updateValues();
    updateLocalStorage();
    expenseType.value = "";
    text.value = "";
    amount.value = "";
  }
}

function generateID() {
  return Math.floor(Math.random() * 1000000000);
}

function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? "-" : "+";
  const item = document.createElement("li");

  item.classList.add(transaction.amount < 0 ? "minus" : "plus");

  item.innerHTML = `
  ${transaction.expense} ${transaction.text} 
  <span>${sign}${Math.abs(transaction.amount)}</span>
`;

  list.appendChild(item);
}

const clearTransactionsButton = document.getElementById("clear-transactions");

clearTransactionsButton.addEventListener("click", clearAllTransactions);

function clearAllTransactions() {
  transactions = [];
  updateLocalStorage();
  Init();
}

function updateValues() {
  const amounts = transactions.map((transaction) => transaction.amount);
  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
  const income = amounts
    .filter((item) => item > 0)
    .reduce((acc, item) => (acc += item), 0)
    .toFixed(2);
  const expense = (
    amounts.filter((item) => item < 0).reduce((acc, item) => (acc += item), 0) *
    -1
  ).toFixed(2);

  balance.innerText = `₹${total}`;
  money_plus.innerText = `₹${income}`;
  money_minus.innerText = `₹${expense}`;

  if (total < 0) {
    document.getElementById("card-1").style.backgroundColor = "#d0342c ";
  } else {
    document.getElementById("card-1").style.backgroundColor = "#3FA0EF";
  }
}

function removeTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  updateLocalStorage();
  Init();
}

function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function Init() {
  list.innerHTML = "";
  transactions.forEach(addTransactionDOM);
  updateValues();
}

Init();

form.addEventListener("submit", addTransaction);

const expenseLabels = transactions
  .filter((transaction) => transaction.amount < 0)
  .map((transaction) => transaction.expense);

const expenseAmounts = transactions
  .filter((transaction) => transaction.amount < 0)
  .map((transaction) => Math.abs(transaction.amount));

const expenseChartCanvas = document.getElementById("expense-chart");
const expenseChart = new Chart(expenseChartCanvas, {
  type: "doughnut",
  data: {
    labels: expenseLabels,
    datasets: [
      {
        data: expenseAmounts,
        backgroundColor: [
          "#e07e63",
          "#bfca43",
          "#df9f8e",
          "#7eb1e4",
          "#bec476",
        ],
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: body.classList.contains("dark-theme") ? "white" : "black",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return context.label + ": " + context.formattedValue;
          },
        },
      },
    },
  },
});

const incomeByExpenseType = transactions.reduce((acc, transaction) => {
  if (transaction.amount > 0) {
    acc[transaction.expense] =
      (acc[transaction.expense] || 0) + transaction.amount;
  }
  return acc;
}, {});

const barChartCanvas = document.getElementById("barChart");
const barChart = new Chart(barChartCanvas, {
  type: "bar",
  data: {
    labels: Object.keys(incomeByExpenseType),
    datasets: [
      {
        label: "Income by Expense Type",
        data: Object.values(incomeByExpenseType),
        backgroundColor: [
          "#e07e63",
          "#bfca43",
          "#df9f8e",
          "#7eb1e4",
          "#bec476",
        ],
      },
    ],
  },
  options: {
    border: 0,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});
