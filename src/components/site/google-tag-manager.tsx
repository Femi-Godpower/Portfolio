// Google Tag Manager, loaded on every page. The cookie banner itself is a consent
// tag inside the GTM container, so it is managed in GTM, not in this repo.
//
// GDPR: Consent Mode v2 defaults are set to "denied" here, before gtm.js runs.
// Tags stay cookieless until the banner in GTM sends a consent update.
// The <noscript> iframe from GTM's install snippet is left out on purpose:
// without JavaScript there is no banner, so there is no way to get consent.

interface GoogleTagManagerProps {
  readonly gtmId: string;
  /** https://www.googletagmanager.com, or the Onetagger subdomain serving gtm.js first-party. */
  readonly scriptOrigin: string;
}

export function GoogleTagManager({ gtmId, scriptOrigin }: GoogleTagManagerProps) {
  const src = `${scriptOrigin}/gtm.js?id=${encodeURIComponent(gtmId)}`;
  const inline = `
window.dataLayer = window.dataLayer || [];
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

  return <script id="gtm" dangerouslySetInnerHTML={{ __html: inline }} />;
}
