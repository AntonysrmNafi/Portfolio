import { LANGS, type Dictionary } from './data/translations';
import { setHeroRoles } from './hero';

const STORAGE_KEY = 'bv-lang';
const DEFAULT_LANG = 'en';

interface TextRecord {
  node: Text;
  key: string;
  orig: string;
  lead: string;
  trail: string;
}

interface AttrRecord {
  el: Element;
  attr: 'title' | 'aria-label';
  key: string;
  orig: string;
}

const textRecs: TextRecord[] = [];
const attrRecs: AttrRecord[] = [];

const normalize = (s: string): string => s.replace(/\s+/g, ' ').trim();

function getDictionary(lang: string): Dictionary | null {
  return Object.prototype.hasOwnProperty.call(LANGS, lang) ? LANGS[lang] : null;
}

function readSavedLang(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

function saveLang(lang: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Storage can be blocked (private mode), the choice just won't persist.
  }
}

// Walk the page once and remember the original text of every node and translatable attribute.
function collect(): void {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node: Node | null;

  while ((node = walker.nextNode())) {
    const textNode = node as Text;
    const parent = textNode.parentElement;
    if (!parent || parent.closest('script, style, select, #heroRole')) continue;

    const value = textNode.nodeValue ?? '';
    const key = normalize(value);
    if (!key) continue;

    textRecs.push({
      node: textNode,
      key,
      orig: value,
      lead: value.match(/^\s*/)?.[0] ?? '',
      trail: value.match(/\s*$/)?.[0] ?? '',
    });
  }

  document.querySelectorAll('[title], [aria-label]').forEach((el) => {
    if (el.id === 'langSelect') return;
    (['title', 'aria-label'] as const).forEach((attr) => {
      const orig = el.getAttribute(attr);
      if (orig !== null) attrRecs.push({ el, attr, key: normalize(orig), orig });
    });
  });
}

function applyLanguage(lang: string): void {
  const dict = getDictionary(lang);

  textRecs.forEach((r) => {
    const translated = dict?.[r.key];
    r.node.nodeValue = translated ? r.lead + translated + r.trail : r.orig;
  });
  attrRecs.forEach((r) => {
    r.el.setAttribute(r.attr, dict?.[r.key] || r.orig);
  });

  const active = dict ? lang : DEFAULT_LANG;
  document.documentElement.lang = active;
  document.body.setAttribute('data-lang', active);
  setHeroRoles(active);
  saveLang(active);
}

export function initLanguage(): void {
  collect();

  const select = document.getElementById('langSelect');
  let saved = readSavedLang();
  if (!getDictionary(saved)) saved = DEFAULT_LANG;

  if (select instanceof HTMLSelectElement) {
    select.value = saved;
    select.addEventListener('change', () => applyLanguage(select.value));
  }
  if (saved !== DEFAULT_LANG) applyLanguage(saved);
}
