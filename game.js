'use strict';
(() => {
  const api = globalThis.CodeCouleurs;
  const game = api.createGame();
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
  api.palette.forEach(color => {
    const item = document.createElement('div'); item.className = 'palette-item';
    item.append(bead(color), document.createTextNode(labels[color])); $('palette').append(item);
  });
  for (let i = 0; i < 4; i++) {
    const label = document.createElement('label'); label.className = 'slot';
    const position = document.createElement('span'); position.className = 'position'; position.textContent = '0' + (i + 1);
    const preview = bead(null);
    const select = document.createElement('select'); select.setAttribute('aria-label', 'Couleur à la position ' + (i + 1));
    select.add(new Option('Choisir…', ''));
    api.palette.forEach(color => select.add(new Option(labels[color], color)));
    select.addEventListener('change', () => {
      preview.className = 'bead ' + (select.value || 'unselected');
      preview.textContent = select.value ? symbols[select.value] : '·';
      preview.setAttribute('aria-hidden', 'true');
      $('error').textContent = '';
    });
    label.append(position, preview, select); $('slots').append(label); selects.push(select);
  }
  function render(state) {
    const ended = state.status !== 'en_cours';
    $('turn').textContent = ended ? 'Partie terminée' : `Essai ${state.essais + 1} sur 10`;
    $('remaining').textContent = `${state.restants} essai${state.restants > 1 ? 's' : ''} restant${state.restants > 1 ? 's' : ''}`;
    $('history-count').textContent = `${state.essais} / 10`;
    $('inputs').disabled = ended; $('submit').disabled = ended;
    $('secret').replaceChildren(...(state.solution || [null, null, null, null]).map(c => bead(c, !c)));
    $('secret').setAttribute('aria-label', state.solution ? 'Solution : ' + state.solution.join(', ') : 'Quatre couleurs cachées');
    $('progress').replaceChildren(...Array.from({ length: 10 }, (_, i) => { const el = document.createElement('span'); el.className = i < state.essais ? 'used' : ''; return el; }));
    $('empty').hidden = state.essais > 0;
    $('history').replaceChildren();
    state.historique.forEach((row, index) => {
      const entry = document.createElement('div'); entry.className = 'history-row';
      const n = document.createElement('span'); n.className = 'row-number'; n.textContent = String(index + 1).padStart(2, '0');
      const colors = document.createElement('div'); colors.className = 'row-colors';
      colors.setAttribute('aria-label', row.proposition.join(', '));
      colors.append(...row.proposition.map(c => bead(c)));
      const hints = document.createElement('div'); hints.className = 'row-hints';
      const exact = document.createElement('span'); exact.textContent = `${row.bienPlacees} bien placée${row.bienPlacees > 1 ? 's' : ''}`;
      const misplaced = document.createElement('span'); misplaced.textContent = `${row.malPlacees} mal placée${row.malPlacees > 1 ? 's' : ''}`;
      hints.append(exact, misplaced); entry.append(n, colors, hints); $('history').append(entry);
    });
    $('result').hidden = !ended;
    if (ended) $('result').textContent = state.status === 'gagnee' ? `Code percé ! Bravo, vous avez gagné en ${state.essais} essai${state.essais > 1 ? 's' : ''}.` : 'Les dix essais sont écoulés. Le code est révélé ci-dessus. Une nouvelle partie ?';
  }
  $('guess-form').addEventListener('submit', event => {
    event.preventDefault();
    const result = game.proposer(selects.map(s => s.value));
    $('error').textContent = result.ok ? '' : result.erreur;
    if (!result.ok) { if (result.partie.status === 'en_cours') (selects.find(s => !s.value) || selects[0]).focus(); return; }
    render(result.partie);
    if (result.partie.status === 'en_cours') {
      $('result').hidden = false;
      const last = result.partie.historique.at(-1);
      $('result').textContent = `Essai ${result.partie.essais} : ${last.bienPlacees} bien placées, ${last.malPlacees} mal placées.`;
    }
  });
  $('restart').addEventListener('click', () => {
    selects.forEach(s => { s.value = ''; s.dispatchEvent(new Event('change')); });
    $('error').textContent = ''; $('result').textContent = '';
    render(game.nouvellePartie()); selects[0].focus();
  });
  render(game.etat());
})();
