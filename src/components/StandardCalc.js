import React, { useState, useCallback, useEffect } from 'react';

function evaluate(a, op, b) {
  const x = parseFloat(a), y = parseFloat(b);
  if (isNaN(x) || isNaN(y)) return '0';
  switch (op) {
    case '+': return String(+(x + y).toPrecision(12));
    case '-': return String(+(x - y).toPrecision(12));
    case '*': return String(+(x * y).toPrecision(12));
    case '/': return y === 0 ? 'Error' : String(+(x / y).toPrecision(12));
    default: return b;
  }
}

function fmt(val) {
  if (val === 'Error') return 'Error';
  const n = parseFloat(val);
  if (isNaN(n)) return '0';
  return parseFloat(n.toPrecision(10)).toString();
}

const BUTTONS = [
  { label: 'AC',  type: 'action', action: 'clear' },
  { label: '+/−', type: 'action', action: 'negate' },
  { label: '%',   type: 'action', action: 'percent' },
  { label: '÷',   type: 'operator', value: '/' },
  { label: '7', type: 'digit', value: '7' },
  { label: '8', type: 'digit', value: '8' },
  { label: '9', type: 'digit', value: '9' },
  { label: '×',   type: 'operator', value: '*' },
  { label: '4', type: 'digit', value: '4' },
  { label: '5', type: 'digit', value: '5' },
  { label: '6', type: 'digit', value: '6' },
  { label: '−',   type: 'operator', value: '-' },
  { label: '1', type: 'digit', value: '1' },
  { label: '2', type: 'digit', value: '2' },
  { label: '3', type: 'digit', value: '3' },
  { label: '+',   type: 'operator', value: '+' },
  { label: '0', type: 'digit', value: '0', wide: true },
  { label: '.',   type: 'digit', value: '.' },
  { label: '=',   type: 'equals' },
];

export default function StandardCalc({ addToHistory }) {
  const [display, setDisplay] = useState('0');
  const [stored, setStored] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [expr, setExpr] = useState('');

  const handleDigit = useCallback((d) => {
    if (waiting) {
      setDisplay(d === '.' ? '0.' : d);
      setWaiting(false);
    } else {
      if (d === '.' && display.includes('.')) return;
      setDisplay(display === '0' && d !== '.' ? d : display + d);
    }
  }, [display, waiting]);

  const handleOperator = useCallback((op) => {
    if (stored !== null && !waiting) {
      const res = evaluate(stored, operator, display);
      setDisplay(res); setStored(res);
      setExpr(fmt(res) + ' ' + op);
    } else {
      setStored(display);
      setExpr(fmt(display) + ' ' + op);
    }
    setOperator(op); setWaiting(true);
  }, [display, stored, operator, waiting]);

  const handleEquals = useCallback(() => {
    if (stored === null || operator === null) return;
    const res = evaluate(stored, operator, display);
    const entry = `${fmt(stored)} ${operator} ${fmt(display)} = ${fmt(res)}`;
    setExpr(entry);
    addToHistory({ type: 'standard', expr: entry, result: fmt(res), time: new Date().toLocaleTimeString() });
    setDisplay(res); setStored(null); setOperator(null); setWaiting(true);
  }, [stored, operator, display, addToHistory]);

  const handleAction = useCallback((action) => {
    if (action === 'clear') { setDisplay('0'); setStored(null); setOperator(null); setWaiting(false); setExpr(''); }
    else if (action === 'negate') setDisplay(String(parseFloat(display) * -1));
    else if (action === 'percent') setDisplay(String(parseFloat(display) / 100));
  }, [display]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
      else if (e.key === '.') handleDigit('.');
      else if (e.key === '+') handleOperator('+');
      else if (e.key === '-') handleOperator('-');
      else if (e.key === '*') handleOperator('*');
      else if (e.key === '/') { e.preventDefault(); handleOperator('/'); }
      else if (e.key === 'Enter' || e.key === '=') handleEquals();
      else if (e.key === 'Escape') handleAction('clear');
      else if (e.key === 'Backspace') {
        setDisplay(d => d.length > 1 ? d.slice(0, -1) : '0');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleDigit, handleOperator, handleEquals, handleAction]);

  const dispVal = fmt(display);
  const fontSize = dispVal.length > 11 ? '1.6rem' : dispVal.length > 8 ? '2.2rem' : dispVal.length > 5 ? '2.8rem' : '3.2rem';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div className="display-area">
        <div className="display-expr">{expr || '\u00A0'}</div>
        <div className="display-value" style={{ fontSize }}>{dispVal}</div>
      </div>
      <div className="btn-grid btn-grid-4">
        {BUTTONS.map((btn, i) => (
          <button
            key={i}
            className={`calc-btn ${btn.type === 'digit' ? 'digit' : btn.type === 'action' ? 'action' : btn.type === 'operator' ? 'operator' : 'equals'}${btn.wide ? ' wide' : ''}`}
            onClick={() => {
              if (btn.type === 'digit') handleDigit(btn.value);
              else if (btn.type === 'operator') handleOperator(btn.value);
              else if (btn.type === 'equals') handleEquals();
              else handleAction(btn.action);
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
