import { Feed } from "feed";

const feed = new Feed({
  title: "Platform Announcements",
  description: "Platform Announcements Feed",
  id: "https://github.com/quangvo09/platform-announcement",
  link: "https://github.com/quangvo09/platform-announcement",
  language: "en",
  image: "https://raw.githubusercontent.com/quangvo09/platform-announcement/master/public/rss.jpg",
  favicon: "https://raw.githubusercontent.com/quangvo09/platform-announcement/master/public/favicon.ico",
  copyright: "@2024",
  generator: "QuangVo",
  author: {
    name: "Quang Vo",
    email: "quangvt.la@gmail.com",
    link: "https://github.com/quangvo09"
  },
});

const getPlatformMedia = (platform) => {
  let platformImage = "";
  let color = "";

  switch (platform.toUpperCase()) {
    case "LAZADA":
      platformImage =
        "https://raw.githubusercontent.com/quangvo09/platform-announcement/master/public/lazada.png";
      color = "0f146c";
      break;

    case "SHOPEE":
      platformImage =
        "https://raw.githubusercontent.com/quangvo09/platform-announcement/master/public/shopee.png";
      color = "f36f21";
      break;

    case "TIKTOK":
      platformImage =
        "https://raw.githubusercontent.com/quangvo09/platform-announcement/master/public/tiktok.png";
      color = "03033f";
      break;

    default:
  }

  return {
    image: platformImage,
    color,
  }
}

const generateFeed = async (announcements) => {
  // Add categories by platforms
  const platformMap = announcements.reduce((acc, announcement) => {
    acc[announcement.platform] = announcement.platform
    return acc
  }, {})
  const platforms = Object.keys(platformMap)
  platforms.forEach(platform => {
    feed.addCategory(platform)
  })

  // Add feed items
  announcements
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach((announcement) => {
      const media = getPlatformMedia(announcement.platform)

      feed.addItem({
        title: `[${announcement.platform.toLocaleUpperCase()}] - ${announcement.title}`,
        id: announcement.url,
        link: announcement.url,
        description: announcement.title,
        content: announcement.title,
        published: new Date(announcement.createdAt * 1000),
        category: [{ name: announcement.platform }],
        image: media.image,
      })
    })



  return feed.rss2();
}

export default generateFeed;