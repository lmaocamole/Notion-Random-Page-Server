const { Client } = require("@notionhq/client");
const dotenv = require("dotenv");
const { exec } = require("child_process");
const express = require("express");

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_KEY });

const databaseId = process.env.NOTION_DATABASE_ID;

async function main() {
  const urls = await queryDatabase();
  const randomIndex = Math.floor(Math.random() * urls.length);
  const randomUrl = urls[randomIndex];
  console.log(randomUrl);
  exec(`open ${randomUrl}`);
}

async function queryDatabase() {
  const pages = [];
  let cursor = undefined;
  while (true) {
    const { results, next_cursor } = await notion.databases.query({
      database_id: databaseId,
      page_size: 10,
      start_cursor: cursor,
    });
    pages.push(...results);
    if (!next_cursor) {
      break;
    }
    cursor = next_cursor;
  }
  return pages.map((page) => page.url);
}

const app = express();

app.use(express.static("public"));

app.get("/", async (req, res) => {
  const urls = await queryDatabase();
  const randomIndex = Math.floor(Math.random() * urls.length);
  const randomUrl = urls[randomIndex];
  console.log(randomUrl);
  res.send(`
    <html>
      <head>
        <meta http-equiv="refresh" content="0; URL=${randomUrl}">
      </head>
      <body>
        <p>Redirecting to ${randomUrl}...</p>
      </body>
    </html>
  `);
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server listening on port ${process.env.PORT || 3000}...`);
});

main();
