
// Get references to HTML elements
const toggleThemeButton = document.getElementById("theme-toggle");
const body = document.body;
const balance = document.getElementById("balance");
const money_plus = document.getElementById("money-plus");
const money_minus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("transaction-form");
const text = document.getElementById("desc-text");
const amount = document.getElementById("amount");
const expenseType = document.getElementById("expense-type");
const clearTransactionsButton = document.getElementById("clear-transactions");

let dark = false;

// Load transactions from local storage if available
const localStorageTransactions = JSON.parse(
  localStorage.getItem("transactions")
);
let transactions =
  localStorage.getItem("transactions") !== null ? localStorageTransactions : [];

// Theme Toggle Functionality
toggleThemeButton.addEventListener("click", () => {
  dark = JSON.parse(localStorage.getItem("dark-theme"));

  console.log(dark, "dark");

  // Toggle dark and light theme classes on the body
  body.classList.toggle("dark-theme");
  body.classList.toggle("light-theme");
  dark = dark ? false : true;
  localStorage.setItem("dark-theme", dark);

  // Calculate label color based on selected theme
  const labelColor = body.classList.contains("dark-theme") ? "white" : "black";

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

    updateCharts();
  }
}

function generateID() {
  return Math.floor(Math.random() * 1000000000);
}

// Function to add a transaction to the DOM
function addTransactionDOM(transaction) {
  
}

clearTransactionsButton.addEventListener("click", clearAllTransactions);

// Function to clear all transactions
function clearAllTransactions() {
  transactions = [];
  updateLocalStorage();
  console.log("object");
  updateCharts();

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

  if (JSON.parse(localStorage.getItem("dark-theme"))) {
    body.classList.add("dark-theme");
  }

  // Update card background color when it total goes into negative
  if (total < 0) {
    document.getElementById("card-1").style.backgroundColor = "#d0342c";
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
  // updateValues();
  dark = JSON.parse(localStorage.getItem("dark-theme"));
}

// Init();

form.addEventListener("submit", addTransaction);

// Donut Chart
let aggregatedExpenseData = {};

// Calculate aggregated amounts for each expense type
function updateDoughnutChartData() {
  aggregatedExpenseData = transactions
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
}

// const expenseChartCanvas = document.getElementById("expense-chart");
// let expenseChart;
function updateDoughnutChart() {
  updateDoughnutChartData();
  
}
updateDoughnutChart();
// Calculate income by expense type
let incomeByExpenseType = {};
function updateBarChartData() {
  incomeByExpenseType = transactions.reduce((acc, transaction) => {
    if (transaction.amount > 0) {
      acc[transaction.expense] =
        (acc[transaction.expense] || 0) + transaction.amount;
    }
    return acc;
  }, {});
}

// Bar Chart

// let barChart;
function loadBarChart() {
  updateBarChartData();
  
}
loadBarChart();

function updateCharts() {
  
}

function confirmLogout() {
  const confirmation = confirm("Are you sure you want to log out?");

  if (!confirmation) {
    return; // If not confirmed, do nothing and remain on the same page
  }
 
  window.location.replace("index.html");
}

function validateForm(event) {
  event.preventDefault(); // Prevent the form from submitting initially

  const amountInput = document.getElementById("amount");
  const amount = parseFloat(amountInput.value); // Convert input to a floating-point number

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid positive number for the amount.");
    amountInput.focus();
    return; // Exit the function and prevent form submission
  }

  const descriptionInput = document.getElementById("desc-text");
  const description = descriptionInput.value.trim(); // Remove leading and trailing spaces

  if (description === "") {
    alert("Please enter a description.");
    descriptionInput.focus();
    return; // Exit the function and prevent form submission
  }

  // If all inputs are valid, you can proceed with adding the transaction
  addTransaction();
}
