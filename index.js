import { JSONFile, Low } from "lowdb";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import * as lazada from "./platforms/lazada.js";
import * as shopee from "./platforms/shopee.js";
import * as tiktok from "./platforms/tiktok.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const file = join(__dirname, "db", "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

// const consumer = new WebhookConsumer(process.env.WEBHOOK_URL);

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

const main = async () => {
  // Load database
  await db.read();
  db.data = db.data || { announcements: [] };

  const scrapers = [lazada.scrape(), shopee.scrape(), tiktok.scrape()];
  parallelPromise(scrapers).then((results) => {
    const announcements = results.reduce((acc, value) => {
      acc.push(...value);
      return acc;
    });

    return announcements.reduce((promise, announcement) => {
      return promise.finally(() => {
        const { isNew } = insertAnnouncement(announcement);
        if (isNew) {
          db.write();
          return delay(1000);
          // return consumer.send(announcement).then(() => delay(1000));
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
