// Get references to HTML elements
const toggleThemeButton = document.getElementById("toggle-theme");
const body = document.body;
const balance = document.getElementById("balance");
const money_plus = document.getElementById("money-plus");
const money_minus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const expenseType = document.getElementById("expense-type");
const clearTransactionsButton = document.getElementById("clear-transactions");

// Load transactions from local storage if available
const localStorageTransactions = JSON.parse(
  localStorage.getItem("transactions")
);
let transactions =
  localStorage.getItem("transactions") !== null ? localStorageTransactions : [];

// Theme Toggle Functionality
toggleThemeButton.addEventListener("click", () => {
  // Toggle dark and light theme classes on the body
  body.classList.toggle("dark-theme");
  body.classList.toggle("light-theme");

  // Calculate label color based on selected theme
  const labelColor = body.classList.contains("dark-theme") ? "white" : "black";

  // Update color-related settings for the expenseChart and barChart
  expenseChart.options.plugins.legend.labels.color = labelColor;
  expenseChart.options.plugins.tooltip.callbacks.label = function (context) {
    return context.label + ": " + context.formattedValue;
  };

  barChart.options.plugins.legend.labels.color = labelColor;
  barChart.options.plugins.tooltip.callbacks.label = function (context) {
    return context.label + ": " + context.formattedValue;
  };

  // Update chart color and tick color settings
  barChart.options.scales.x.ticks.color = labelColor;
  barChart.options.scales.y.ticks.color = labelColor;

  // Update the charts with new settings
  expenseChart.update();
  barChart.update();
});

// Function to add a new transaction
function addTransaction(e) {
  e.preventDefault();

  const transactionType = document.getElementById("transaction-type").value;

  // Validate input fields
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

    // Add transaction to the array
    transactions.push(transaction);

    // Update the DOM with the new transaction
    addTransactionDOM(transaction);

    // Update summary values and local storage
    updateValues();
    updateLocalStorage();

    // Clear input fields
    expenseType.value = "";
    text.value = "";
    amount.value = "";
  }
}

function generateID() {
  return Math.floor(Math.random() * 1000000000);
}

// Function to add a transaction to the DOM
function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? "-" : "+";
  const item = document.createElement("li");

  item.classList.add(transaction.amount < 0 ? "minus" : "plus");

  // Populate the list item with transaction details
  item.innerHTML = `
  <span class="uppercase"><strong>${
    transaction.expense
  } :</strong></span> &nbsp ${transaction.text} &nbsp 
  <span class="text_color">${sign}${Math.abs(transaction.amount)}</span>
`;

  // Append the item to the transaction list
  list.appendChild(item);
}

clearTransactionsButton.addEventListener("click", clearAllTransactions);

// Function to clear all transactions
function clearAllTransactions() {
  transactions = [];
  updateLocalStorage();
  Init();
}

// Function to update the displayed values (balance, income, expense)
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

  // Update balance, income, and expense values in the UI
  balance.innerText = `₹${total}`;
  money_plus.innerText = `₹${income}`;
  money_minus.innerText = `₹${expense}`;

  // Update card background color when it total goes into negative
  if (total < 0) {
    document.getElementById("card-1").style.backgroundColor = "#d0342c ";
  } else {
    document.getElementById("card-1").style.backgroundColor = "#3FA0EF";
  }
}

// Function to remove a transaction by ID
function removeTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  updateLocalStorage();
  Init();
}

// Function to update local storage with the current transactions
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

// Donut Chart

// Calculate aggregated amounts for each expense type
const aggregatedExpenseData = transactions
  .filter((transaction) => transaction.amount < 0)
  .reduce((aggregatedData, transaction) => {
    const expenseType = transaction.expense;
    if (aggregatedData[expenseType]) {
      aggregatedData[expenseType] -= transaction.amount;
    } else {
      aggregatedData[expenseType] = -transaction.amount;
    }
    return aggregatedData;
  }, {});

const expenseChartCanvas = document.getElementById("expense-chart");
const expenseChart = new Chart(expenseChartCanvas, {
  type: "doughnut",
  data: {
    labels: Object.keys(aggregatedExpenseData), // Use the expense types as labels
    datasets: [
      {
        data: Object.values(aggregatedExpenseData), // Use the aggregated amounts as data
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


// Calculate income by expense type
const incomeByExpenseType = transactions.reduce((acc, transaction) => {
  if (transaction.amount > 0) {
    acc[transaction.expense] =
      (acc[transaction.expense] || 0) + transaction.amount;
  }
  return acc;
}, {});

// Bar Chart

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

const loaderContainer = document.querySelector(".loader-container");

function showLoader() {
  loaderContainer.classList.add("loading");
}

function hideLoader() {
  loaderContainer.classList.remove("loading");
}

// Simulate loader for 4 seconds
showLoader();
setTimeout(() => {
  hideLoader();
}, 3000);
