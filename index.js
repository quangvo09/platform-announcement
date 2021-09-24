import { join } from "path";
import { Low, JSONFile } from "lowdb";
import { fileURLToPath } from "url";
import { dirname } from "path";

import * as lazada from "./platforms/lazada.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const file = join(__dirname, "db", "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

const insertAnnouncement = (announcement) => {
  const _announcement = db.data.announcements.find(
    (a) => a.id == announcement.id
  );
  if (!_announcement) {
    db.data.announcements.unshift(announcement);
    return { announcement, isNew: true };
  }

  return { announcement, isNew: false };
};

const sendNotification = (announcement) => {};

const main = async () => {
  await db.read();
  db.data ||= { announcements: [] };

  lazada
    .scrape()
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

console.log("Start scraping...");
main()
  .then(() => {
    console.log("DONE!");
  })
  .catch(console.error);
