import { ROLES } from './data/roles';

const TYPE_DELAY_MS = 80;
const DELETE_DELAY_MS = 40;
const HOLD_DELAY_MS = 1200;

let roles: string[] = ROLES.en;
let roleIndex = 0;
let charIndex = 0;
let deleting = false;
let reducedMotion = false;
let roleEl: HTMLElement | null = null;

function typeLoop(): void {
  if (!roleEl) return;
  const current = roles[roleIndex];

  if (!deleting) {
    charIndex++;
    if (charIndex > current.length) {
      deleting = true;
      setTimeout(typeLoop, HOLD_DELAY_MS); // pause before deleting
      return;
    }
  } else {
    charIndex--;
    if (charIndex < 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      charIndex = 0;
    }
  }

  roleEl.innerHTML = current.slice(0, charIndex) + '<span class="cursor">&nbsp;</span>';
  setTimeout(typeLoop, deleting ? DELETE_DELAY_MS : TYPE_DELAY_MS);
}

// Called by the language switcher to swap the role list and restart typing.
export function setHeroRoles(lang: string): void {
  roles = Object.prototype.hasOwnProperty.call(ROLES, lang) ? ROLES[lang] : ROLES.en;
  roleIndex = 0;
  charIndex = 0;
  deleting = false;
  if (reducedMotion && roleEl) roleEl.textContent = roles[0];
}

export function initHero(prefersReducedMotion: boolean): void {
  roleEl = document.getElementById('heroRole');
  reducedMotion = prefersReducedMotion;
  if (!roleEl) return;

  if (reducedMotion) {
    // Skip the animation and show the first role as static text.
    roleEl.textContent = roles[0];
  } else {
    typeLoop();
  }
}
