import React, { useState, useCallback, useEffect } from 'react';

function safeEval(expr) {
  try {
    // Replace math functions and constants
    let e = expr
      .replace(/π/g, Math.PI)
      .replace(/e(?!\d)/g, Math.E)
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/asin\(/g, 'Math.asin(')
      .replace(/acos\(/g, 'Math.acos(')
      .replace(/atan\(/g, 'Math.atan(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/cbrt\(/g, 'Math.cbrt(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/\^/g, '**')
      .replace(/÷/g, '/')
      .replace(/×/g, '*')
      .replace(/−/g, '-');

    // eslint-disable-next-line no-new-func
    const result = new Function('return ' + e)();
    if (typeof result !== 'number' || !isFinite(result)) return 'Error';
    return parseFloat(result.toPrecision(10)).toString();
  } catch {
    return 'Error';
  }
}

const SCI_FUNCS = [
  { label: 'sin', insert: 'sin(' },
  { label: 'cos', insert: 'cos(' },
  { label: 'tan', insert: 'tan(' },
  { label: 'log', insert: 'log(' },
  { label: 'ln',  insert: 'ln(' },
  { label: '√',   insert: 'sqrt(' },
  { label: 'x²',  insert: '^2' },
  { label: 'xⁿ',  insert: '^' },
  { label: 'π',   insert: 'π' },
  { label: 'e',   insert: 'e' },
  { label: '(',   insert: '(' },
  { label: ')',   insert: ')' },
  { label: '|x|', insert: 'abs(' },
  { label: '∛',   insert: 'cbrt(' },
  { label: '1/x', insert: '1/' },
  { label: '!',   insert: '!' },
];

const STD_BTNS = [
  { label: 'AC', cls: 'action', val: 'clear' },
  { label: '⌫',  cls: 'action', val: 'back' },
  { label: '%',  cls: 'action', val: 'percent' },
  { label: '÷',  cls: 'operator', val: '÷' },
  { label: '7',  cls: 'digit', val: '7' },
  { label: '8',  cls: 'digit', val: '8' },
  { label: '9',  cls: 'digit', val: '9' },
  { label: '×',  cls: 'operator', val: '×' },
  { label: '4',  cls: 'digit', val: '4' },
  { label: '5',  cls: 'digit', val: '5' },
  { label: '6',  cls: 'digit', val: '6' },
  { label: '−',  cls: 'operator', val: '−' },
  { label: '1',  cls: 'digit', val: '1' },
  { label: '2',  cls: 'digit', val: '2' },
  { label: '3',  cls: 'digit', val: '3' },
  { label: '+',  cls: 'operator', val: '+' },
  { label: '0',  cls: 'digit wide', val: '0' },
  { label: '.',  cls: 'digit', val: '.' },
  { label: '=',  cls: 'equals', val: '=' },
];

export default function ScientificCalc({ addToHistory }) {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('0');
  const [evaluated, setEvaluated] = useState(false);

  const append = useCallback((val) => {
    if (evaluated) { setExpr(val); setEvaluated(false); }
    else setExpr(e => e + val);
    setResult('');
  }, [evaluated]);

  const handleStd = useCallback((val) => {
    if (val === 'clear') { setExpr(''); setResult('0'); setEvaluated(false); }
    else if (val === 'back') { setExpr(e => e.slice(0, -1)); }
    else if (val === 'percent') { setExpr(e => e + '/100'); }
    else if (val === '=') {
      const res = safeEval(expr);
      const entry = `${expr} = ${res}`;
      addToHistory({ type: 'scientific', expr: entry, result: res, time: new Date().toLocaleTimeString() });
      setResult(res); setEvaluated(true);
    } else {
      append(val);
    }
  }, [expr, append, addToHistory]);

  useEffect(() => {
    if (expr && !evaluated) {
      const live = safeEval(expr);
      if (live !== 'Error') setResult(live);
    }
  }, [expr, evaluated]);

  const displayMain = evaluated ? result : (result || expr || '0');
  const displaySub  = evaluated ? expr : '';
  const fontSize = displayMain.length > 11 ? '1.5rem' : displayMain.length > 8 ? '2rem' : displayMain.length > 5 ? '2.6rem' : '3rem';

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
      <div className="display-area" style={{ minHeight: 90 }}>
        <div className="display-expr">{displaySub || '\u00A0'}</div>
        <div className="display-value" style={{ fontSize }}>{displayMain}</div>
      </div>

      {/* Sci function row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:6, padding:'10px 14px 4px' }}>
        {SCI_FUNCS.map((f, i) => (
          <button key={i} className="calc-btn sci" onClick={() => append(f.insert)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Standard buttons */}
      <div className="btn-grid btn-grid-4" style={{ paddingTop:8 }}>
        {STD_BTNS.map((btn, i) => (
          <button
            key={i}
            className={`calc-btn ${btn.cls}`}
            onClick={() => handleStd(btn.val)}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
