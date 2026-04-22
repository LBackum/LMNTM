export const metadata = { title: "Accessibility statement" };

export default function AccessibilityPage() {
  return (
    <div className="page-shell prose-book">
      <h1>Accessibility statement</h1>
      <p><em>Last updated: April 2026</em></p>

      <p>
        We&apos;re committed to making <em>Lessons Mama Never Taught Me</em> accessible to every
        reader. The app targets <strong>WCAG 2.2 Level AA</strong> and is tested against the
        following assistive technologies:
      </p>
      <ul>
        <li>VoiceOver on iOS and macOS (Safari)</li>
        <li>TalkBack on Android (Chrome)</li>
        <li>NVDA and JAWS on Windows (Edge / Firefox / Chrome)</li>
      </ul>

      <h2>Built-in reading preferences</h2>
      <p>Open the <strong>Aa</strong> menu in the top bar to:</p>
      <ul>
        <li>Scale the body font from 90% to 140%</li>
        <li>Turn on high-contrast mode (black on white, underlined links)</li>
        <li>Switch to a dyslexia-friendly typeface</li>
        <li>Reduce motion and animation</li>
      </ul>
      <p>
        Preferences save to your device and apply to every page. The app also honors your
        system&apos;s <code>prefers-reduced-motion</code> and <code>prefers-contrast</code> settings
        on first visit.
      </p>

      <h2>Languages</h2>
      <p>
        The interface is localized into multiple languages, and you can translate individual
        chapters on demand. Use the language switcher in the top bar to choose a language.
      </p>

      <h2>Keyboard navigation</h2>
      <p>
        Every interactive element is reachable with <kbd>Tab</kbd> and operable with
        <kbd>Enter</kbd> / <kbd>Space</kbd>. A skip-to-content link appears on first focus.
      </p>

      <h2>Feedback</h2>
      <p>
        If you encounter anything that doesn&apos;t work for you, please write to
        <a href="mailto:ask@drkayjay.com"> ask@drkayjay.com</a>. We take accessibility reports
        seriously and will respond within 5 business days.
      </p>
    </div>
  );
}
