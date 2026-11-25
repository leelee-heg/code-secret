// Exécuter avec Node.js : node tests.cjs
const assert = require('node:assert/strict');
require('./engine.js');
const api = globalThis.CodeCouleurs;
const [r, b, v, j] = api.palette;
function make(secret) { let i = 0; return api.createGame(() => secret[i++ % 4]); }
let game = make([r, r, b, v]);
assert.equal(game.etat().solution, null);
let before = JSON.stringify(game.etat());
for (const bad of [[], [r,b,v], [r,b,v,null], [r,b,v,'pink'], ['Rouge',b,v,j], Array(4)]) {
  assert.equal(game.proposer(bad).ok, false);
  assert.equal(JSON.stringify(game.etat()), before);
}
let result = game.proposer([r,b,r,r]);
assert.equal(result.partie.historique[0].bienPlacees, 1);
assert.equal(result.partie.historique[0].malPlacees, 2);
let copy = game.etat();
copy.historique[0].proposition[0] = 'orange';
assert.equal(game.etat().historique[0].proposition[0], r);
// Comparaison de 6 561 paires avec un calcul indépendant des occurrences.
const combinations = Array.from({length:81}, (_, n) => Array.from({length:4}, (_, i) => [r,b,v][Math.floor(n / 3 ** i) % 3]));
for (const secret of combinations) for (const guess of combinations) {
  const row = make(secret).proposer(guess).partie.historique[0];
  const exact = secret.reduce((sum, c, i) => sum + (c === guess[i]), 0);
  const total = [r,b,v].reduce((sum, c) => sum + Math.min(secret.filter(x => x === c).length, guess.filter(x => x === c).length), 0);
  assert.equal(row.bienPlacees, exact);
  assert.equal(row.malPlacees, total - exact);
}
game = make([r,r,b,v]);
for (let i = 0; i < 9; i++) game.proposer([j,j,j,j]);
assert.equal(game.proposer([r,r,b,v]).partie.status, 'gagnee');
before = JSON.stringify(game.etat());
assert.equal(game.proposer([j,j,j,j]).ok, false);
assert.equal(JSON.stringify(game.etat()), before);
game.nouvellePartie();
assert.equal(game.etat().essais, 0);
assert.equal(game.etat().historique.length, 0);
assert.equal(game.etat().solution, null);
for (let i = 0; i < 10; i++) game.proposer([j,j,j,j]);
assert.equal(game.etat().status, 'perdue');
before = JSON.stringify(game.etat());
assert.equal(game.proposer([r,r,b,v]).ok, false);
assert.equal(JSON.stringify(game.etat()), before);
console.log('Tous les tests passent, dont 6 561 paires de combinaisons.');
require('./api.js');
require('./api-checks.js');
const session = globalThis.CodeSecretSession.createSession({testMode:true});
globalThis.runCodeSecretChecks(session.api, name => console.log('OK API : ' + name))
  .then(count => console.log(`${count} groupes de contrôles API 0.2 réussis.`))
  .catch(error => { console.error(error); process.exitCode = 1; });
