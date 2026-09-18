import type {
  CmsChannel,
  CmsClient,
  CmsGetChannelInput,
  CmsGetLocalesInput,
  CmsGetMenusInput,
  CmsGetPageByPathInput,
  CmsGetRoutesInput,
  CmsFieldValue,
  CmsLocale,
  CmsMenu,
  CmsPage,
  CmsRoute,
} from "@ominity/next/cms";
import type { FormRendererProps } from "@ominity/next/forms";

type OminityForm = FormRendererProps["form"];

const normalizePath = (path: string): string => {
  if (!path || path === "/") {
    return "/";
  }

  const withSlash = path.startsWith("/") ? path : `/${path}`;
  return withSlash.replace(/\/+$/, "") || "/";
};

const MOCK_FORM: OminityForm = {
  resource: "form",
  id: 10,
  name: "contact",
  title: "Contact form",
  description: "Starter contact form",
  submissions: 0,
  publishedAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
  _embedded: {
    form_fields: [
      {
        resource: "form_field",
        id: 100,
        formId: 10,
        type: "text",
        name: "name",
        label: "Name",
        isLabelVisible: true,
        placeholder: "Jane Doe",
        helper: "",
        defaultValue: null,
        width: "50%",
        isInline: true,
        css: {
          classes: null,
          id: null,
          style: null,
        },
        validation: {
          isRequired: true,
          minLength: 2,
          maxLength: 100,
          rules: [],
          message: "Please enter your name.",
        },
        options: [],
        order: 1,
        updatedAt: "2026-01-01T00:00:00.000Z",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        resource: "form_field",
        id: 101,
        formId: 10,
        type: "email",
        name: "email",
        label: "Email",
        isLabelVisible: true,
        placeholder: "jane@example.com",
        helper: "",
        defaultValue: null,
        width: "50%",
        isInline: true,
        css: {
          classes: null,
          id: null,
          style: null,
        },
        validation: {
          isRequired: true,
          minLength: null,
          maxLength: null,
          rules: [],
          message: "Please enter a valid email address.",
        },
        options: [],
        order: 2,
        updatedAt: "2026-01-01T00:00:00.000Z",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        resource: "form_field",
        id: 102,
        formId: 10,
        type: "textarea",
        name: "message",
        label: "Message",
        isLabelVisible: true,
        placeholder: "How can we help?",
        helper: "",
        defaultValue: null,
        width: null,
        isInline: false,
        css: {
          classes: null,
          id: null,
          style: null,
        },
        validation: {
          isRequired: true,
          minLength: 5,
          maxLength: 1000,
          rules: [],
          message: "Please enter a message.",
        },
        options: [],
        order: 3,
        updatedAt: "2026-01-01T00:00:00.000Z",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        resource: "form_field",
        id: 103,
        formId: 10,
        type: "metadata",
        name: "metadata",
        label: "Metadata",
        isLabelVisible: false,
        placeholder: "",
        helper: "",
        defaultValue: null,
        width: null,
        isInline: false,
        css: {
          classes: null,
          id: null,
          style: null,
        },
        validation: {
          isRequired: false,
          minLength: null,
          maxLength: null,
          rules: [],
          message: "",
        },
        options: ["page_url", "locale", "user_agent"],
        order: 4,
        updatedAt: "2026-01-01T00:00:00.000Z",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        resource: "form_field",
        id: 104,
        formId: 10,
        type: "honeypot",
        name: "website",
        label: "Website",
        isLabelVisible: false,
        placeholder: "",
        helper: "",
        defaultValue: null,
        width: null,
        isInline: false,
        css: {
          classes: null,
          id: null,
          style: null,
        },
        validation: {
          isRequired: false,
          minLength: null,
          maxLength: null,
          rules: [],
          message: "",
        },
        options: [],
        order: 5,
        updatedAt: "2026-01-01T00:00:00.000Z",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        resource: "form_field",
        id: 105,
        formId: 10,
        type: "button",
        name: "submit",
        label: "Send message",
        isLabelVisible: false,
        placeholder: "",
        helper: "",
        defaultValue: "submit",
        width: null,
        isInline: false,
        css: {
          classes: null,
          id: null,
          style: null,
        },
        validation: {
          isRequired: false,
          minLength: null,
          maxLength: null,
          rules: [],
          message: "",
        },
        options: [],
        order: 6,
        updatedAt: "2026-01-01T00:00:00.000Z",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  },
};

// Portfolio fixtures for local development only (OMINITY_USE_MOCK_DATA=true).
// Sample copy, never shown on the live site: real content lives in Ominity.
const MOCK_CASE_IMAGES = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80",
];

const createPortfolioComponents = (locale: string) => {
  const nl = locale === "nl";
  const numbers = nl ? ["een", "twee", "drie", "vier", "vijf"] : ["One", "Two", "Three", "Four", "Five"];

  return [
    {
      id: `portfolio-hero-${locale}`,
      key: "portfolio-hero",
      type: "portfolio-hero",
      fields: {
        eyebrow: "Portfolio",
        greeting: nl ? "Hey, ik ben" : "Hey I'm",
        name: "FEMI",
        tagline: nl ? "Student Bedrijfsmanagement — Brussel" : "Business Management student — Brussels",
        scroll_label: "Scroll",
        color_from: "#f093fb",
        color_to: "#f5576c",
      },
      children: [],
    },
    {
      id: `case-reveal-${locale}`,
      key: "case-reveal",
      type: "case-reveal",
      fields: {
        anchor: "works",
        cases: MOCK_CASE_IMAGES.map((image, index) => ({
          image,
          image_alt: nl ? `Voorbeeld project ${numbers[index]}` : `Project ${numbers[index]} preview`,
          title: `Project ${numbers[index]}`,
          client: nl ? "Naam klant" : "Client name",
          problem: nl
            ? "Probleem: waar de klant mee worstelde voor het project begon."
            : "Problem: what the client was struggling with before the project started.",
          outcome: nl
            ? "Resultaat: wat er veranderde na het project, liefst met een cijfer."
            : "Outcome: what changed after the project, ideally with a number.",
        })),
      },
      children: [],
    },
    {
      id: `approach-${locale}`,
      key: "approach",
      type: "approach",
      // Real copy (mirrors Ominity), not placeholders.
      fields: nl
        ? {
          eyebrow: "Aanpak",
          heading: "Websites die klanten opleveren.",
          intro: "Ik bouw websites voor lokale ondernemers. Je site moet er goed uitzien, maar nog belangrijker: hij moet je meer klanten opleveren. Daarom begint elk project met onderzoek en een duidelijk plan, en eindigt het met jou volledig aan het stuur.",
          cards: [
            { title: "Je zaak leren kennen", description: "We beginnen bij jou: wat je aanbiedt, wie je klanten zijn en wat je website voor je moet doen." },
            { title: "Je concurrenten onderzoeken", description: "Ik bekijk wat andere zaken in je buurt goed doen en waar ze tekortschieten, zodat jouw website eruit springt." },
            { title: "Een duidelijk plan maken", description: "Samen bepalen we welke pagina's je nodig hebt, wat erop komt en hoe bezoekers klant worden. Er wordt pas gebouwd als het plan klopt." },
            { title: "Ontwerpen en bouwen", description: "Een website die er goed uitziet, snel laadt en op elke gsm werkt, gemaakt om bezoekers om te zetten in telefoontjes, boekingen en verkopen." },
            { title: "Gevonden worden op Google", description: "Ik optimaliseer je site voor zoekmachines (SEO) zodat klanten in je buurt je vinden, en kan Google Ads (SEA) opzetten voor snellere resultaten." },
            { title: "Jij houdt de controle", description: "Je krijgt volledige controle over je website. Pas zelf teksten en foto's aan wanneer je wilt, zo weinig of zo veel als je wilt." },
          ],
        }
        : {
          eyebrow: "Approach",
          heading: "Websites that bring in customers.",
          intro: "I build websites for local businesses. Your site should look good, but more importantly, it should bring you more customers. That's why every project starts with research and a clear plan, and ends with you in full control.",
          cards: [
            { title: "Get to know your business", description: "We start with you: what you offer, who your customers are and what you want your website to do for you." },
            { title: "Research your competitors", description: "I look at what other businesses in your area do well and where they fall short, so your website can stand out." },
            { title: "Make a clear plan", description: "Together we decide which pages you need, what goes on them and how visitors become customers. Building only starts once the plan is solid." },
            { title: "Design and build", description: "A website that looks great, loads fast and works on every phone, built to turn visitors into calls, bookings and sales." },
            { title: "Get found on Google", description: "I optimise your site for search engines (SEO) so local customers find you, and can set up Google Ads (SEA) for faster results." },
            { title: "You stay in control", description: "You get full control over your website. Change texts and pictures yourself whenever you want, as little or as much as you like." },
          ],
        },
      children: [],
    },
    {
      id: `about-me-${locale}`,
      key: "about-me",
      type: "about-me",
      fields: {
        anchor: "about",
        eyebrow: nl ? "Over mij" : "About me",
        heading: nl ? "Een loopbaan zonder grenzen." : "A career without boundaries.",
        body: nl
          ? [
            "Eerste alinea: wie je bent en wat je doet.",
            "Tweede alinea: wat je werk je geleerd heeft.",
            "Derde alinea: wat je bedrijven aanbiedt.",
            "Vierde alinea: wat je buiten je werk drijft.",
          ]
          : [
            "First paragraph: who you are and what you do.",
            "Second paragraph: what your work has taught you.",
            "Third paragraph: what you offer companies.",
            "Fourth paragraph: what drives you outside of work.",
          ],
        name: "Femi Godpower",
        phone: "+32 000 00 00 00",
        email: "hello@example.com",
        location: nl ? "Brussel, België" : "Brussels, Belgium",
        availability: nl
          ? "Beschikbaar voor geselecteerde freelance opdrachten."
          : "Available for selected freelance assignments.",
      },
      children: [],
    },
    {
      id: `site-footer-${locale}`,
      key: "site-footer",
      type: "site-footer",
      fields: {
        big_text: "FEMI",
        links: [
          { column: nl ? "Navigatie" : "Navigate", label: nl ? "Projecten" : "Projects", url: "#works" },
          { column: nl ? "Navigatie" : "Navigate", label: nl ? "Aanpak" : "Approach", url: "#approach" },
          { column: nl ? "Navigatie" : "Navigate", label: nl ? "Terug naar boven" : "Back to top", url: "#top" },
          { column: nl ? "Meer" : "More", label: nl ? "Link een" : "Link one", url: "#" },
          { column: nl ? "Meer" : "More", label: nl ? "Link twee" : "Link two", url: "#" },
        ],
        contact_title: "Contact",
        email: "hello@example.com",
        phone: "+32 000 00 00 00",
        location: nl ? "Brussel, België" : "Brussels, Belgium",
        socials: [
          { platform: "linkedin", url: "#" },
          { platform: "instagram", url: "#" },
          { platform: "x", url: "#" },
        ],
        copyright: nl ? "Femi Godpower. Alle rechten voorbehouden." : "Femi Godpower. All rights reserved.",
      },
      children: [],
    },
  ];
};

const createFormComponent = (locale: string) => ({
  id: `form-${locale}`,
  key: "form_block",
  type: "form_block",
  fields: {
    title: locale === "nl" ? "Neem contact op" : "Get in touch",
    description:
      locale === "nl"
        ? "Dit is een werkend voorbeeldformulier vanuit @ominity/next/forms."
        : "This is a working example form powered by @ominity/next/forms.",
    form: MOCK_FORM as unknown as CmsFieldValue,
  },
  children: [],
});

const HOME_TRANSLATIONS = {
  en: "/",
  nl: "/welkom",
} as const;

const CONTACT_TRANSLATIONS = {
  en: "/contact",
  nl: "/contacteer-ons",
} as const;

const MOCK_PAGES: ReadonlyArray<CmsPage> = [
  {
    id: "page-home",
    locale: "en",
    path: HOME_TRANSLATIONS.en,
    slug: "",
    canonicalPath: HOME_TRANSLATIONS.en,
    title: "Ominity Starter",
    description: "Production-ready Next.js starter for Ominity.",
    status: "published",
    components: [
      ...createPortfolioComponents("en"),
    ],
    translations: [
      { locale: "en", path: HOME_TRANSLATIONS.en, slug: "", canonical: true },
      { locale: "nl", path: HOME_TRANSLATIONS.nl, slug: "welkom" },
    ],
    seo: {
      title: "Ominity Starter",
      description: "Production-ready Next.js starter for Ominity.",
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        type: "website",
      },
    },
  },
  {
    id: "page-home",
    locale: "nl",
    path: HOME_TRANSLATIONS.nl,
    slug: "welkom",
    canonicalPath: HOME_TRANSLATIONS.nl,
    title: "Ominity Starter",
    description: "Productieklare Next.js starter voor Ominity.",
    status: "published",
    components: [
      ...createPortfolioComponents("nl"),
    ],
    translations: [
      { locale: "en", path: HOME_TRANSLATIONS.en, slug: "" },
      { locale: "nl", path: HOME_TRANSLATIONS.nl, slug: "welkom", canonical: true },
    ],
    seo: {
      title: "Ominity Starter",
      description: "Productieklare Next.js starter voor Ominity.",
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        type: "website",
      },
    },
  },
  {
    id: "page-contact",
    locale: "en",
    path: CONTACT_TRANSLATIONS.en,
    slug: "contact",
    canonicalPath: CONTACT_TRANSLATIONS.en,
    title: "Contact",
    description: "Contact the Ominity team.",
    status: "published",
    components: [createFormComponent("en")],
    translations: [
      { locale: "en", path: CONTACT_TRANSLATIONS.en, slug: "contact", canonical: true },
      { locale: "nl", path: CONTACT_TRANSLATIONS.nl, slug: "contacteer-ons" },
    ],
    seo: {
      title: "Contact",
      description: "Contact the Ominity team.",
      robots: {
        index: true,
        follow: true,
      },
    },
  },
  {
    id: "page-contact",
    locale: "nl",
    path: CONTACT_TRANSLATIONS.nl,
    slug: "contacteer-ons",
    canonicalPath: CONTACT_TRANSLATIONS.nl,
    title: "Contact",
    description: "Neem contact op met het Ominity-team.",
    status: "published",
    components: [createFormComponent("nl")],
    translations: [
      { locale: "en", path: CONTACT_TRANSLATIONS.en, slug: "contact" },
      {
        locale: "nl",
        path: CONTACT_TRANSLATIONS.nl,
        slug: "contacteer-ons",
        canonical: true,
      },
    ],
    seo: {
      title: "Contact",
      description: "Neem contact op met het Ominity-team.",
      robots: {
        index: true,
        follow: true,
      },
    },
  },
];

export const MOCK_ROUTES: ReadonlyArray<CmsRoute> = [
  {
    id: "route-home-en",
    pageId: "page-home",
    locale: "en",
    path: HOME_TRANSLATIONS.en,
    slug: "",
    canonicalPath: HOME_TRANSLATIONS.en,
    translations: {
      en: HOME_TRANSLATIONS.en,
      nl: HOME_TRANSLATIONS.nl,
    },
  },
  {
    id: "route-home-nl",
    pageId: "page-home",
    locale: "nl",
    path: HOME_TRANSLATIONS.nl,
    slug: "welkom",
    canonicalPath: HOME_TRANSLATIONS.nl,
    translations: {
      en: HOME_TRANSLATIONS.en,
      nl: HOME_TRANSLATIONS.nl,
    },
  },
  {
    id: "route-contact-en",
    pageId: "page-contact",
    locale: "en",
    path: CONTACT_TRANSLATIONS.en,
    slug: "contact",
    canonicalPath: CONTACT_TRANSLATIONS.en,
    translations: {
      en: CONTACT_TRANSLATIONS.en,
      nl: CONTACT_TRANSLATIONS.nl,
    },
  },
  {
    id: "route-contact-nl",
    pageId: "page-contact",
    locale: "nl",
    path: CONTACT_TRANSLATIONS.nl,
    slug: "contacteer-ons",
    canonicalPath: CONTACT_TRANSLATIONS.nl,
    translations: {
      en: CONTACT_TRANSLATIONS.en,
      nl: CONTACT_TRANSLATIONS.nl,
    },
  },
];

const MOCK_MENUS: ReadonlyArray<CmsMenu> = [
  {
    id: "menu-main-en",
    key: "main",
    locale: "en",
    items: [
      {
        id: "menu-home-en",
        title: "Home",
        path: HOME_TRANSLATIONS.en,
        locale: "en",
        children: [],
      },
      {
        id: "menu-contact-en",
        title: "Contact",
        path: CONTACT_TRANSLATIONS.en,
        locale: "en",
        children: [],
      },
    ],
  },
  {
    id: "menu-main-nl",
    key: "main",
    locale: "nl",
    items: [
      {
        id: "menu-home-nl",
        title: "Welkom",
        path: HOME_TRANSLATIONS.nl,
        locale: "nl",
        children: [],
      },
      {
        id: "menu-contact-nl",
        title: "Contact",
        path: CONTACT_TRANSLATIONS.nl,
        locale: "nl",
        children: [],
      },
    ],
  },
];

export const MOCK_LOCALES: ReadonlyArray<CmsLocale> = [
  { code: "en", language: "en", label: "English", default: true },
  { code: "nl", language: "nl", label: "Nederlands" },
];

export const MOCK_CHANNEL: CmsChannel = {
  id: "channel-starter",
  identifier: "starter",
  name: "Starter Channel",
  active: true,
  maintenance: false,
  defaultLanguageCode: "en",
  languages: [
    {
      id: "language-en",
      code: "en",
      name: "English",
      default: true,
      active: true,
    },
    {
      id: "language-nl",
      code: "nl",
      name: "Nederlands",
      active: true,
    },
  ],
  countries: [
    {
      code: "BE",
      name: "Belgium",
      language: "nl",
      currency: "EUR",
      enabled: true,
      default: true,
    },
  ],
  currencies: [
    {
      code: "EUR",
      name: "Euro",
      symbol: "€",
      default: true,
    },
  ],
  details: {
    type: {
      technicalName: "headless",
      name: "Headless",
    },
    domains: [{ url: "http://localhost:3000" }],
    bindCustomersToChannel: false,
    maintenance: false,
  },
};

const findPageByPath = (path: string, locale: string): CmsPage | null => {
  const normalizedPath = normalizePath(path);

  const exact = MOCK_PAGES.find(
    (page) => page.locale === locale && normalizePath(page.path) === normalizedPath,
  );

  if (exact) {
    return exact;
  }

  const translated = MOCK_PAGES.find(
    (page) => page.locale === locale
      && page.translations.some((translation) => normalizePath(translation.path) === normalizedPath),
  );

  if (translated) {
    return translated;
  }

  return null;
};

export const mockCmsClient: CmsClient = {
  sdkChannelId: "channel-starter",
  async getPageByPath(input: CmsGetPageByPathInput) {
    const locale = input.locale ?? "en";
    return findPageByPath(input.path, locale);
  },
  async getRoutes(_input?: CmsGetRoutesInput) {
    return MOCK_ROUTES;
  },
  async getMenus(input?: CmsGetMenusInput) {
    const key = input?.key;
    const locale = input?.locale;

    return MOCK_MENUS.filter((menu) => {
      if (key && menu.key !== key) {
        return false;
      }

      if (locale && menu.locale !== locale) {
        return false;
      }

      return true;
    });
  },
  async getLocales(_input?: CmsGetLocalesInput) {
    return MOCK_LOCALES;
  },
  async getChannel(_input?: CmsGetChannelInput) {
    return MOCK_CHANNEL;
  },
};

export const mockForms = {
  contact: MOCK_FORM,
} as const;
