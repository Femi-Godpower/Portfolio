// Browser view of /sitemap.xml (linked from its xml-stylesheet instruction).
// Served from a route instead of public/ so it always gets an XSL content type;
// browsers refuse to apply a stylesheet served as text/plain or octet-stream.
// Colours and type follow the site: #0c0a0f base, #f093fb → #f5576c gradient.

const SITEMAP_XSL = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  exclude-result-prefixes="sm xhtml">

  <xsl:output method="html" encoding="UTF-8" indent="yes" doctype-system="about:legacy-compat" />

  <xsl:key name="by-hreflang" match="xhtml:link" use="@hreflang" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <title>Sitemap | Femi Godpower</title>
        <style>
          :root {
            color-scheme: dark;
            --bg: #0c0a0f;
            --card: #15121a;
            --line: rgba(255, 255, 255, 0.08);
            --line-strong: rgba(255, 255, 255, 0.14);
            --text: #fafafa;
            --muted: #999999;
            --pink: #f093fb;
            --red: #f5576c;
            --gradient: linear-gradient(90deg, var(--pink), var(--red));
            --sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
            --mono: ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace;
          }
          * { box-sizing: border-box; }
          html { background: var(--bg); }
          body {
            margin: 0;
            min-height: 100vh;
            font-family: var(--sans);
            color: var(--text);
            background-color: var(--bg);
            background-image:
              radial-gradient(ellipse 90% 700px at 50% 0%, rgba(240, 147, 251, 0.14), transparent 70%),
              radial-gradient(ellipse 60% 900px at 100% 60%, rgba(245, 87, 108, 0.08), transparent 70%);
            background-repeat: no-repeat;
            -webkit-font-smoothing: antialiased;
          }
          .wrap { max-width: 1200px; margin: 0 auto; padding: 48px 16px 80px; }
          header {
            display: flex; align-items: flex-end; justify-content: space-between;
            gap: 16px; flex-wrap: wrap; margin-bottom: 32px;
          }
          .brand {
            font-weight: 600; font-size: 14px; letter-spacing: 0.3em;
            text-transform: uppercase; text-decoration: none;
            color: rgba(255, 255, 255, 0.8); transition: color 0.2s;
          }
          .brand:hover { color: #ffffff; }
          h1 { margin: 8px 0 0; font-size: clamp(32px, 5vw, 48px); font-weight: 700; letter-spacing: -0.03em; }
          .intro { margin: 8px 0 0; color: var(--muted); font-size: 15px; max-width: 52ch; line-height: 1.5; }
          .home {
            color: var(--text); text-decoration: none; font-size: 14px;
            padding: 10px 18px; border: 1px solid var(--line-strong); border-radius: 999px;
            transition: border-color 0.2s, background 0.2s;
          }
          .home:hover { border-color: var(--pink); background: rgba(240, 147, 251, 0.08); }

          .stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-bottom: 24px; }
          .stat {
            background: var(--card); border: 1px solid var(--line); border-radius: 24px;
            padding: 24px 24px 22px;
          }
          .label {
            font-size: 12px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase;
            color: var(--muted);
          }
          .stat .label { color: var(--pink); }
          .stat:nth-child(2) .label { color: #f376b4; }
          .stat:nth-child(3) .label { color: var(--red); }
          .value { margin-top: 10px; font-size: 48px; font-weight: 400; letter-spacing: -0.03em; line-height: 1; }

          .panel { background: var(--card); border: 1px solid var(--line); border-radius: 24px; overflow: hidden; }
          .panel h2 {
            margin: 0; padding: 28px 28px 24px; font-size: 26px; font-weight: 700; letter-spacing: -0.03em;
            border-bottom: 1px solid var(--line);
          }
          .row {
            display: grid; grid-template-columns: minmax(0, 1fr) 180px 280px; gap: 24px;
            padding: 22px 28px; border-bottom: 1px solid var(--line);
          }
          .row:last-child { border-bottom: 0; }
          .row:hover { background: rgba(255, 255, 255, 0.02); }
          .cell .label { margin-bottom: 10px; }
          .url { color: var(--text); text-decoration: none; font-size: 16px; overflow-wrap: anywhere; }
          .url:hover {
            background: var(--gradient); -webkit-background-clip: text; background-clip: text; color: transparent;
          }
          .date { font-size: 15px; color: var(--text); }
          .none { color: var(--muted); }
          .chips { display: flex; flex-wrap: wrap; gap: 8px; }
          .chip {
            font-family: var(--mono); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase;
            color: var(--text); text-decoration: none;
            padding: 7px 12px; border: 1px solid var(--line-strong); border-radius: 999px;
            background: rgba(255, 255, 255, 0.03);
            transition: border-color 0.2s, color 0.2s;
          }
          .chip:hover { border-color: var(--pink); color: var(--pink); }
          .empty { padding: 40px 28px; color: var(--muted); }
          footer { margin-top: 24px; color: var(--muted); font-size: 13px; }
          footer a { color: var(--muted); }

          @media (max-width: 860px) {
            .row { grid-template-columns: 1fr; gap: 16px; padding: 20px; }
            .panel h2 { padding: 24px 20px 20px; }
          }
          @media (max-width: 560px) {
            .wrap { padding-top: 32px; }
            .stats { grid-template-columns: 1fr; gap: 12px; }
            .stat { padding: 20px; }
            .value { font-size: 40px; }
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <header>
            <div>
              <a class="brand" href="/">Femi</a>
              <h1>Sitemap</h1>
              <p class="intro">Every public page on this site, with its language versions. Search engines read the XML behind this page.</p>
            </div>
            <a class="home" href="/">Back to the site</a>
          </header>

          <section class="stats">
            <div class="stat">
              <div class="label">URLs</div>
              <div class="value"><xsl:value-of select="count(sm:urlset/sm:url)" /></div>
            </div>
            <div class="stat">
              <div class="label">Alternate links</div>
              <div class="value"><xsl:value-of select="count(sm:urlset/sm:url/xhtml:link)" /></div>
            </div>
            <div class="stat">
              <div class="label">Locales in feed</div>
              <div class="value">
                <xsl:value-of select="count(sm:urlset/sm:url/xhtml:link[generate-id() = generate-id(key('by-hreflang', @hreflang)[1])])" />
              </div>
            </div>
          </section>

          <section class="panel">
            <h2>Published URLs</h2>
            <xsl:choose>
              <xsl:when test="sm:urlset/sm:url">
                <xsl:for-each select="sm:urlset/sm:url">
                  <div class="row">
                    <div class="cell">
                      <div class="label">URL</div>
                      <a class="url" href="{sm:loc}"><xsl:value-of select="sm:loc" /></a>
                    </div>
                    <div class="cell">
                      <div class="label">Last modified</div>
                      <xsl:choose>
                        <xsl:when test="sm:lastmod">
                          <span class="date"><xsl:value-of select="substring(sm:lastmod, 1, 10)" /></span>
                        </xsl:when>
                        <xsl:otherwise>
                          <span class="date none">Not specified</span>
                        </xsl:otherwise>
                      </xsl:choose>
                    </div>
                    <div class="cell">
                      <div class="label">Alternates</div>
                      <div class="chips">
                        <xsl:for-each select="xhtml:link">
                          <a class="chip" href="{@href}"><xsl:value-of select="@hreflang" /></a>
                        </xsl:for-each>
                        <xsl:if test="not(xhtml:link)">
                          <span class="date none">None</span>
                        </xsl:if>
                      </div>
                    </div>
                  </div>
                </xsl:for-each>
              </xsl:when>
              <xsl:otherwise>
                <p class="empty">No published URLs yet.</p>
              </xsl:otherwise>
            </xsl:choose>
          </section>

          <footer>femigodpower.be · <a href="/sitemap.xml">sitemap.xml</a></footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
`;

export function GET(): Response {
  return new Response(SITEMAP_XSL, {
    headers: {
      "Content-Type": "text/xsl; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
