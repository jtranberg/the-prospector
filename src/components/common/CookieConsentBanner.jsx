import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const COOKIE_CONSENT_KEY = "prospector-cookie-consent";
const COOKIE_POLICY_VERSION = "2026.06";

export default function CookieConsentBanner() {
  const [choice, setChoice] = useState(() => {
    const saved = localStorage.getItem(COOKIE_CONSENT_KEY);

    if (!saved) return null;

    try {
      const consent = JSON.parse(saved);

      // Re-prompt users if the cookie policy version changes.
      if (consent.version !== COOKIE_POLICY_VERSION) {
        localStorage.removeItem(COOKIE_CONSENT_KEY);
        return null;
      }

      return consent;
    } catch {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      return null;
    }
  });

  useEffect(() => {
    if (!choice) return;

    localStorage.setItem(
      COOKIE_CONSENT_KEY,
      JSON.stringify(choice),
    );
  }, [choice]);

  function handleConsent(selection) {
    setChoice({
      choice: selection,
      version: COOKIE_POLICY_VERSION,
      timestamp: new Date().toISOString(),
    });
  }

  // User has already made a decision.
  if (choice?.choice) return null;

  return (
    <aside
      className="cookie-banner"
      role="dialog"
      aria-label="Cookie Notice"
    >
      <div className="cookie-content">
        <strong>🍪 Cookie Notice</strong>

        <p>
          Dave Hall's Prospector uses essential cookies and local storage for
          authentication, security, and user preferences. Optional analytics
          will only be enabled with your consent.
        </p>

        <Link to="/cookies">
          Read our Cookie Policy
        </Link>
      </div>

      <div className="cookie-actions">
        <button
          className="button-link"
          type="button"
          onClick={() => handleConsent("essential-only")}
        >
          Essential Only
        </button>

        <button
          className="button-link"
          type="button"
          onClick={() => handleConsent("accepted")}
        >
          Accept All
        </button>
      </div>
    </aside>
  );
}