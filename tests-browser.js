'use strict';
(() => {
  const frame = document.getElementById('test-game');
  const normal = document.getElementById('normal-game');
  const button = document.getElementById('run');
  const output = document.getElementById('output');
  let loaded = 0;
  for (const iframe of [frame, normal]) iframe.addEventListener('load', () => {
    if (++loaded === 2) { button.disabled = false; output.textContent = 'Prêt.'; }
  });
  button.addEventListener('click', async () => {
    button.disabled = true; output.textContent = '';
    const doc = frame.contentDocument, api = frame.contentWindow.codeSecretTest;
    const assert = (condition, message) => { if (!condition) throw new Error(message); };
    const log = message => { output.textContent += 'OK : ' + message + '\n'; };
    try {
      assert(!('codeSecretTest' in normal.contentWindow), 'API exposée en mode normal');
      assert(normal.contentDocument.getElementById('turn').textContent === 'Essai 1 sur 10', 'Mode normal non démarré');
      log('Mode normal sans API, partie immédiatement jouable');
      function compareScreen(state) {
        assert(doc.getElementById('history-count').textContent === `${state.attempts} / 10`, 'Compteur API/interface différent');
        const rows = [...doc.querySelectorAll('.history-row')];
        assert(rows.length === state.history.length, 'Nombre de lignes différent');
        rows.forEach((row, i) => {
          assert(row.querySelector('.row-colors').getAttribute('aria-label') === state.history[i].guess.join(', '), 'Couleurs affichées différentes');
          const hints = row.querySelectorAll('.row-hints span');
          assert(hints[0].textContent.startsWith(`${state.history[i].result.wellPlaced} `), 'Bien placées différentes');
          assert(hints[1].textContent.startsWith(`${state.history[i].result.misplaced} `), 'Mal placées différentes');
        });
        assert(doc.getElementById('submit').disabled === (state.status !== 'playing'), 'Disponibilité de validation incorrecte');
        assert(doc.getElementById('secret').textContent === '????', 'Code révélé en mode test');
        if(state.lastError && state.status === 'playing') assert(doc.getElementById('error').textContent === state.lastError.message, 'Refus non affiché');
      }
      const checkedApi = {
        version: api.version, getConfig: api.getConfig, getState: api.getState,
        async startGame(...args) { const s=await api.startGame(...args); compareScreen(s); return s; },
        async submitGuess(...args) { const s=await api.submitGuess(...args); compareScreen(s); return s; }
      };
      compareScreen(api.getState());
      const count = await runCodeSecretChecks(checkedApi, log);
      log(`${count} groupes API sur la véritable partie de l’interface`);
      await api.startGame({secret:['rouge','rouge','bleu','vert']});
      const selects = [...doc.querySelectorAll('select')];
      doc.getElementById('submit').click();
      assert(api.getState().lastError.code === 'invalid-color' && api.getState().attempts===0, 'Proposition UI incomplète non refusée');
      log('Proposition UI incomplète refusée sans essai consommé');
      const guess = ['rouge','bleu','rouge','rouge'];
      selects.forEach((s,i) => { s.value=guess[i]; s.dispatchEvent(new frame.contentWindow.Event('change')); });
      doc.getElementById('submit').click();
      assert(api.getState().attempts === 1, 'Action UI absente de getState');
      assert(api.getState().lastResult.wellPlaced === 1 && api.getState().lastResult.misplaced === 2, 'Score UI différent');
      log('Proposition saisie dans l’interface relue dans getState : 1/2, un essai');
      const state = await api.submitGuess(guess);
      assert(doc.getElementById('history-count').textContent === '2 / 10', 'Compteur UI différent de l’API');
      assert(doc.querySelectorAll('.history-row').length === state.history.length, 'Historique UI différent');
      assert(doc.querySelector('.row-hints').textContent.includes('1 bien placée'), 'Indices non affichés');
      log('Proposition API affichée dans le compteur et l’historique');
      await api.submitGuess([]);
      assert(doc.getElementById('error').textContent.length > 0, 'Refus API non expliqué à l’écran');
      const before = doc.body.innerHTML;
      try { await api.startGame({secret:null}); } catch (error) { assert(error.code==='invalid-type','Erreur inattendue'); }
      assert(doc.body.innerHTML === before, 'Démarrage invalide modifie l’interface');
      log('Refus visible et démarrage invalide sans modification de l’interface');
      doc.getElementById('restart').click();
      assert(api.getState().attempts===0 && api.getState().lastError===null, 'Nouvelle partie UI non partagée');
      assert(selects.every(s => s.value===''), 'Sélecteurs non vidés');
      log('Nouvelle partie UI remet la même partie à zéro');
      await api.startGame({secret:['rouge','rouge','rouge','rouge']});
      for(let i=0;i<10;i++) await api.submitGuess(['bleu','bleu','bleu','bleu']);
      assert(doc.getElementById('submit').disabled && doc.querySelectorAll('.history-row').length===10,'Fin non reflétée dans l’interface');
      assert(!doc.getElementById('result').textContent.includes('révélé'),'Révélation en mode test');
      assert(doc.getElementById('secret').textContent==='????','Code affiché après défaite en mode test');
      log('Défaite visible à dix essais, validation bloquée et code non révélé');
      await api.startGame({secret:['rouge','rouge','rouge','rouge']});
      await api.submitGuess(['rouge','rouge','rouge','rouge']);
      assert(doc.getElementById('result').textContent.includes('gagné') && doc.getElementById('submit').disabled,'Victoire non affichée');
      log('Victoire API affichée et validation bloquée');
      await api.startGame();
      for (const width of [390,320]) {
        frame.style.width=width+'px';
        assert(doc.documentElement.scrollWidth <= doc.documentElement.clientWidth, 'Débordement horizontal à '+width+'px');
        assert(selects.length===4 && selects.every(s => s.getBoundingClientRect().width>0), 'Sélecteurs indisponibles');
        log('Interface sans débordement horizontal à '+width+'px');
      }
      frame.style.width='100%';
      for (const [secret, guess, expected] of [
        [['rouge','rouge','rouge','rouge'], ['bleu','bleu','bleu','bleu'], 'Essai 1 : 0 bien placée, 0 mal placée.'],
        [['rouge','rouge','bleu','vert'], ['rouge','bleu','rouge','vert'], 'Essai 1 : 2 bien placées, 2 mal placées.'],
        [['rouge','bleu','vert','jaune'], ['rouge','orange','orange','bleu'], 'Essai 1 : 1 bien placée, 1 mal placée.']
      ]) {
        await api.startGame({secret}); await api.submitGuess(guess);
        assert(doc.getElementById('result').textContent === expected, 'Accord incorrect : '+doc.getElementById('result').textContent);
      }
      log('Accords du résumé vérifiés pour 0/0, 2/2 et 1/1');
      output.textContent += '\nSUCCÈS : API et interface synchronisées.\n';
    } catch (error) { output.textContent += '\nÉCHEC : ' + error.stack; }
  });
})();
