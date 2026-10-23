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
  const title = document.getElementById('screen-title');
  const intro = document.getElementById('screen-intro');
  const copyStep = document.getElementById('iphone-copy-step');
  const safariStep = document.getElementById('iphone-safari-step');
  const next = document.getElementById('iphone-next');
  const copyStatus = document.getElementById('copy-status');
  let iphoneStep = 1;
  function showIphoneStep(step) {
    iphoneStep = step;
    title.textContent = step === 1 ? 'Paso 1 · Copia el enlace' : 'Paso 2 · Abre Safari y pega el enlace';
    copyStep.hidden = step !== 1;
    safariStep.hidden = step !== 2;
    title.focus();
    window.scrollTo(0, 0);
  }
  iphone.addEventListener('click', () => {
    androidSelected = false;
    guide('iphone');
    status.textContent = '';
    document.querySelector('.actions').hidden = true;
    intro.hidden = true;
    copyStatus.textContent = '';
    next.hidden = true;
    showIphoneStep(1);
  });
  document.getElementById('copy-iphone-link').addEventListener('click', async () => {
    const url = new URL('./', location.href).href;
    try {
      await navigator.clipboard.writeText(url);
      copyStatus.textContent = 'Enlace copiado. Continúa al paso 2.';
    } catch {
      copyStatus.textContent = 'Mantén pulsado el enlace de abajo y elige Copiar enlace. Después continúa al paso 2.';
    }
    next.hidden = false;
  });
  next.addEventListener('click', () => showIphoneStep(2));
  document.getElementById('iphone-back').addEventListener('click', () => {
    if (iphoneStep === 2) { showIphoneStep(1); return; }
    document.getElementById('iphone-guide').hidden = true;
    iphone.setAttribute('aria-expanded', 'false');
    document.querySelector('.actions').hidden = false;
    intro.hidden = false;
    title.textContent = 'Instala STR-IG';
    iphone.focus();
  });
  window.addEventListener('appinstalled', () => { deferredPrompt = null; status.textContent = 'App instalada. Ábrela desde el icono de tu pantalla de inicio.'; });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js', {updateViaCache:'none'}).then(registration => registration.update()).catch(() => {});
})();
