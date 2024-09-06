import fetcher from "../utils/fetcher.js";
const API_URL =
  "https://isvconsole.lazada.com/handler/share/announcement/getAnnouncementList.json?pageSize=10&parentId=27&page=1";

export const scrape = async () => {
  try {
    const resp = await fetcher(API_URL);
    const data = JSON.parse(resp);
    const announcements = data.data.list
      .sort((d1, d2) => d1.id - d2.id)
      .map((d) => ({
        id: d.id,
        platform: "lazada",
        title: d.enTitle,
        url: `https://open.lazada.com/apps/announcement/detail?docId=${d.id}`,
        createdAt: +d.gmtModified / 1000
      }));
    return announcements;
  } catch (error) {
    console.warn(error);
    return [];
  }
};
