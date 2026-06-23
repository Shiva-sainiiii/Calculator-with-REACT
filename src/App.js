import React, { useState, useCallback } from 'react';
import './App.css';

const buttons = [
  { label: 'AC', type: 'action', action: 'clear' },
  { label: '+/-', type: 'action', action: 'negate' },
  { label: '%', type: 'action', action: 'percent' },
  { label: '÷', type: 'operator', value: '/' },
  { label: '7', type: 'digit', value: '7' },
  { label: '8', type: 'digit', value: '8' },
  { label: '9', type: 'digit', value: '9' },
  { label: '×', type: 'operator', value: '*' },
  { label: '4', type: 'digit', value: '4' },
  { label: '5', type: 'digit', value: '5' },
  { label: '6', type: 'digit', value: '6' },
  { label: '−', type: 'operator', value: '-' },
  { label: '1', type: 'digit', value: '1' },
  { label: '2', type: 'digit', value: '2' },
  { label: '3', type: 'digit', value: '3' },
  { label: '+', type: 'operator', value: '+' },
  { label: '0', type: 'digit', value: '0', wide: true },
  { label: '.', type: 'digit', value: '.' },
  { label: '=', type: 'equals' },
];

function evaluate(a, op, b) {
  const x = parseFloat(a);
  const y = parseFloat(b);
  if (isNaN(x) || isNaN(y)) return '0';
  switch (op) {
    case '+': return String(x + y);
    case '-': return String(x - y);
    case '*': return String(x * y);
    case '/': return y === 0 ? 'Error' : String(x / y);
    default: return b;
  }
}

function formatDisplay(val) {
  if (val === 'Error') return 'Error';
  const num = parseFloat(val);
  if (isNaN(num)) return '0';
  // Limit to 10 significant digits
  const formatted = parseFloat(num.toPrecision(10)).toString();
  return formatted;
}

export default function App() {
  const [display, setDisplay] = useState('0');
  const [stored, setStored] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [expression, setExpression] = useState('');

  const handleDigit = useCallback((digit) => {
    if (waitingForOperand) {
      setDisplay(digit === '.' ? '0.' : digit);
      setWaitingForOperand(false);
    } else {
      if (digit === '.' && display.includes('.')) return;
      setDisplay(display === '0' && digit !== '.' ? digit : display + digit);
    }
  }, [display, waitingForOperand]);

  const handleOperator = useCallback((op) => {
    const current = display;
    if (stored !== null && !waitingForOperand) {
      const result = evaluate(stored, operator, current);
      setDisplay(result);
      setStored(result);
      setExpression(formatDisplay(result) + ' ' + op);
    } else {
      setStored(current);
      setExpression(formatDisplay(current) + ' ' + op);
    }
    setOperator(op);
    setWaitingForOperand(true);
  }, [display, stored, operator, waitingForOperand]);

  const handleEquals = useCallback(() => {
    if (stored === null || operator === null) return;
    const result = evaluate(stored, operator, display);
    setExpression(formatDisplay(stored) + ' ' + operator + ' ' + formatDisplay(display) + ' =');
    setDisplay(result);
    setStored(null);
    setOperator(null);
    setWaitingForOperand(true);
  }, [stored, operator, display]);

  const handleAction = useCallback((action) => {
    if (action === 'clear') {
      setDisplay('0');
      setStored(null);
      setOperator(null);
      setWaitingForOperand(false);
      setExpression('');
    } else if (action === 'negate') {
      setDisplay(String(parseFloat(display) * -1));
    } else if (action === 'percent') {
      setDisplay(String(parseFloat(display) / 100));
    }
  }, [display]);

  const handleClick = (btn) => {
    if (btn.type === 'digit') handleDigit(btn.value);
    else if (btn.type === 'operator') handleOperator(btn.value);
    else if (btn.type === 'equals') handleEquals();
    else if (btn.type === 'action') handleAction(btn.action);
  };

  const displayValue = formatDisplay(display);
  const fontSize = displayValue.length > 9 ? '2rem' : displayValue.length > 6 ? '2.8rem' : '3.5rem';

  return (
    <div className="app">
      <div className="calculator">
        <div className="screen">
          <div className="expression">{expression || '\u00A0'}</div>
          <div className="display" style={{ fontSize }}>{displayValue}</div>
        </div>
        <div className="buttons">
          {buttons.map((btn, i) => (
            <button
              key={i}
              className={`btn btn--${btn.type}${btn.wide ? ' btn--wide' : ''}`}
              onClick={() => handleClick(btn)}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
