/**
 * UI string dictionary. Keys are stable; values are per-locale translations.
 *
 * Book body translation is a separate, opt-in operation — handled at
 * `/api/translate`, cached per chapter+locale in Supabase — because running
 * a 6k-word chapter through an LLM on every page view is cost-prohibitive
 * and introduces latency readers won't tolerate.
 *
 * If you need to ship a new locale, add a column to each entry and update
 * `SUPPORTED_LOCALES`. The code will fall back to English for missing keys.
 */

export const SUPPORTED_LOCALES = [
  { code: "en", name: "English", native: "English" },
  { code: "es", name: "Spanish", native: "Español" },
  { code: "fr", name: "French", native: "Français" },
  { code: "pt", name: "Portuguese", native: "Português" },
  { code: "ht", name: "Haitian Creole", native: "Kreyòl Ayisyen" },
  { code: "sw", name: "Swahili", native: "Kiswahili" },
  { code: "zh", name: "Chinese (Simplified)", native: "中文" },
  { code: "ar", name: "Arabic", native: "العربية" },
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number]["code"];
export const DEFAULT_LOCALE: Locale = "en";

export const RTL_LOCALES: readonly Locale[] = ["ar"];

type Dict = Record<string, string>;

const en: Dict = {
  "nav.contents": "Contents",
  "nav.library": "My Library",
  "nav.ebook": "E-book",
  "home.tagline": "Real-life stories of love, survival, and self-worth — shared to free and heal women, mothers, and daughters everywhere.",
  "home.buyFullBook": "Buy the full book",
  "home.startReading": "Start reading — free front matter",
  "paywall.unlockChapter": "Unlock this chapter",
  "paywall.buyChapter": "Buy chapter",
  "paywall.buyFullBook": "Buy full book",
  "contents.title": "Contents",
  "contents.helper": "Front and back matter are free. Chapters are {chapterPrice} each, or unlock the entire book for {fullPrice}.",
  "contents.free": "Free",
  "library.title": "My Library",
  "library.signInPrompt": "Sign in to see your library",
  "library.verifyAgeRequired": "Age verification required",
  "library.verifyAge": "Verify age",
  "ageGate.title": "Age verification",
  "ageGate.advisory": "Reader advisory: Lessons Mama Never Taught Me contains graphic language and explicit adult material. Please confirm your age before continuing.",
  "ageGate.adult": "I am 18 or older",
  "ageGate.minor": "I am under 18 — start parental consent",
  "consent.title": "Parental consent",
  "consent.help": "Because you're under 18, we need a parent or guardian to confirm their consent. Fill out the form below — we'll email them a secure approval link.",
  "consent.aboutYou": "About you",
  "consent.parentGuardian": "Parent or guardian",
  "consent.firstName": "First name",
  "consent.lastName": "Last name",
  "consent.email": "Email",
  "consent.phone": "Phone",
  "consent.birthdate": "Your birthdate",
  "consent.submit": "Send consent request",
  "consent.sentTitle": "Consent request sent",
  "footer.about": "About the author",
  "footer.support": "Support",
  "footer.privacy": "Privacy",
  "footer.terms": "Terms",
  "a11y.skip": "Skip to content",
  "a11y.settings": "Reading settings",
  "a11y.fontSize": "Font size",
  "a11y.contrast": "High contrast",
  "a11y.dyslexia": "Dyslexia-friendly font",
  "a11y.reducedMotion": "Reduce motion",
  "translate.chapter": "Translate this chapter",
  "translate.pending": "Translating…",
  "translate.restore": "Show original",
  "translate.language": "Language",
};

const es: Dict = {
  "nav.contents": "Contenido",
  "nav.library": "Mi biblioteca",
  "nav.ebook": "E-book",
  "home.tagline": "Historias reales de amor, supervivencia y valor propio, compartidas para liberar y sanar a mujeres, madres e hijas en todas partes.",
  "home.buyFullBook": "Comprar el libro completo",
  "home.startReading": "Empezar a leer — material gratuito",
  "paywall.unlockChapter": "Desbloquea este capítulo",
  "paywall.buyChapter": "Comprar capítulo",
  "paywall.buyFullBook": "Comprar libro completo",
  "contents.title": "Contenido",
  "contents.helper": "El material inicial y final es gratis. Cada capítulo cuesta {chapterPrice}, o desbloquea el libro completo por {fullPrice}.",
  "contents.free": "Gratis",
  "library.title": "Mi biblioteca",
  "library.signInPrompt": "Inicia sesión para ver tu biblioteca",
  "library.verifyAgeRequired": "Verificación de edad requerida",
  "library.verifyAge": "Verificar edad",
  "ageGate.title": "Verificación de edad",
  "ageGate.advisory": "Aviso al lector: Lessons Mama Never Taught Me contiene lenguaje gráfico y material explícito para adultos. Confirma tu edad antes de continuar.",
  "ageGate.adult": "Tengo 18 años o más",
  "ageGate.minor": "Soy menor de 18 — iniciar consentimiento parental",
  "consent.title": "Consentimiento parental",
  "consent.help": "Como eres menor de 18, necesitamos que un padre o tutor confirme su consentimiento. Completa el formulario — le enviaremos un enlace seguro de aprobación.",
  "consent.aboutYou": "Sobre ti",
  "consent.parentGuardian": "Padre, madre o tutor",
  "consent.firstName": "Nombre",
  "consent.lastName": "Apellido",
  "consent.email": "Correo",
  "consent.phone": "Teléfono",
  "consent.birthdate": "Tu fecha de nacimiento",
  "consent.submit": "Enviar solicitud de consentimiento",
  "consent.sentTitle": "Solicitud enviada",
  "footer.about": "Sobre la autora",
  "footer.support": "Ayuda",
  "footer.privacy": "Privacidad",
  "footer.terms": "Términos",
  "a11y.skip": "Saltar al contenido",
  "a11y.settings": "Preferencias de lectura",
  "a11y.fontSize": "Tamaño de letra",
  "a11y.contrast": "Alto contraste",
  "a11y.dyslexia": "Fuente para dislexia",
  "a11y.reducedMotion": "Reducir movimiento",
  "translate.chapter": "Traducir este capítulo",
  "translate.pending": "Traduciendo…",
  "translate.restore": "Ver original",
  "translate.language": "Idioma",
};

// Stubs — add full translations before shipping each locale.
const fr: Dict = { ...en };
const pt: Dict = { ...en };
const ht: Dict = { ...en };
const sw: Dict = { ...en };
const zh: Dict = { ...en };
const ar: Dict = { ...en };

const DICTIONARIES: Record<Locale, Dict> = { en, es, fr, pt, ht, sw, zh, ar };

export function t(locale: Locale, key: string, vars: Record<string, string | number> = {}): string {
  const dict = DICTIONARIES[locale] ?? en;
  const raw = dict[key] ?? en[key] ?? key;
  return raw.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
