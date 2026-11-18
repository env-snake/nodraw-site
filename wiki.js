const translations = Array.from(document.querySelectorAll('[data-ru]'), node => ({
  node,
  en: node.textContent,
  ru: node.dataset.ru,
}));
const languageButtons = document.querySelectorAll('[data-language]');

function selectLanguage(language) {
  document.documentElement.lang = language;
  for (const {node, en, ru} of translations) {
    node.textContent = language === 'ru' ? ru : en;
  }
  for (const button of languageButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.language === language));
  }
  try {
    localStorage.setItem('nodraw-lang', language);
  } catch {
    // Visitors can still switch languages when browser storage is unavailable.
  }
}

for (const button of languageButtons) {
  button.addEventListener('click', () => selectLanguage(button.dataset.language));
}
try {
  if (localStorage.getItem('nodraw-lang') === 'ru') selectLanguage('ru');
} catch {
  // English is the initial document language.
}

async function loadBeta() {
  const releases = 'https://github.com/env-snake/nodraw-site/releases';
  try {
    const response = await fetch('updates/beta.json', {cache: 'no-cache'});
    if (!response.ok) return;
    const release = await response.json();
    const version = /^(\d+\.\d+\.\d+) beta ([1-9]\d*)$/.exec(release.version);
    if (!version || !Number.isSafeInteger(release.build) || Number(version[2]) !== release.build ||
        !Number.isSafeInteger(release.bytes) || release.bytes <= 0) return;
    const tag = 'v' + version[1] + '-beta.' + release.build;
    const installer = releases + '/download/' + tag + '/NoDraw-Setup.exe';
    if (release.installer !== installer) return;

    document.querySelectorAll('[data-beta-download]').forEach(link => link.href = installer);
    document.querySelectorAll('[data-beta-version]').forEach(label => label.textContent = release.version);
    document.querySelectorAll('[data-beta-size]').forEach(label => label.textContent = (release.bytes / 1_000_000).toFixed(1) + ' MB');
    document.querySelectorAll('[data-beta-release]').forEach(link => link.href = releases + '/tag/' + tag);
  } catch {
    // Download links still point to the release list.
  }
}

loadBeta();

// A native dialog provides focus trapping and Escape without a dependency.
const imageViewer = document.createElement('dialog');
imageViewer.className = 'image-viewer';
const closeImage = document.createElement('button');
closeImage.type = 'button';
closeImage.textContent = 'Close / Закрыть';
const fullImage = document.createElement('img');
imageViewer.append(closeImage, fullImage);
document.body.append(imageViewer);
closeImage.addEventListener('click', () => imageViewer.close());
for (const button of document.querySelectorAll('[data-image]')) {
  button.addEventListener('click', () => {
    fullImage.src = button.dataset.image;
    fullImage.alt = button.getAttribute('aria-label') || '';
    imageViewer.showModal();
  });
}
