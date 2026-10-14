import { translations, type Dictionary } from './translations';

const STORAGE_KEY = 'bv-lang';
const DEFAULT_LANG = 'en';

let langSelect: HTMLSelectElement | null = null;

function lookup(lang: string): Dictionary {
  return Object.prototype.hasOwnProperty.call(translations, lang)
    ? translations[lang]
    : translations[DEFAULT_LANG];
}

// Dictionary for the language currently selected in the switcher.
export function getCurrentDictionary(): Dictionary {
  return lookup(langSelect?.value || DEFAULT_LANG);
}

function applyLanguage(lang: string): void {
  const dict = lookup(lang);

  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (key && dict[key]) el.textContent = dict[key];
  });
  document.documentElement.lang = lang;
  document.body.setAttribute('data-lang', lang);
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Storage can be blocked (private mode), the choice just won't persist.
  }
}

export function initLanguage(): void {
  const select = document.getElementById('langSelect');
  if (!(select instanceof HTMLSelectElement)) return;
  langSelect = select;

  let saved = DEFAULT_LANG;
  try {
    saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  } catch {
    // Fall back to the default language.
  }

  select.value = saved;
  applyLanguage(saved);
  select.addEventListener('change', () => applyLanguage(select.value));
}
