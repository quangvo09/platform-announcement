import { join } from "path";
import { Low, JSONFile } from "lowdb";
import { fileURLToPath } from "url";
import { dirname } from "path";

import * as lazada from "./platforms/lazada.js";
import * as shopee from "./platforms/shopee.js";
import fetcher from "./utils/fetcher.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const token_bot = process.env.TELEGRAM_TOKEN_BOT;
const chat_id = process.env.TELEGRAM_CHAT_ID;

const file = join(__dirname, "db", "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

const insertAnnouncement = (announcement) => {
  const _announcement = db.data.announcements.find(
    (a) => a.id == announcement.id && a.platform === announcement.platform
  );

  if (!_announcement) {
    db.data.announcements.unshift(announcement);
    return { announcement, isNew: true };
  }

  return { announcement, isNew: false };
};

const sendNotification = (announcement) => {
  let message = `
------
📣📣📣 ${announcement.platform.toUpperCase()} 📣📣📣
\\[Announcement\]: *${announcement.title}*
\\[Link\]: [${announcement.url}](${announcement.url})
  `;
  message = message.substring(0, 4096);
  message = encodeURIComponent(message);

  const url = `https://api.telegram.org/bot${token_bot}/sendMessage?chat_id=@${chat_id}&text=${message}&parse_mode=markdown`;
  fetcher(url).then(console.log).catch(console.error);
};

const main = async () => {
  // Load database
  await db.read();
  db.data = db.data || { announcements: [] };

  flattenPromise([lazada.scrape(), shopee.scrape()])
    .then((announcements) => {
      announcements.forEach((announcement) => {
        const { isNew } = insertAnnouncement(announcement);
        if (isNew) {
          sendNotification(announcement);
        }
      });
    })
    .then(() => {
      return db.write();
    });
};

const flattenPromise = (promises) => {
  const successPromises = promises.map((p) => {
    return p.catch((error) => {
      console.warn(error);
      return Promise.resolve([]);
    });
  });

  return Promise.all(successPromises).then((values) => {
    return Promise.resolve(
      values.reduce((acc, value) => {
        acc.push(...value);
        return acc;
      })
    );
  });
};

console.log("Start scraping...");
main()
  .then(() => {
    console.log("DONE!");
  })
  .catch(console.error);
