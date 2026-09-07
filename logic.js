
    (function() {
      // State
      let currentInput = '0';
      let previousInput = null;
      let operator = null;
      let shouldResetDisplay = false;
      let justCalculated = false;
      
      const display = document.getElementById('display');
      const expression = document.getElementById('expression');
      
      // Update display with better number formatting
      function updateDisplay() {
        // Format large numbers and auto-shrink if needed
        if (currentInput !== 'Error') {
          if (currentInput.length > 10) {
            const num = parseFloat(currentInput);
            if (!isNaN(num) && isFinite(num)) {
              currentInput = num.toExponential(5);
            }
          }
          
          // Adjust font size based on number length and screen width
          const len = currentInput.length;
          const screenWidth = window.innerWidth;
          
          if (screenWidth < 360) {
            if (len > 8) {
              display.style.fontSize = '1.4rem';
            } else if (len > 6) {
              display.style.fontSize = '1.6rem';
            } else {
              display.style.fontSize = '';
            }
          } else if (screenWidth < 390) {
            if (len > 10) {
              display.style.fontSize = '1.6rem';
            } else if (len > 8) {
              display.style.fontSize = '1.8rem';
            } else if (len > 6) {
              display.style.fontSize = '2rem';
            } else {
              display.style.fontSize = '';
            }
          } else {
            if (len > 10) {
              display.style.fontSize = '1.75rem';
            } else if (len > 8) {
              display.style.fontSize = '2rem';
            } else if (len > 6) {
              display.style.fontSize = '2.5rem';
            } else {
              display.style.fontSize = '';
            }
          }
        } else {
          display.style.fontSize = '2rem';
        }
        
        display.textContent = currentInput;
      }
      
      // Update expression preview
      function updateExpression() {
        if (operator && previousInput !== null) {
          const opSymbol = getOperatorSymbol(operator);
          expression.textContent = `${previousInput} ${opSymbol}`;
        } else {
          expression.textContent = '';
        }
      }
      
      function getOperatorSymbol(op) {
        const symbols = {
          'add': '+',
          'subtract': '−',
          'multiply': '×',
          'divide': '÷'
        };
        return symbols[op] || '';
      }
      
      // Parse current input to number
      function getCurrentNumber() {
        if (currentInput === 'Error') return 0;
        return parseFloat(currentInput) || 0;
      }
      
      // Perform calculation
      function calculate(a, b, op) {
        switch(op) {
          case 'add': return a + b;
          case 'subtract': return a - b;
          case 'multiply': return a * b;
          case 'divide': 
            if (b === 0) return 'Error';
            return a / b;
          default: return b;
        }
      }
      
      // Format result
      function formatResult(num) {
        if (num === 'Error') return 'Error';
        if (!isFinite(num) || isNaN(num)) return 'Error';
        // Handle floating point precision
        let result = parseFloat(num.toPrecision(10));
        return result.toString();
      }
      
      // Input number
      function inputNumber(num) {
        if (shouldResetDisplay || currentInput === 'Error' || justCalculated) {
          currentInput = num === '.' ? '0.' : num;
          shouldResetDisplay = false;
          justCalculated = false;
        } else {
          if (num === '.' && currentInput.includes('.')) return;
          if (currentInput === '0' && num !== '.') {
            currentInput = num;
          } else {
            currentInput += num;
          }
        }
        updateDisplay();
        updateExpression();
      }
      
      // Handle operator
      function handleOperator(op) {
        const currentNum = getCurrentNumber();
        
        if (operator && !shouldResetDisplay && !justCalculated) {
          // Chain calculation
          const result = calculate(previousInput, currentNum, operator);
          if (result === 'Error') {
            displayError();
            return;
          }
          currentInput = formatResult(result);
          previousInput = parseFloat(result);
          updateDisplay();
        } else {
          previousInput = currentNum;
        }
        
        operator = op;
        shouldResetDisplay = true;
        justCalculated = false;
        updateExpression();
      }
      
      // Handle equals
      function handleEquals() {
        if (operator === null || previousInput === null) {
          return;
        }
        
        const currentNum = getCurrentNumber();
        const result = calculate(previousInput, currentNum, operator);
        
        if (result === 'Error') {
          displayError();
          return;
        }
        
        currentInput = formatResult(result);
        expression.textContent = `${previousInput} ${getOperatorSymbol(operator)} ${currentNum} =`;
        previousInput = parseFloat(result);
        operator = null;
        shouldResetDisplay = true;
        justCalculated = true;
        updateDisplay();
      }
      
      // Clear all
      function clearAll() {
        currentInput = '0';
        previousInput = null;
        operator = null;
        shouldResetDisplay = false;
        justCalculated = false;
        display.style.fontSize = '';
        updateDisplay();
        updateExpression();
      }
      
      // Delete last character
      function deleteLast() {
        if (shouldResetDisplay || justCalculated) {
          return;
        }
        if (currentInput.length > 1) {
          currentInput = currentInput.slice(0, -1);
        } else {
          currentInput = '0';
        }
        updateDisplay();
      }
      
      // Toggle negative
      function toggleNegative() {
        if (currentInput === 'Error') return;
        if (currentInput.startsWith('-')) {
          currentInput = currentInput.slice(1);
        } else if (currentInput !== '0') {
          currentInput = '-' + currentInput;
        }
        updateDisplay();
      }
      
      // Handle percent
      function handlePercent() {
        if (currentInput === 'Error') return;
        const num = getCurrentNumber();
        currentInput = formatResult(num / 100);
        updateDisplay();
      }
      
      // Display error
      function displayError() {
        currentInput = 'Error';
        previousInput = null;
        operator = null;
        shouldResetDisplay = true;
        updateDisplay();
        updateExpression();
      }
      
      // Event listeners
      document.querySelectorAll('[data-number]').forEach(btn => {
        btn.addEventListener('click', () => {
          inputNumber(btn.dataset.number);
        });
      });
      
      document.getElementById('btn-clear').addEventListener('click', clearAll);
      document.getElementById('btn-delete').addEventListener('click', deleteLast);
      document.getElementById('btn-percent').addEventListener('click', handlePercent);
      document.getElementById('btn-divide').addEventListener('click', () => handleOperator('divide'));
      document.getElementById('btn-multiply').addEventListener('click', () => handleOperator('multiply'));
      document.getElementById('btn-subtract').addEventListener('click', () => handleOperator('subtract'));
      document.getElementById('btn-add').addEventListener('click', () => handleOperator('add'));
      document.getElementById('btn-equals').addEventListener('click', handleEquals);
      
      // Long press on delete to toggle negative
      let longPressTimer;
      const deleteBtn = document.getElementById('btn-delete');
      
      deleteBtn.addEventListener('mousedown', () => {
        longPressTimer = setTimeout(() => {
          toggleNegative();
        }, 800);
      });
      deleteBtn.addEventListener('mouseup', () => {
        clearTimeout(longPressTimer);
      });
      deleteBtn.addEventListener('mouseleave', () => {
        clearTimeout(longPressTimer);
      });
      
      // Touch events for long press
      deleteBtn.addEventListener('touchstart', (e) => {
        longPressTimer = setTimeout(() => {
          toggleNegative();
          e.preventDefault();
        }, 800);
      });
      deleteBtn.addEventListener('touchend', () => {
        clearTimeout(longPressTimer);
      });
      
      // Keyboard support
      document.addEventListener('keydown', (e) => {
        if (e.key >= '0' && e.key <= '9') {
          inputNumber(e.key);
        } else if (e.key === '.') {
          inputNumber('.');
        } else if (e.key === '+') {
          handleOperator('add');
        } else if (e.key === '-') {
          handleOperator('subtract');
        } else if (e.key === '*') {
          handleOperator('multiply');
        } else if (e.key === '/') {
          e.preventDefault();
          handleOperator('divide');
        } else if (e.key === 'Enter' || e.key === '=') {
          e.preventDefault();
          handleEquals();
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          deleteLast();
        } else if (e.key === 'Escape') {
          clearAll();
        } else if (e.key === '%') {
          handlePercent();
        }
      });
      
      // Handle window resize
      window.addEventListener('resize', () => {
        updateDisplay();
      });
      
      // Initialize
      updateDisplay();
    })();
