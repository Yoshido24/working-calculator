const display = document.querySelector('#display');
const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const clearButton = document.querySelector('[data-action="clear"]');
const equalsButton = document.querySelector('[data-action="equals"]');

let currentValue = '';
let storedValue = null;
let operation = null;
let waitingForValue = false;

function updateDisplay() {
  display.textContent = currentValue || '0';
}

function enterNumber(number) {
  if (waitingForValue) {
    currentValue = number;
    waitingForValue = false;
  } else if (currentValue.length < 12) {
    currentValue = currentValue === '0' ? number : currentValue + number;
  }
  updateDisplay();
}

function chooseOperation(nextOperation) {
  if (currentValue === '') return;

  if (storedValue !== null && operation && !waitingForValue) {
    calculate();
  }

  storedValue = Number(currentValue);
  operation = nextOperation;
  waitingForValue = true;
}

function calculate() {
  if (storedValue === null || operation === null || currentValue === '') return;

  const secondValue = Number(currentValue);
  const result = operation === 'add'
    ? storedValue + secondValue
    : operation === 'subtract'
      ? storedValue - secondValue
      : storedValue * secondValue;

  currentValue = String(result);
  storedValue = null;
  operation = null;
  waitingForValue = true;
  updateDisplay();
}

function clearCalculator() {
  currentValue = '';
  storedValue = null;
  operation = null;
  waitingForValue = false;
  updateDisplay();
}

numberButtons.forEach((button) => {
  button.addEventListener('click', () => enterNumber(button.dataset.number));
});

operationButtons.forEach((button) => {
  button.addEventListener('click', () => chooseOperation(button.dataset.operation));
});

equalsButton.addEventListener('click', calculate);
clearButton.addEventListener('click', clearCalculator);

updateDisplay();
