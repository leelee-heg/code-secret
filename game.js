'use strict';
(() => {
  const testMode = new URLSearchParams(location.search).get('test') === '1';
  const session = globalThis.CodeSecretSession.createSession({ testMode });
  const game = session.api;
  const $ = id => document.getElementById(id);
  const labels = { rouge: 'Rouge', bleu: 'Bleu', vert: 'Vert', jaune: 'Jaune', orange: 'Orange', violet: 'Violet' };
  const symbols = { rouge: 'R', bleu: 'B', vert: 'V', jaune: 'J', orange: 'O', violet: 'Vi' };
  const selects = [];
  function bead(color, hidden = false) {
    const el = document.createElement('span');
    el.className = 'bead ' + (color || 'unselected');
    el.textContent = hidden ? '?' : (color ? symbols[color] : '·');
    if (color) el.setAttribute('aria-label', labels[color]);
    else el.setAttribute('aria-hidden', 'true');
    return el;
  }
  game.getConfig().colors.forEach(color => {
    const item = document.createElement('div'); item.className = 'palette-item';
    item.append(bead(color), document.createTextNode(labels[color])); $('palette').append(item);
  });
  for (let i = 0; i < 4; i++) {
    const label = document.createElement('label'); label.className = 'slot';
    const position = document.createElement('span'); position.className = 'position'; position.textContent = '0' + (i + 1);
    const preview = bead(null);
    const select = document.createElement('select'); select.setAttribute('aria-label', 'Couleur à la position ' + (i + 1));
    select.add(new Option('Choisir…', ''));
    game.getConfig().colors.forEach(color => select.add(new Option(labels[color], color)));
    select.addEventListener('change', () => {
      preview.className = 'bead ' + (select.value || 'unselected');
      preview.textContent = select.value ? symbols[select.value] : '·';
      preview.setAttribute('aria-hidden', 'true');
      $('error').textContent = '';
    });
    label.append(position, preview, select); $('slots').append(label); selects.push(select);
  }
  function render(state) {
    const ended = state.status === 'won' || state.status === 'lost';
    const inactive = state.status !== 'playing';
    const remaining = 10 - state.attempts;
    $('turn').textContent = state.status === 'not-started' ? 'Partie non démarrée' : ended ? 'Partie terminée' : `Essai ${state.attempts + 1} sur 10`;
    $('remaining').textContent = `${remaining} essai${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''}`;
    $('history-count').textContent = `${state.attempts} / 10`;
    $('inputs').disabled = inactive; $('submit').disabled = inactive;
    $('secret').replaceChildren(...(state.solution || [null, null, null, null]).map(c => bead(c, !c)));
    $('secret').setAttribute('aria-label', state.solution ? 'Solution : ' + state.solution.join(', ') : 'Quatre couleurs cachées');
    $('progress').replaceChildren(...Array.from({ length: 10 }, (_, i) => { const el = document.createElement('span'); el.className = i < state.attempts ? 'used' : ''; return el; }));
    $('empty').hidden = state.attempts > 0;
    $('history').replaceChildren();
    state.history.forEach((row, index) => {
      const entry = document.createElement('div'); entry.className = 'history-row';
      const n = document.createElement('span'); n.className = 'row-number'; n.textContent = String(index + 1).padStart(2, '0');
      const colors = document.createElement('div'); colors.className = 'row-colors';
      colors.setAttribute('aria-label', row.guess.join(', '));
      colors.append(...row.guess.map(c => bead(c)));
      const hints = document.createElement('div'); hints.className = 'row-hints';
      const exact = document.createElement('span'); exact.textContent = `${row.result.wellPlaced} bien placée${row.result.wellPlaced > 1 ? 's' : ''}`;
      const misplaced = document.createElement('span'); misplaced.textContent = `${row.result.misplaced} mal placée${row.result.misplaced > 1 ? 's' : ''}`;
      hints.append(exact, misplaced); entry.append(n, colors, hints); $('history').append(entry);
    });
    $('error').textContent = state.lastError ? state.lastError.message : '';
    $('result').hidden = !ended && !state.lastResult && state.status !== 'not-started';
    if (state.status === 'not-started') $('result').textContent = 'Mode test : cliquez sur « Nouvelle partie » ou appelez startGame pour commencer.';
    else if (ended) $('result').textContent = state.status === 'won' ? `Code percé ! Bravo, vous avez gagné en ${state.attempts} essai${state.attempts > 1 ? 's' : ''}.` : `Les dix essais sont écoulés. ${state.solution ? 'Le code est révélé ci-dessus. ' : ''}Une nouvelle partie ?`;
    else if (state.lastResult) $('result').textContent = `Essai ${state.attempts} : ${state.lastResult.wellPlaced} bien placées, ${state.lastResult.misplaced} mal placées.`;
  }
  $('guess-form').addEventListener('submit', async event => {
    event.preventDefault();
    const state = await game.submitGuess(selects.map(s => s.value));
    if (state.lastError && state.status === 'playing') (selects.find(s => !s.value) || selects[0]).focus();
  });
  session.subscribe(action => {
    if (action === 'start') selects.forEach(s => { s.value = ''; s.dispatchEvent(new Event('change')); });
    render(session.getViewState());
  });
  $('restart').addEventListener('click', async () => { await game.startGame(); selects[0].focus(); });
  render(session.getViewState());
  if (testMode) window.codeSecretTest = game;
})();
