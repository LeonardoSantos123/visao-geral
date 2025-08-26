/* ---- Segments (tabs) — handler único para visual + troca de conteúdo por scope/target ---- */
document.querySelectorAll('.segments').forEach(group => {
  group.addEventListener('click', (e) => {
    const btn = e.target.closest('.segment');
    if (!btn) return;

    // Toggle visual (botão ativo)
    group.querySelectorAll('.segment').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    // Se o grupo tem data-scope e o botão tem data-target, troca o conteúdo correspondente
    const scope = group.dataset.scope; // ex: "networth" ou "budget"
    const sel = btn.dataset.target;    // ex: "#budget-goals"
    if (scope && sel) {
      // esconde todas as seções desse scope
      document.querySelectorAll(`.${scope}-section`).forEach(el => {
        el.classList.remove('is-visible');
        el.setAttribute('aria-hidden', 'true');
      });

      // mostra a seção alvo
      const target = document.querySelector(sel);
      if (target) {
        target.classList.add('is-visible');
        target.removeAttribute('aria-hidden');
      }
    }
  });
});

/* ---- Metas ---- */

const budgetGoalsData = [
  { name: "Carro Novo", current: 5000.01, goal: 50000 },
  { name: "Férias", current: 1002.15, goal: 3000 }
];

(function renderBudgetGoals() {
  const container = document.getElementById('budget-goals');
  if (!container) return;

  budgetGoalsData.forEach(goal => {
    const goalEl = document.createElement('div');
    goalEl.className = 'goal';

    const nameEl = document.createElement('div');
    nameEl.className = 'name';
    nameEl.textContent = goal.name;

    const amountEl = document.createElement('div');
    amountEl.className = 'amount';
    // formata valores em BRL
    const currentFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.current);
    const goalFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.goal);
    amountEl.innerHTML = `${currentFormatted} / <strong>${goalFormatted}</strong>`;

    const progressEl = document.createElement('div');
    progressEl.className = 'progress';
    progressEl.setAttribute('aria-hidden', 'true');

    const iEl = document.createElement('i');
    const progressPercent = Math.min((goal.current / goal.goal) * 100, 100);
    iEl.style.width = progressPercent + '%';

    progressEl.appendChild(iEl);

    goalEl.appendChild(nameEl);
    goalEl.appendChild(amountEl);
    goalEl.appendChild(progressEl);

    container.appendChild(goalEl);
  });
})();


/* ---- Donut "By Account" (categorias falsas) ---- */
(function () {
  const data = [
    { name: 'Projeto Pontual', value: 300 },
    { name: 'Impostos', value: 200 },
    { name: 'Outros', value: 50 },
  ];

  const colors = ['#71E6B5', '#55D1A1', '#3FBF98', '#36B38E', '#2FA587']; // tons suaves de verde

  const total = data.reduce((s, d) => s + d.value, 0); // total no centro
  const centerVal = document.getElementById('donut-total');
centerVal.textContent = new Intl.NumberFormat('pt-BR', { 
  style: 'currency', 
  currency: 'BRL', 
  maximumFractionDigits: 0 
}).format(total);

adjustFontSize(centerVal); // 👈 aplica ajuste

  const svg = document.querySelector('#donut-byaccount svg');
  const g = svg.querySelector('#donut-arcs');
  const tip = document.getElementById('donut-tip');
  const donutWrap = document.getElementById('donut-byaccount');

  const cx = 120, cy = 120, rOuter = 85, thickness = 10, rInner = rOuter - thickness;
  const padAngle = 0.03; // ~1.7° de espaço entre segmentos
  let start = 0;

  const vals = data.map(d => d.value);
  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals);

  data.forEach((d, i) => {
    const frac = d.value / total;
    const end = start + frac * Math.PI * 2;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'seg');

    // --- Cálculo da opacidade conforme o valor ---
    const t = (maxVal === minVal) ? 1 : (d.value - minVal) / (maxVal - minVal);
    const minOpacity = 0.35; // mais transparente (fatia menor)
    const maxOpacity = 1.0;  // mais sólida (fatia maior)
    const opacity = minOpacity + t * (maxOpacity - minOpacity);

    // aplica cor verde com opacidade dinâmica
    path.style.fill = `rgba(47,165,135,${opacity})`;

    // desenha a fatia
    path.setAttribute('d', annularSector(cx, cy, rOuter, rInner, start + padAngle, end - padAngle));

    // tooltip
    path.addEventListener('mousemove', (ev) => {
      const rect = donutWrap.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      tip.innerHTML = `<strong>${d.name}</strong> — ${brl(d.value)} (${(frac * 100).toFixed(1)}%)`;
      tip.style.left = x + 'px';
      tip.style.top = y + 'px';
      tip.classList.add('show');
    });
    path.addEventListener('mouseleave', () => tip.classList.remove('show'));

    g.appendChild(path);
    start = end;
  });

  // helpers
  function brl(n) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
  }

  function annularSector(cx, cy, rOut, rIn, a0, a1) {
    if (a1 < a0) [a0, a1] = [a1, a0];
    const p0 = polar(cx, cy, rOut, a0), p1 = polar(cx, cy, rOut, a1);
    const p2 = polar(cx, cy, rIn, a1), p3 = polar(cx, cy, rIn, a0);
    const large = (a1 - a0) > Math.PI ? 1 : 0;
    return ['M', p0.x, p0.y, 'A', rOut, rOut, 0, large, 1, p1.x, p1.y, 
            'L', p2.x, p2.y, 'A', rIn, rIn, 0, large, 0, p3.x, p3.y, 'Z'].join(' ');
  }

  function polar(cx, cy, r, ang) {
    const a = ang - Math.PI / 2; // começa no topo
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }
})();


/* ---- Donut "By Tag" (despesas falsas) ---- */
(function () {
  const data = [
    { name: 'Aluguel', value: 1200 },
    { name: 'Folha de Pagamento', value: 3000 },
    { name: 'Serviços', value: 800 },
    { name: 'Outros', value: 400 },
  ];

  const total = data.reduce((s, d) => s + d.value, 0);
  const centerVal = document.getElementById('donut-total-bytag');
centerVal.textContent = new Intl.NumberFormat('pt-BR', { 
  style: 'currency', 
  currency: 'BRL', 
  maximumFractionDigits: 0 
}).format(total);

adjustFontSize(centerVal); // 👈 aplica ajuste

  const svg = document.querySelector('#donut-bytag svg');
  const g = svg.querySelector('#donut-arcs-bytag');
  const tip = document.getElementById('donut-tip-bytag');
  const donutWrap = document.getElementById('donut-bytag');

  const cx = 120, cy = 120, rOuter = 85, thickness = 10, rInner = rOuter - thickness;
  const padAngle = 0.03;
  let start = 0;

  const vals = data.map(d => d.value);
  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals);

  data.forEach((d, i) => {
    const frac = d.value / total;
    const end = start + frac * Math.PI * 2;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'seg');

    const t = (maxVal === minVal) ? 1 : (d.value - minVal) / (maxVal - minVal);
    const minOpacity = 0.35;
    const maxOpacity = 1.0;
    const opacity = minOpacity + t * (maxOpacity - minOpacity);

    path.style.fill = `rgba(239,68,68,${opacity})`; // azul p/ despesas

    path.setAttribute('d', annularSector(cx, cy, rOuter, rInner, start + padAngle, end - padAngle));

    path.addEventListener('mousemove', (ev) => {
      const rect = donutWrap.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      tip.innerHTML = `<strong>${d.name}</strong> — ${brl(d.value)} (${(frac * 100).toFixed(1)}%)`;
      tip.style.left = x + 'px';
      tip.style.top = y + 'px';
      tip.classList.add('show');
    });
    path.addEventListener('mouseleave', () => tip.classList.remove('show'));

    g.appendChild(path);
    start = end;
  });

  function brl(n) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
  }

  function annularSector(cx, cy, rOut, rIn, a0, a1) {
    if (a1 < a0) [a0, a1] = [a1, a0];
    const p0 = polar(cx, cy, rOut, a0), p1 = polar(cx, cy, rOut, a1);
    const p2 = polar(cx, cy, rIn, a1), p3 = polar(cx, cy, rIn, a0);
    const large = (a1 - a0) > Math.PI ? 1 : 0;
    return ['M', p0.x, p0.y, 'A', rOut, rOut, 0, large, 1, p1.x, p1.y, 
            'L', p2.x, p2.y, 'A', rIn, rIn, 0, large, 0, p3.x, p3.y, 'Z'].join(' ');
  }

  function polar(cx, cy, r, ang) {
    const a = ang - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }
})();


/* ---- Donut "Debt" (Reservas falsas) ---- */
(function () {
  const data = [
    { name: 'Fundo Emergência', value: 5000 },
    { name: 'Investimentos Curto Prazo', value: 3000 },
    { name: 'Caixa Extra', value: 2000 },
  ];

  const total = data.reduce((s, d) => s + d.value, 0);
  const centerVal = document.getElementById('donut-total-debt');
centerVal.textContent = new Intl.NumberFormat('pt-BR', { 
  style: 'currency', 
  currency: 'BRL', 
  maximumFractionDigits: 0 
}).format(total);

adjustFontSize(centerVal); // 👈 aplica ajuste

  const svg = document.querySelector('#donut-debt svg');
  const g = svg.querySelector('#donut-arcs-debt');
  const tip = document.getElementById('donut-tip-debt');
  const donutWrap = document.getElementById('donut-debt');

  const cx = 120, cy = 120, rOuter = 85, thickness = 10, rInner = rOuter - thickness;
  const padAngle = 0.03;
  let start = 0;

  const vals = data.map(d => d.value);
  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals);

  data.forEach((d, i) => {
    const frac = d.value / total;
    const end = start + frac * Math.PI * 2;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'seg');

    const t = (maxVal === minVal) ? 1 : (d.value - minVal) / (maxVal - minVal);
    const minOpacity = 0.35;
    const maxOpacity = 1.0;
    const opacity = minOpacity + t * (maxOpacity - minOpacity);

    path.style.fill = `rgba(234,179,8,${opacity})`; // amarelo (tailwind yellow-500)

    path.setAttribute('d', annularSector(cx, cy, rOuter, rInner, start + padAngle, end - padAngle));

    path.addEventListener('mousemove', (ev) => {
      const rect = donutWrap.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      tip.innerHTML = `<strong>${d.name}</strong> — ${brl(d.value)} (${(frac * 100).toFixed(1)}%)`;
      tip.style.left = x + 'px';
      tip.style.top = y + 'px';
      tip.classList.add('show');
    });
    path.addEventListener('mouseleave', () => tip.classList.remove('show'));

    g.appendChild(path);
    start = end;
  });

  function brl(n) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
  }

  function annularSector(cx, cy, rOut, rIn, a0, a1) {
    if (a1 < a0) [a0, a1] = [a1, a0];
    const p0 = polar(cx, cy, rOut, a0), p1 = polar(cx, cy, rOut, a1);
    const p2 = polar(cx, cy, rIn, a1), p3 = polar(cx, cy, rIn, a0);
    const large = (a1 - a0) > Math.PI ? 1 : 0;
    return ['M', p0.x, p0.y, 'A', rOut, rOut, 0, large, 1, p1.x, p1.y, 
            'L', p2.x, p2.y, 'A', rIn, rIn, 0, large, 0, p3.x, p3.y, 'Z'].join(' ');
  }

  function polar(cx, cy, r, ang) {
    const a = ang - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }
})();


/* ---- Responsividade dos números ---- */
function adjustFontSize(el) {
  const text = el.textContent.replace(/\D/g, ""); // só os números
  const len = text.length;

  if (len <= 3) {
    el.style.fontSize = "34px";   // até 999
  } else if (len === 4) {
    el.style.fontSize = "30px";   // até 9.999
  } else if (len === 5) {
    el.style.fontSize = "28px";   // até 99.999
  } else {
    el.style.fontSize = "20px";   // acima de 100.000
  }
}



/* ---- Cashflow Bars dentro do grid-placeholder existente ---- */
(function () {
  const container = document.getElementById('mount-cashflow');
  if (!container) return;

  const data = [
    { month: 'Nov 2023', income: 7500, expense: 2500 },
    { month: 'Jan 2024', income: 8200, expense: 5600 },
    { month: 'Mar 2024', income: 8800, expense: 7200 },
    { month: 'May 2024', income: 10000, expense: 7500 },
    { month: 'Jul 2024', income: 9700, expense: 6800 },
    { month: 'Sep 2024', income: 9800, expense: 6200 },
  ];

  const maxVal = Math.max(...data.flatMap(d => [d.income, d.expense]));
  const fmtBRL = n => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

  const barArea = document.createElement('div');
  barArea.className = 'cashflow-bars';
  container.appendChild(barArea);

  const tip = document.createElement('div');
  tip.className = 'cashflow-tooltip';
  container.appendChild(tip);

  // cria colunas
  data.forEach(d => {
    const group = document.createElement('div');
    group.className = 'cashflow-group';

    const inc = document.createElement('div');
    inc.className = 'cashflow-bar income';
    inc.style.height = (d.income / maxVal * 100) + '%';

    const exp = document.createElement('div');
    exp.className = 'cashflow-bar expense';
    exp.style.height = (d.expense / maxVal * 100) + '%';

    [inc, exp].forEach(el => {
      el.addEventListener('mousemove', ev => {
        const rect = container.getBoundingClientRect();
        tip.innerHTML = `
          <div class="tip-month">${d.month}</div>
          <div class="tip-row">Receita: <strong>${fmtBRL(d.income)}</strong></div>
          <div class="tip-row">Despesa: <strong>${fmtBRL(d.expense)}</strong></div>
        `;
        tip.style.left = (ev.clientX - rect.left) + 'px';
        tip.style.top = (ev.clientY - rect.top - 10) + 'px';
        tip.classList.add('show');
      });
      el.addEventListener('mouseleave', () => tip.classList.remove('show'));
    });

    // wrapper para as barras (verde + vermelha lado a lado)
const bars = document.createElement('div');
bars.className = 'cashflow-bars-inner';
bars.appendChild(inc);
bars.appendChild(exp);

// adiciona ao grupo
group.appendChild(bars);
barArea.appendChild(group);
  });

  // 👇 AQUI entra o novo eixo (fora da área do gráfico)
  const axis = document.createElement('div');
  axis.className = 'cashflow-axis';
  container.parentNode.insertBefore(axis, container.nextSibling);

  data.forEach(d => {
    const label = document.createElement('div');
    label.className = 'cashflow-axis-label';
    label.textContent = d.month;
    axis.appendChild(label);
  });
})();