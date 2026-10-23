(() => {
  const android = document.getElementById('install-android');
  const iphone = document.getElementById('install-iphone');
  const status = document.getElementById('install-status');
  let deferredPrompt;
  let androidSelected = false;
  const standalone = matchMedia('(display-mode: standalone)');
  const openApp = () => location.replace('./app.html');
  if (standalone.matches || navigator.standalone === true) { openApp(); return; }
  standalone.addEventListener('change', () => { if (standalone.matches) openApp(); });
  document.querySelectorAll('.install-url').forEach(link => { link.href = new URL('./', location.href).href; link.textContent = link.href; });
  function guide(platform) {
    for (const name of ['android', 'iphone']) {
      const selected = name === platform;
      document.getElementById(`${name}-guide`).hidden = !selected;
      document.getElementById(`install-${name}`).setAttribute('aria-expanded', String(selected));
    }
  }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    if (androidSelected) status.textContent = 'La instalación está disponible. Pulsa de nuevo Instalar en Android.';
  });
  android.addEventListener('click', async () => {
    androidSelected = true;
    guide('android');
    status.textContent = '';
    if (!deferredPrompt) return;
    const prompt = deferredPrompt;
    deferredPrompt = null;
    android.disabled = true;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      status.textContent = choice.outcome === 'accepted' ? 'Confirma la instalación y abre STR-IG Prueba desde el icono de tu móvil.' : 'Puedes volver a intentarlo desde el menú de Chrome.';
    } catch {
      status.textContent = 'Sigue los pasos de Chrome para instalar la app.';
    } finally { android.disabled = false; }
  });
  iphone.addEventListener('click', () => { androidSelected = false; guide('iphone'); status.textContent = ''; });
  window.addEventListener('appinstalled', () => { deferredPrompt = null; status.textContent = 'App instalada. Ábrela desde el icono de tu pantalla de inicio.'; });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js', {updateViaCache:'none'}).then(registration => registration.update()).catch(() => {});
})();
