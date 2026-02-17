// Combined, page-safe script for BrasilprevXPoupanca
(function () {
  // Taxas e configurações (valores fixos usados nas duas páginas)
  const TAXA_POUPANCA = 0.0067; // 0,67% a.m.
  const TAXA_BRASILPREV = 0.012; // 1,20% a.m.
  const IR_BRASILPREV = 0.15; // 15% sobre o rendimento

  const TAXA_CDB = 0.011507; // 1,1507% a.m. (apenas presente em index.html)
  const IR_CDB = 0.225; // exemplo de IR usado no index.html

  const fmtBRL = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Elementos compartilhados (podem ser null dependendo da página)
  const input = document.getElementById('valorInput');
  if (!input) return; // nada a fazer se o campo principal não existir

  const poupancaRendimentoEl = document.getElementById('poupancaRendimento');
  const poupancaTotalEl = document.getElementById('poupancaTotal');

  const brasilprevBrutoEl = document.getElementById('brasilprevBruto');
  const brasilprevLiquidoEl = document.getElementById('brasilprevLiquido');
  const brasilprevTotalEl = document.getElementById('brasilprevTotal');
  const diferencaRendEl = document.getElementById('diferencaRend');

  // Elementos específicos do index.html (CDB)
  const cdbBrutoEl = document.getElementById('cdbBruto');
  const cdbLiquidoEl = document.getElementById('cdbLiquido');
  const cdbTotalEl = document.getElementById('cdbTotal');
  const cdbDiffEl = document.getElementById('cdbDiff');

  // Utilitários
  const onlyDigits = (s) => (s || '').toString().replace(/\D/g, '');
  const centsToNumber = (c) => (c || 0) / 100;

  function getPrincipal() {
    const digits = onlyDigits(input.value);
    return centsToNumber(parseInt(digits || '0', 10));
  }

  function formatInput() {
    const digits = onlyDigits(input.value);
    const cents = digits ? parseInt(digits, 10) : 0;
    input.value = fmtBRL.format(cents / 100);
  }

  function updateColor(el, v) {
    if (!el) return;
    el.classList.remove('diff-positive', 'diff-negative', 'muted');
    if (v > 0) el.classList.add('diff-positive');
    else if (v < 0) el.classList.add('diff-negative');
    else el.classList.add('muted');
  }

  function safeSetText(el, value) {
    if (!el) return;
    el.textContent = fmtBRL.format(value);
  }

  function recalcular() {
    const principal = getPrincipal();

    // Poupança
    const rendPoup = principal * TAXA_POUPANCA;
    const totalPoup = principal + rendPoup;

    // Brasilprev
    const brPrevBruto = principal * TAXA_BRASILPREV;
    const brPrevLiq = brPrevBruto * (1 - IR_BRASILPREV);
    const brPrevTotal = principal + brPrevLiq;
    const diffPrev = brPrevLiq - rendPoup;

    // CDB (apenas se elementos existirem)
    const cdbBruto = principal * TAXA_CDB;
    const cdbLiq = cdbBruto * (1 - IR_CDB);
    const cdbTotal = principal + cdbLiq;
    const diffCdb = cdbLiq - rendPoup;

    // Atualiza UI somente onde houver elementos
    safeSetText(poupancaRendimentoEl, rendPoup);
    safeSetText(poupancaTotalEl, totalPoup);

    safeSetText(brasilprevBrutoEl, brPrevBruto);
    safeSetText(brasilprevLiquidoEl, brPrevLiq);
    safeSetText(brasilprevTotalEl, brPrevTotal);
    if (diferencaRendEl) diferencaRendEl.textContent = fmtBRL.format(diffPrev);
    updateColor(diferencaRendEl, diffPrev);

    safeSetText(cdbBrutoEl, cdbBruto);
    safeSetText(cdbLiquidoEl, cdbLiq);
    safeSetText(cdbTotalEl, cdbTotal);
    if (cdbDiffEl) cdbDiffEl.textContent = fmtBRL.format(diffCdb);
    updateColor(cdbDiffEl, diffCdb);
  }

  // Eventos
  input.addEventListener('input', () => {
    formatInput();
    recalcular();
  });

  // Comportamento extra presente em brasilprev.html: manter cursor no final ao focar
  input.addEventListener('focus', () => {
    setTimeout(() => {
      const val = input.value;
      input.value = '';
      input.value = val;
    }, 0);
  });

  // Inicializa
  input.value = fmtBRL.format(0);
  recalcular();

  // --- Export / captura em PNG ---
  // Expose a function to capture the three cards (poupança, Brasilprev, CDB) as a single PNG.
  // Usage: await window.captureCardsAsPNG('comparativo.png')
  async function loadScriptOnce(src) {
    if (window.html2canvas) return window.html2canvas;
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => {
        // html2canvas exposes itself as window.html2canvas
        if (window.html2canvas) resolve(window.html2canvas);
        else if (window.html2canvas === undefined && window.html2canvas === null) resolve(window.html2canvas);
        else resolve(window.html2canvas);
      };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function captureCardsAsPNG(filename = 'comparativo.png') {
    // Find the card containers by locating known ID elements and walking up to .card
    const inputCard = input ? input.closest('.card') : null;
    const poupancaCard = poupancaRendimentoEl ? poupancaRendimentoEl.closest('.card') : null;
    const brasilprevCard = brasilprevBrutoEl ? brasilprevBrutoEl.closest('.card') : null;
    const cdbCard = cdbBrutoEl ? cdbBrutoEl.closest('.card') : null;

    // Include the input card first (so the input field appears in the image)
    const cards = [inputCard, poupancaCard, brasilprevCard, cdbCard].filter(Boolean);
    if (cards.length === 0) throw new Error('No cards found to capture.');

    // Ensure html2canvas is available (load from CDN if necessary)
    if (!window.html2canvas) {
      await loadScriptOnce('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
      // small pause to ensure library registered
      await new Promise((r) => setTimeout(r, 50));
    }

    // Create an offscreen wrapper and append clones of the cards (preserve styling via CSS)
    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.left = '-9999px';
    wrapper.style.top = '0';
    wrapper.style.background = '#ffffff';
    // vertical layout to be safe on narrow viewports; can be changed to row
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '12px';
    wrapper.style.padding = '12px';
    // Copy computed width to preserve look (optional)

    cards.forEach((card) => {
      const clone = card.cloneNode(true);
      // Remove helper/instruction text under inputs (class 'form-text') from the clone
      const helpers = clone.querySelectorAll('.form-text, .small, .text-muted');
      helpers.forEach(h => h.remove());
      // ensure the clone uses same box sizing and background
      clone.style.boxSizing = 'border-box';
      wrapper.appendChild(clone);
    });

    document.body.appendChild(wrapper);

    try {
      const canvas = await window.html2canvas(wrapper, { backgroundColor: null, scale: 1 });
      const dataUrl = canvas.toDataURL('image/png');

      // Trigger download
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename || 'comparativo.png';
      document.body.appendChild(a);
      a.click();
      a.remove();

      return dataUrl;
    } finally {
      // Clean up the wrapper
      wrapper.remove();
    }
  }

  // Expose to window for manual usage from console or page UI
  window.captureCardsAsPNG = captureCardsAsPNG;

  // Wire the export button on index.html (if present)
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      try {
        exportBtn.disabled = true;
        const prev = exportBtn.textContent;
        exportBtn.textContent = 'Gerando...';
        await captureCardsAsPNG();
        exportBtn.textContent = prev;
      } catch (err) {
        console.error('Erro ao gerar imagem:', err);
        alert('Erro ao gerar imagem: ' + (err && err.message ? err.message : err));
      } finally {
        exportBtn.disabled = false;
      }
    });
  }

})();
