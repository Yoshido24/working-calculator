const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];

const createCalculator = () => {
  const display = { textContent: '0' };
  let clickHandler;

  const buttons = {
    addEventListener(event, handler) {
      if (event === 'click') {
        clickHandler = handler;
      }
    }
  };

  const context = {
    document: {
      getElementById(id) {
        if (id === 'display') {
          return display;
        }
        throw new Error(`Unknown id: ${id}`);
      },
      querySelector(selector) {
        if (selector === '.buttons') {
          return buttons;
        }
        throw new Error(`Unknown selector: ${selector}`);
      }
    }
  };

  vm.runInNewContext(script, context);

  const press = (action, value) => {
    clickHandler({
      target: {
        closest(selector) {
          if (selector !== 'button') {
            return null;
          }

          return { dataset: { action, value } };
        }
      }
    });
  };

  return {
    display,
    press
  };
};

test('adds numbers', () => {
  const calculator = createCalculator();

  calculator.press('number', '2');
  calculator.press('operator', '+');
  calculator.press('number', '3');
  calculator.press('equals');

  assert.equal(calculator.display.textContent, '5');
});

test('supports decimal math', () => {
  const calculator = createCalculator();

  calculator.press('number', '1');
  calculator.press('decimal');
  calculator.press('number', '5');
  calculator.press('operator', '+');
  calculator.press('number', '2');
  calculator.press('equals');

  assert.equal(calculator.display.textContent, '3.5');
});

test('supports chained operators', () => {
  const calculator = createCalculator();

  calculator.press('number', '5');
  calculator.press('operator', '+');
  calculator.press('number', '6');
  calculator.press('operator', '-');
  calculator.press('number', '2');
  calculator.press('equals');

  assert.equal(calculator.display.textContent, '9');
});

test('shows error for division by zero and recovers after clear', () => {
  const calculator = createCalculator();

  calculator.press('number', '9');
  calculator.press('operator', '/');
  calculator.press('number', '0');
  calculator.press('equals');
  assert.equal(calculator.display.textContent, 'Error');

  calculator.press('clear');
  assert.equal(calculator.display.textContent, '0');
});
