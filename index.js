import { join } from "path";
import { Low, JSONFile } from "lowdb";
import { fileURLToPath } from "url";
import { dirname } from "path";

import * as lazada from "./platforms/lazada.js";
import * as shopee from "./platforms/shopee.js";
import fetcher from "./utils/fetcher.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tokenBot = process.env.TELEGRAM_TOKEN_BOT;
const chatId = process.env.TELEGRAM_CHAT_ID;

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

  const url = `https://api.telegram.org/bot${tokenBot}/sendMessage?chat_id=${chatId}&text=${message}&parse_mode=markdown`;
  return fetcher(url).then(console.log).catch(console.warn);
};

const main = async () => {
  // Load database
  await db.read();
  db.data = db.data || { announcements: [] };

  parallelPromise([lazada.scrape(), shopee.scrape()]).then((results) => {
    const announcements = results.reduce((acc, value) => {
      acc.push(...value);
      return acc;
    });

    return announcements.reduce((promise, announcement) => {
      return promise.finally(() => {
        const { isNew } = insertAnnouncement(announcement);
        if (isNew) {
          db.write();
          return sendNotification(announcement).then(() => delay(1000));
        }

        return Promise.resolve();
      });
    }, Promise.resolve());
  });
};

const parallelPromise = (promises) => {
  const successPromises = promises.map((p) => {
    return p.catch((error) => {
      console.warn(error);
      return Promise.resolve([]);
    });
  });

  return Promise.all(successPromises);
};

const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
};

console.log("Start scraping...");
main()
  .then(() => {
    console.log("DONE!");
  })
  .catch(console.error);
