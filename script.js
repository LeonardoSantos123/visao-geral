/* Toggle visual de tabs (apenas estilo) */
document.querySelectorAll('.segments').forEach(group => {
    group.addEventListener('click', (e) => {
        const btn = e.target.closest('.segment');
        if (!btn) return;
        group.querySelectorAll('.segment').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
    });
});

/* ---- Toggle visual + troca de conteúdo por aba ---- */
document.querySelectorAll('.segments').forEach(group => {
    group.addEventListener('click', (e) => {
        const btn = e.target.closest('.segment');
        if (!btn) return;

        // Toggle visual da aba
        group.querySelectorAll('.segment').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        // Mostra/esconde conteúdo da aba (Net Worth)
        if (group.dataset.scope === 'networth') {
            document.querySelectorAll('.networth-section').forEach(el => el.classList.remove('is-visible'));
            const sel = btn.dataset.target;
            if (sel) document.querySelector(sel).classList.add('is-visible');

            // Atualiza título e valor conforme a aba
            const titleEl = document.querySelector(".card__top h3");
            const valueEl = document.querySelector(".card__top .value-xxl");

            const tabData = {
                "#networth-byAccount": { title: "Net Worth", value: "$162,098.13" },
                "#networth-byTag": { title: "Net Worth - By Tag", value: "$98,450.50" },
                "#networth-debt": { title: "Debt", value: "$24,320.00" }
            };

            if (tabData[sel]) {
                titleEl.textContent = tabData[sel].title;
                valueEl.textContent = tabData[sel].value;
            }
        }
    });
});


/* ---- Donut "By Account" (categorias falsas) ---- */
(function () {
    const data = [
        { name: 'Projeto Pontual', value: 300 },
        { name: 'Impostos', value: 200 },
        { name: 'Outros', value: 50 },
    ];
    const colors = ['#71E6B5', '#55D1A1', '#3FBF98', '#36B38E', '#2FA587']; // tons suaves de verde
    const total = data.reduce((s, d) => s + d.value, 0);

    // total no centro
    const centerVal = document.getElementById('donut-total');
    centerVal.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(total);

    const svg = document.querySelector('#donut-byaccount svg');
    const g = svg.querySelector('#donut-arcs');
    const tip = document.getElementById('donut-tip');
    const donutWrap = document.getElementById('donut-byaccount');

    const cx = 120, cy = 120, rOuter = 85, thickness = 10, rInner = rOuter - thickness;
    const padAngle = 0.03; // ~1.7° de espaço entre segmentos
    let start = 0;

    // pegue min e max dos valores para normalizar o contraste
    const vals = data.map(d => d.value);
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);

    data.forEach((d, i) => {
        const frac = d.value / total;
        const end = start + frac * Math.PI * 2;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'seg');

        // --- Cálculo da opacidade conforme o valor ---
        const vals = data.map(d => d.value);
        const minVal = Math.min(...vals);
        const maxVal = Math.max(...vals);
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
    function brl(n) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n); }
    function annularSector(cx, cy, rOut, rIn, a0, a1) {
        if (a1 < a0) { const t = a0; a0 = a1; a1 = t; }
        // ângulos a partir do topo (−90°)
        const p0 = polar(cx, cy, rOut, a0), p1 = polar(cx, cy, rOut, a1);
        const p2 = polar(cx, cy, rIn, a1), p3 = polar(cx, cy, rIn, a0);
        const large = (a1 - a0) > Math.PI ? 1 : 0;
        return [
            'M', p0.x, p0.y,
            'A', rOut, rOut, 0, large, 1, p1.x, p1.y,
            'L', p2.x, p2.y,
            'A', rIn, rIn, 0, large, 0, p3.x, p3.y,
            'Z'
        ].join(' ');
    }
    function polar(cx, cy, r, ang) { // ang em radianos
        const a = ang - Math.PI / 2; // começa no topo
        return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    }
})();