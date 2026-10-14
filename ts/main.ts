import { initStackAccordion } from './stack-accordion';
import { initHero } from './hero';
import { initChainNav } from './chain-nav';
import { initMotion } from './motion';
import { initLanguage } from './language';

// Check the motion preference once and reuse it everywhere.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

initStackAccordion();
initHero(prefersReducedMotion);
initChainNav();
initMotion(prefersReducedMotion);
// Language runs last so it sees the final DOM text (after the reveal classes are applied).
initLanguage();
