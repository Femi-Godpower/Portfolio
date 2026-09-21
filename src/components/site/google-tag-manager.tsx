// Google Tag Manager, loaded on every page. The cookie banner itself is a consent
// tag inside the GTM container, so it is managed in GTM, not in this repo.
//
// GDPR: Consent Mode v2 defaults are set to "denied" here, before gtm.js runs.
// Tags stay cookieless until the banner in GTM sends a consent update.
// The <noscript> iframe from GTM's install snippet is left out on purpose:
// without JavaScript there is no banner, so there is no way to get consent.

import Script from "next/script";

//
// Page language: pushed as `pageLanguage` before gtm.js runs. The Cookiebot tag
// reads it (Language → variable, Data Layer Variable "pageLanguage"); on "auto"
// Cookiebot follows the browser language instead, so a Dutch browser got a Dutch
// banner on the English site. The root layout gets no route params, so the
// language comes from the URL here: the first of the first two path segments
// that is a channel language (/nl/…, /be/nl/…), else the default.

interface GoogleTagManagerProps {
  readonly gtmId: string;
  /** https://www.googletagmanager.com, or the Onetagger subdomain serving gtm.js first-party. */
  readonly scriptOrigin: string;
  /** Two-letter channel languages, e.g. ["en", "nl"]. */
  readonly languages: ReadonlyArray<string>;
  readonly defaultLanguage: string;
}

export function GoogleTagManager({ gtmId, scriptOrigin, languages, defaultLanguage }: GoogleTagManagerProps) {
  const src = `${scriptOrigin}/gtm.js?id=${encodeURIComponent(gtmId)}`;
  const inline = `
window.dataLayer = window.dataLayer || [];
(function(langs, fallback){
  var parts = location.pathname.split('/').filter(Boolean).slice(0, 2);
  var lang = fallback;
  for (var i = 0; i < parts.length; i++) {
    var part = parts[i].toLowerCase();
    if (langs.indexOf(part) !== -1) { lang = part; break; }
  }
  dataLayer.push({ pageLanguage: lang });
})(${JSON.stringify(languages)}, ${JSON.stringify(defaultLanguage)});
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 500
});
dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
(function(d){var j=d.createElement('script');j.async=true;j.src=${JSON.stringify(src)};d.head.appendChild(j);})(document);
`;

  // next/script with afterInteractive, not a bare <script>. The 404 is served as
  // Next's error shell (<html id="__next_error__">): the layout, head included, is
  // rendered in the browser, and an inline <script> React inserts there never runs
  // — so the 404 had no GTM and therefore no cookie banner. beforeInteractive does
  // not help either, it only exists in server HTML. afterInteractive is run by the
  // Script component itself, on every page (it is also what @next/third-parties
  // uses for GTM). The consent defaults are still set before gtm.js, in this script.
  return (
    <Script id="gtm" strategy="afterInteractive">
      {inline}
    </Script>
  );
}
