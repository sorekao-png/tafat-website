import { useState } from "react";
import { writeConsent } from "./measurement";

/**
 * Cookie-consent notice shared by every page that can opt into optional
 * services (analytics, affiliate tooling). Writing consent dispatches the
 * `tafat-consent` window event that the GTM/GA4/Clarity loaders and the
 * consent-gated Lasso boundary all listen for.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(true);
  const choose = (value: "denied" | "analytics") => {
    writeConsent(value);
    setVisible(false);
  };
  if (!visible) return null;
  return (
    <aside className="consent" role="dialog" aria-label="Cookie preferences">
      <div>
        <strong>Your privacy, your choice.</strong>
        <p>
          We use only essential cookies in this preview. Optional analytics are off by default. See our{" "}
          <a href="/privacy">privacy policy</a>.
        </p>
      </div>
      <div className="consent-actions">
        <button className="text-button" onClick={() => choose("denied")}>
          No thanks
        </button>
        <button className="primary-button" onClick={() => choose("analytics")}>
          Allow optional
        </button>
      </div>
    </aside>
  );
}
