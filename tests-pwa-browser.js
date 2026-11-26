'use strict';
document.getElementById('run-pwa').addEventListener('click', async event => {
  event.currentTarget.disabled = true;
  const output = document.getElementById('pwa-output');
  const check = (value,message) => { if(!value) throw new Error(message); output.textContent += 'OK : '+message+'\n'; };
  try {
    const response = await fetch('./manifest.webmanifest', {cache:'no-store'});
    check(response.ok,'Manifeste disponible');
    const manifest = await response.json();
    check(manifest.name==='Code secret' && manifest.display==='standalone','Nom Code secret et affichage autonome');
    for (const icon of manifest.icons) {
      const image = new Image(); image.src=icon.src; await image.decode();
      check(`${image.naturalWidth}x${image.naturalHeight}`===icon.sizes,'Icône lisible : '+icon.src+' ('+icon.sizes+')');
    }
    check('serviceWorker' in navigator && isSecureContext,'Service worker disponible en contexte sécurisé');
    await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
    const registration = await navigator.serviceWorker.ready;
    check(Boolean(registration.active),'Véritable service worker actif');
    const name=`code-secret:${registration.scope}:0.3.0`;
    check((await caches.keys()).includes(name),'Cache versionné propre à ce jeu');
    const cache=await caches.open(name);
    for(const file of ['./index.html','./style.css?v=0.3.0','./game.js?v=0.2.0-accords','./engine.js?v=0.2.0','./api.js?v=0.2.0','./pwa.js?v=0.3.0','./assets/qr-code-secret.png']) {
      check(Boolean(await cache.match(new URL(file,registration.scope).href)),'Ressource présente dans le cache : '+file);
    }
    output.textContent += '\nSUCCÈS : ressources PWA prêtes. Installation native et rechargement sans réseau à vérifier sur appareil.\n';
  } catch(error) { output.textContent+='\nÉCHEC OU NON VÉRIFIÉ : '+error.message; }
});
