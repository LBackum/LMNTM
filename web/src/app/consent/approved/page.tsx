export const metadata = { title: "Consent approved" };

export default function ConsentApproved() {
  return (
    <div className="page-shell max-w-xl">
      <h1 className="font-display text-3xl text-cocoa">Consent recorded</h1>
      <p className="mt-3 font-body text-cocoa/80">
        Thank you. Your consent has been recorded. Your child now has access to purchased
        chapters of <em>Lessons Mama Never Taught Me</em>.
      </p>
      <p className="mt-6 font-body text-sm text-cocoa/60">
        Questions or changes? Write to{" "}
        <a href="mailto:ask@drkayjay.com" className="text-sage underline">ask@drkayjay.com</a>.
      </p>
    </div>
  );
}
