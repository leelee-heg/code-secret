'use strict';
(() => {
  const params = new URLSearchParams(location.search);
  const panel = document.getElementById('installation');
  const dialog = document.getElementById('install-dialog');
  const openButton = document.getElementById('install-open');
  const nativeButton = document.getElementById('install-native');
  const message = document.getElementById('install-message');
  const offlineStatus = document.getElementById('offline-status');
  const displayMode = window.matchMedia('(display-mode: standalone)');
  let installPrompt = null;
  const standalone = () => displayMode.matches || navigator.standalone === true;

  // Le banc de test embarque aussi le jeu normal : ne pas y enregistrer de worker.
  if (params.get('test') === '1' || window.self !== window.top) {
    panel.hidden = true;
    return;
  }
  function refreshInstallState() {
    const installed = standalone();
    nativeButton.hidden = installed || !installPrompt;
    openButton.textContent = installed ? 'Installer sur un autre appareil' : 'Installer l’application';
    message.textContent = installed
      ? 'Code secret est ouvert en mode application. Retrouvez-le depuis son icône.'
      : installPrompt
        ? 'Votre navigateur propose l’installation. Confirmez ensuite dans la fenêtre qui s’ouvre.'
        : 'Suivez les étapes correspondant à votre appareil. Si vous êtes dans un navigateur intégré, ouvrez d’abord ce lien dans Chrome, Edge ou Safari.';
  }
  function openGuide() {
    refreshInstallState();
    if (!dialog.open) dialog.showModal();
  }
  openButton.addEventListener('click', openGuide);
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    refreshInstallState();
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    nativeButton.hidden = true;
    message.textContent = 'Installation terminée. Retrouvez Code secret parmi vos applications.';
  });
  displayMode.addEventListener('change', refreshInstallState);
  nativeButton.addEventListener('click', async () => {
    if (!installPrompt) return;
    const prompt = installPrompt;
    installPrompt = null;
    nativeButton.hidden = true;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      message.textContent = choice.outcome === 'accepted'
        ? 'Installation demandée. Suivez les indications du navigateur pour la terminer.'
        : 'Installation annulée. Vous pouvez continuer à jouer et réessayer depuis le menu du navigateur.';
    } catch (error) {
      message.textContent = 'L’installation automatique n’est pas disponible ici. Utilisez les étapes ci-dessous.';
    }
  });
  refreshInstallState();
  if (params.get('installer') === '1') openGuide();

  if (!('serviceWorker' in navigator) || !window.isSecureContext || !/^https?:$/.test(location.protocol)) {
    offlineStatus.textContent = 'Pour installer le jeu, ouvrez son adresse publique avec une connexion Internet.';
    return;
  }
  offlineStatus.textContent = 'Préparation du jeu pour une utilisation hors connexion…';
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' });
      await navigator.serviceWorker.ready;
      offlineStatus.textContent = 'Jeu disponible hors connexion sur cet appareil. Une partie recommence à chaque ouverture.';
      function showUpdate() {
        if (registration.waiting) offlineStatus.textContent = 'Une mise à jour est prête. Fermez toutes les fenêtres du jeu, puis rouvrez-le pour en profiter.';
      }
      showUpdate();
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (worker) worker.addEventListener('statechange', showUpdate);
      });
    } catch (error) {
      offlineStatus.textContent = 'Le mode hors connexion n’a pas pu être préparé. Réessayez lors d’une prochaine ouverture avec Internet.';
    }
  });
})();
