/* A static page: no analytics, API calls, permissions or account state. */
(() => {
  const releases = window.GUDTOUR_DOWNLOADS || {};
  const ready = [];
  for (const link of document.querySelectorAll('[data-download]')) {
    const platform = link.dataset.download;
    const value = releases[platform];
    if (typeof value !== 'string' || !value.trim()) continue;
    let url;
    try { url = new URL(value); } catch { continue; }
    // Reject relative, script, credential-bearing and non-HTTPS URLs.
    if (url.protocol !== 'https:' || url.username || url.password) continue;
    link.href = url.href;
    link.removeAttribute('aria-disabled');
    link.querySelector('.download-overline').textContent = 'Android · APK download';
    link.querySelector('.download-title').textContent = 'Download GudTour';
    link.setAttribute('aria-label', 'Download GudTour for Android');
    ready.push(platform);
  }
  const note = document.getElementById('release-note');
  if (ready.length) note.textContent = 'Android early access APK. GudTour is still in development.';
})();
