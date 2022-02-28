import fetcher from "../utils/fetcher.js";
const API_URL =
  "https://open.shopee.com/api/v1/content/list?page_size=10&page_index=1";

export const scrape = async () => {
  try {
    const resp = await fetcher(API_URL);
    const data = JSON.parse(resp);
    const announcements = data.data
      .sort((d1, d2) => d1.id - d2.id)
      .map((d) => ({
        id: d.id,
        platform: "shopee",
        title: d.title,
        url: `https://open.shopee.com/announcements/${d.id}`,
      }));
    return announcements;
  } catch (error) {
    console.warn(error);
    return [];
  }
};
