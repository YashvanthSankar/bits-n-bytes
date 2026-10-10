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
    link.querySelector('.download-overline').textContent = platform === 'ios' ? 'Early access for your iPhone' : 'Early access for your Android';
    link.querySelector('.download-title').textContent = platform === 'ios' ? 'Get GudTour for iOS' : 'Get GudTour for Android';
    link.setAttribute('aria-label', platform === 'ios' ? 'Download GudTour for iOS' : 'Download GudTour for Android');
    ready.push(platform);
  }
  const note = document.getElementById('release-note');
  if (ready.length === 2) note.textContent = 'Early access builds. GudTour is still in development.';
  else if (ready.length === 1) note.textContent = `${ready[0] === 'ios' ? 'iOS' : 'Android'} early access is available. The other platform’s release is pending.`;
})();
