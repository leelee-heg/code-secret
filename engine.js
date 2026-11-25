(function (root) {
  'use strict';
  const palette = Object.freeze(['rouge', 'bleu', 'vert', 'jaune', 'orange', 'violet']);
  const reference = 'code-couleurs-1.0';
  function validate(guess) {
    if (!Array.isArray(guess) || guess.length !== 4 || Array.from(guess).some(c => c === null || c === undefined || c === '')) {
      return 'Choisissez une couleur pour chacun des quatre emplacements.';
    }
    if (guess.some(c => !palette.includes(c))) {
      return 'Couleur non autorisée. Choisissez : rouge, bleu, vert, jaune, orange ou violet.';
    }
    return null;
  }
  function score(secret, guess) {
    let bienPlacees = 0;
    const remainingSecret = {}, remainingGuess = {};
    for (let i = 0; i < 4; i++) {
      if (secret[i] === guess[i]) bienPlacees++;
      else {
        remainingSecret[secret[i]] = (remainingSecret[secret[i]] || 0) + 1;
        remainingGuess[guess[i]] = (remainingGuess[guess[i]] || 0) + 1;
      }
    }
    const malPlacees = palette.reduce((n, c) => n + Math.min(remainingSecret[c] || 0, remainingGuess[c] || 0), 0);
    return { bienPlacees, malPlacees };
  }
  function randomColor() {
    const buffer = new Uint32Array(1);
    do { root.crypto.getRandomValues(buffer); } while (buffer[0] >= 4294967292);
    return palette[buffer[0] % 6];
  }
  function createGame(pickColor = randomColor, { autoStart = true, revealSolution = true } = {}) {
    let secret, history = [], status = 'non_demarree';
    function snapshot() {
      return {
        reference, palette: [...palette], status, essais: history.length,
        restants: 10 - history.length,
        historique: history.map(row => ({ proposition: [...row.proposition], ...row.indice })),
        solution: revealSolution && (status === 'gagnee' || status === 'perdue') ? [...secret] : null
      };
    }
    function nouvellePartie(imposedSecret) {
      const next = arguments.length ? [...imposedSecret] : Array.from({ length: 4 }, () => pickColor());
      if (validate(next)) throw new Error('Générateur de couleurs invalide.');
      secret = next; history = []; status = 'en_cours';
      return snapshot();
    }
    function proposer(guess) {
      if (status !== 'en_cours') return { ok: false, erreur: 'La partie est terminée. Lancez une nouvelle partie.', partie: snapshot() };
      const erreur = validate(guess);
      if (erreur) return { ok: false, erreur, partie: snapshot() };
      const indice = score(secret, guess);
      history.push({ proposition: [...guess], indice });
      if (indice.bienPlacees === 4) status = 'gagnee';
      else if (history.length === 10) status = 'perdue';
      return { ok: true, partie: snapshot() };
    }
    if (autoStart) nouvellePartie();
    return Object.freeze({ etat: snapshot, proposer, nouvellePartie });
  }
  root.CodeCouleurs = Object.freeze({ reference, palette, createGame });
})(globalThis);
