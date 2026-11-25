(function (root) {
  'use strict';
  const engine = root.CodeCouleurs;
  const statuses = { non_demarree: 'not-started', en_cours: 'playing', gagnee: 'won', perdue: 'lost' };
  function codeError(value) {
    if (!Array.isArray(value) || Array.from({ length: value.length }, (_, i) =>
      !Object.hasOwn(value, i) || typeof value[i] !== 'string').some(Boolean)) {
      return { code: 'invalid-type', message: 'La proposition doit être un tableau complet de chaînes de caractères.' };
    }
    if (value.length !== 4) return { code: 'invalid-length', message: 'Choisissez une couleur pour chacun des quatre emplacements.' };
    if (value.some(color => !engine.palette.includes(color))) {
      return { code: 'invalid-color', message: 'Couleur non autorisée : choisissez rouge, bleu, vert, jaune, orange ou violet.' };
    }
    return null;
  }
  function createSession({ testMode = false, pickColor } = {}) {
    const game = engine.createGame(pickColor, { autoStart: !testMode, revealSolution: !testMode });
    const listeners = new Set();
    let lastError = null;
    function getState() {
      const current = game.etat();
      const history = current.historique.map(row => ({
        guess: [...row.proposition], result: { wellPlaced: row.bienPlacees, misplaced: row.malPlacees }
      }));
      const last = history.at(-1);
      return {
        status: statuses[current.status], attempts: current.essais, history,
        lastGuess: last ? [...last.guess] : null,
        lastResult: last ? { ...last.result } : null,
        lastError: lastError ? { ...lastError } : null
      };
    }
    function notify(action) { listeners.forEach(listener => listener(action)); }
    const api = Object.freeze({
      version: '0.2',
      getConfig() {
        return { apiVersion: '0.2', rulesVersion: engine.reference, secretLength: 4,
          maxAttempts: 10, allowDuplicates: true, colors: [...engine.palette] };
      },
      getState,
      async startGame(options = {}) {
        const prototype = options !== null && typeof options === 'object' ? Object.getPrototypeOf(options) : undefined;
        const ordinary = prototype === null || (prototype !== undefined &&
          Object.getPrototypeOf(prototype) === null && Object.hasOwn(prototype, 'constructor') &&
          prototype.constructor.name === 'Object');
        let error = !ordinary || Reflect.ownKeys(options).some(key => key !== 'secret')
          ? { code: 'invalid-options', message: 'Les options doivent être un objet contenant uniquement la clé facultative secret.' }
          : null;
        const imposed = !error && Object.hasOwn(options, 'secret');
        if (!error && imposed) error = codeError(options.secret);
        if (error) throw Object.assign(new Error(error.message), { code: error.code });
        if (imposed) game.nouvellePartie(options.secret);
        else game.nouvellePartie();
        lastError = null;
        notify('start');
        return getState();
      },
      async submitGuess(guess) {
        const state = getState();
        lastError = state.status === 'not-started'
          ? { code: 'game-not-started', message: 'Commencez une nouvelle partie avant de proposer des couleurs.' }
          : state.status !== 'playing'
            ? { code: 'game-finished', message: 'La partie est terminée. Lancez une nouvelle partie.' }
            : codeError(guess);
        if (!lastError) {
          const result = game.proposer(guess);
          if (!result.ok) throw new Error(result.erreur);
        }
        notify('guess');
        return getState();
      }
    });
    return Object.freeze({
      api,
      getViewState: () => ({ ...getState(), solution: game.etat().solution }),
      subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
    });
  }
  root.CodeSecretSession = Object.freeze({ createSession });
})(globalThis);
