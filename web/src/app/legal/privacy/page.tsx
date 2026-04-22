export const metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <div className="page-shell prose-book">
      <h1>Privacy Policy</h1>
      <p><em>Last updated: April 2026</em></p>

      <p>
        January Media LLC (&quot;we,&quot; &quot;us&quot;) publishes <em>Lessons Mama Never Taught Me</em> by
        Dr. Karen R. January through the web application at lmntm.app and related mobile
        applications. This policy explains what we collect, why, and your choices.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li><strong>Account email.</strong> Used to deliver your one-time sign-in links and to
          associate your purchases with your account.</li>
        <li><strong>Purchase records.</strong> Stripe processes payments; we retain the Stripe
          session ID, amount, and which chapters or full-book unlock you purchased.</li>
        <li><strong>Age verification.</strong> If you&apos;re 18+, we store your self-attestation.
          If you&apos;re under 18, we additionally collect a parent/guardian&apos;s name, email,
          and phone solely to request their consent.</li>
        <li><strong>Operational logs.</strong> Minimal request logs for security and abuse
          prevention.</li>
      </ul>

      <h2>What we don&apos;t do</h2>
      <ul>
        <li>We don&apos;t sell your personal information.</li>
        <li>We don&apos;t serve third-party advertising.</li>
        <li>We don&apos;t store card numbers — Stripe handles that directly.</li>
      </ul>

      <h2>Children&apos;s privacy</h2>
      <p>
        We do not knowingly collect personal information from children under 13. If you are
        between 13 and 17, you may use the service only with verifiable consent from a parent
        or guardian via our in-app consent flow.
      </p>

      <h2>Your rights</h2>
      <p>
        You may request access, correction, or deletion of your data at any time by writing to
        <a href="mailto:ask@drkayjay.com"> ask@drkayjay.com</a>. Parents may withdraw consent
        at any time using the same address.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Email <a href="mailto:ask@drkayjay.com">ask@drkayjay.com</a>.
      </p>
    </div>
  );
}
