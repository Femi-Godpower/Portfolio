// Startup file for Plesk's Node.js (Phusion Passenger) hosting.
// Passenger runs this file directly and binds whatever port it listens on,
// so it boots the production Next.js server instead of `next start`.
// Requires `pnpm build` to have produced .next/ first.
const { createServer } = require("node:http");
const next = require("next");

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`Next.js ready on port ${port}`);
  });
});
