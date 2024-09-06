import fs from "fs";
import { JSONFile, Low } from "lowdb";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import generateFeed from "./utils/feeder.js";

import * as lazada from "./platforms/lazada.js";
import * as shopee from "./platforms/shopee.js";
import * as tiktok from "./platforms/tiktok.js";

import { WebhookConsumer } from "./consumers/webhook_consumer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const file = join(__dirname, "db", "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

const consumers = [];

const notify = (message) => {
  const promises = consumers.map((consumer) => {
    return consumer.send(message);
  })

  return parallelPromise(promises);
};

const feedie = async (announcements) => {
  const rss2 = await generateFeed(announcements)

  // Save to file rss2.xml
  fs.writeFileSync(join(__dirname, "db", "rss2.xml"), rss2)
}

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
  // Inint comsumer
  if (process.env.WEBHOOK_URL) {
    consumers.push(new WebhookConsumer(process.env.WEBHOOK_URL));
  }

  // Load database
  await db.read();
  db.data = db.data || { announcements: [] };

  let hasNewAnnouncement = false;
  const scrapers = [tiktok.scrape(), lazada.scrape(), shopee.scrape()];

  await parallelPromise(scrapers).then((results) => {
    const announcements = results.reduce((acc, value) => {
      acc.push(...value);
      return acc;
    });

    return announcements.reduce((promise, announcement) => {
      return promise.finally(() => {
        const { isNew } = insertAnnouncement(announcement);

        if (isNew && !hasNewAnnouncement) {
          hasNewAnnouncement = true;
        }

        if (isNew) {
          db.write();
          return notify(announcement).then(() => delay(1000));
        }

        return Promise.resolve();
      });
    }, Promise.resolve());
  });

  if (hasNewAnnouncement) {
    console.log("Generate new feed...");
    await feedie(db.data.announcements)
  }
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
