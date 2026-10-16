# Femi Godpower — Portfolio

This is the code behind my portfolio site, [femigodpower.be](https://femigodpower.be).

The site runs on **[Ominity](https://github.com/ominity)** as its CMS. All the text,
pages and projects live in Ominity, and this Next.js app turns them into the site.
It started from Ominity's
[Next.js starter](https://github.com/ominity/next-starter-storefront), which I
cut down to what a portfolio needs and built my own blocks on top of.

## About me

I'm Femi, 21, from Oudenaarde, Belgium. I live in Brussels, where I study Business
Management.

I build websites for clients, and I handle the whole thing: design, development,
the CMS, tracking and getting it live. I like to work out what a client actually
needs before I start building.

Before I worked on websites I taught snowboarding, and I still do it whenever I can.
Teaching taught me to keep explaining something until the other person really gets
it. I do the same with clients, so they understand what they're getting and can run
the site themselves afterwards.

I speak Dutch, English and French.

**Contact:** [info@femigodpower.be](mailto:info@femigodpower.be) ·
[LinkedIn](https://www.linkedin.com/in/femi-godpower/) ·
[Instagram](https://www.instagram.com/femigodpower/) ·
[GitHub](https://github.com/Femi-Godpower)

## Built with

- [Next.js](https://nextjs.org) 16 (App Router) and React 19
- [Ominity](https://github.com/ominity) as headless CMS, through `@ominity/next`
- Tailwind CSS v4
- Available in English and Dutch

## Running it locally

```bash
npm install
cp .env.example .env.local   # add OMINITY_API_URL and OMINITY_API_KEY
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). The site needs a working
Ominity API key, since all content comes from the CMS.
