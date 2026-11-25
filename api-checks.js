// Contrôles communs exécutables dans Node et dans le navigateur, sans dépendance.
(function (root) {
  'use strict';
  root.runCodeSecretChecks = async function (api, report = () => {}) {
    const equal = (actual, expected) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Obtenu ${JSON.stringify(actual)} ; attendu ${JSON.stringify(expected)}`);
      }
    };
    const check = (condition, message) => { if (!condition) throw new Error(message); };
    let count = 0;
    async function test(name, run) { await run(); count++; report(name); }
    const colors = ['rouge', 'bleu', 'vert', 'jaune', 'orange', 'violet'];
    const [r, b, v, j, o, vi] = colors;
    const secret = [r, r, b, v], allRed = [r,r,r,r], allBlue = [b,b,b,b];
    const empty = { status: 'not-started', attempts: 0, history: [], lastGuess: null, lastResult: null, lastError: null };
    const data = state => { const { lastError, ...rest } = state; return rest; };
    async function refusal(guess, code) {
      const before = data(api.getState());
      const promise = api.submitGuess(guess);
      check(Object.prototype.toString.call(promise) === '[object Promise]', 'submitGuess doit renvoyer une Promise');
      const state = await promise;
      equal(data(state), before); equal(state.lastError.code, code);
      check(typeof state.lastError.message === 'string' && state.lastError.message.length > 0, 'Message de refus manquant');
      equal(api.getState(), state);
    }
    await test('État initial, configuration et getters sans effet', async () => {
      equal(api.version, '0.2'); equal(api.getState(), empty);
      equal(api.getConfig(), { apiVersion:'0.2', rulesVersion:'code-couleurs-1.0', secretLength:4, maxAttempts:10, allowDuplicates:true, colors });
      const config = api.getConfig(); config.colors[0] = 'invalide';
      equal(api.getConfig().colors, colors); equal(api.getState(), empty);
    });
    await test('Refus avant démarrage, prioritaire sur le type', () => refusal(null, 'game-not-started'));
    await test('Démarrages invalides atomiques et priorités', async () => {
      const badCases = [[null,'invalid-options'], [[], 'invalid-options'], ['x','invalid-options'], [42,'invalid-options'], [new Date(),'invalid-options'],
        [{ extra:true, secret:null },'invalid-options'], [{secret:undefined},'invalid-type'], [{secret:null},'invalid-type'],
        [{secret:[r,null]},'invalid-type'], [{secret:Array(4)},'invalid-type'], [{secret:[r]},'invalid-length'], [{secret:[r,b,v,'Violet']},'invalid-color']];
      for (const [options, code] of badCases) {
        const before = api.getState();
        const promise = api.startGame(options); check(Object.prototype.toString.call(promise) === '[object Promise]', 'startGame doit renvoyer une Promise');
        let error;
        try { await promise; } catch (e) { error = e; }
        check(Object.prototype.toString.call(error) === '[object Error]', 'startGame doit rejeter une Error'); equal(error.code, code);
        check(error.message.length > 0, 'Message de démarrage manquant'); equal(api.getState(), before);
      }
    });
    await test('Démarrage imposé, copie du secret et absence de révélation', async () => {
      const input = [...secret]; await api.startGame({secret:input}); input.fill(j);
      equal(api.getState(), {...empty,status:'playing'});
      equal((await api.submitGuess(secret)).status, 'won');
      check(!('secret' in api.getState()) && !('solution' in api.getState()), 'Secret exposé');
    });
    const examples = [
      [[r,b,v,j],[r,v,b,o],1,2], [[r,b,v,j],[o,vi,r,b],0,2], [[r,b,v,j],[b,r,j,v],0,4],
      [[r,b,v,j],[r,b,j,v],2,2], [[r,b,v,j],[r,b,v,j],4,0],
      [secret,[r,r,r,r],2,0], [secret,[r,b,r,v],2,2], [secret,secret,4,0], [secret,[r,b,r,r],1,2]
    ];
    for (let i=0; i<examples.length; i++) await test(`T${String(i+1).padStart(2,'0')} : indices et historique`, async () => {
      const [s, guess, wellPlaced, misplaced] = examples[i]; await api.startGame({secret:s});
      const state = await api.submitGuess(guess);
      equal(state.attempts,1); equal(state.status,wellPlaced===4?'won':'playing'); equal(state.lastError,null);
      equal(state.history,[{guess,result:{wellPlaced,misplaced}}]); equal(state.lastGuess,guess); equal(state.lastResult,{wellPlaced,misplaced});
    });
    await test('Refus de saisie : type, longueur, couleur et priorités', async () => {
      await api.startGame({secret}); await api.submitGuess([r,b,r,r]);
      for (const guess of [undefined,null,{},'rouge',Array(4),[r,null],[r,2,v,j],[r,undefined,v,j]]) await refusal(guess,'invalid-type');
      for (const guess of [[],[r],[r,b,v,j,o],['inconnue']]) await refusal(guess,'invalid-length');
      for (const guess of [[r,b,v,'Violet'],[r,b,v,'violet '],[r,b,v,'purple'],[r,b,v,'']]) await refusal(guess,'invalid-color');
      const before = api.getState(); api.getConfig(); api.getState(); equal(api.getState(),before);
      equal((await api.submitGuess([r,b,r,r])).lastError,null);
    });
    await test('Copies indépendantes des propositions, états et indices', async () => {
      await api.startGame({secret}); const guess=[r,b,r,r]; const state=await api.submitGuess(guess);
      const before=JSON.stringify(api.getState()); guess.fill(j); state.history[0].guess.fill(o);
      state.history[0].result.wellPlaced=99; state.lastGuess.fill(vi); state.lastResult.misplaced=99; state.history.push({});
      equal(JSON.stringify(api.getState()),before);
      const refused=await api.submitGuess([]); refused.lastError.code='modifié'; equal(api.getState().lastError.code,'invalid-length');
    });
    await test('Refus à neuf essais puis victoire au dixième', async () => {
      await api.startGame({secret:allRed});
      for(let i=0;i<9;i++) await api.submitGuess(allBlue);
      await refusal([r],'invalid-length'); equal(api.getState().attempts,9);
      const state=await api.submitGuess(allRed); equal(state.status,'won'); equal(state.attempts,10); equal(state.history.length,10); equal(state.lastError,null);
      await refusal(null,'game-finished'); await refusal(allBlue,'game-finished');
    });
    await test('Redémarrage après victoire et défaite après dix erreurs', async () => {
      equal(await api.startGame({secret:allRed}),{...empty,status:'playing'});
      for(let i=0;i<10;i++) await api.submitGuess(allBlue);
      equal(api.getState().status,'lost'); equal(api.getState().attempts,10); equal(api.getState().lastResult,{wellPlaced:0,misplaced:0});
      await refusal(null,'game-finished'); await refusal(allRed,'game-finished');
      const before=api.getState(); try { await api.startGame({secret:[]}); } catch(e) { equal(e.code,'invalid-length'); }
      equal(api.getState(),before);
    });
    await test('Redémarrage aléatoire : sans argument, undefined et objet vide', async () => {
      for(const start of [()=>api.startGame(),()=>api.startGame(undefined),()=>api.startGame({})]) {
        equal(await start(),{...empty,status:'playing'});
      }
    });
    return count;
  };
})(globalThis);
