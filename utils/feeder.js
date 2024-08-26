import { Feed } from "feed";

const feed = new Feed({
  title: "Platform Announcements",
  description: "Platform Announcements Feed",
  id: "https://github.com/quangvo09/platform-announcement",
  link: "https://github.com/quangvo09/platform-announcement",
  language: "en",
  image: "https://github.com/user-attachments/assets/83a7dfa8-5f5a-4e58-a342-111c343c48af",
  favicon: "",
  copyright: "2024",
  generator: "",
  author: {
    name: "Quang Vo",
    email: "quangvt.la@gmail.com",
    link: "https://github.com/quangvo09/platform-announcement"
  },
});

const getPlatformMedia = (platform) => {
  let platformImage = "";
  let color = "";

  switch (platform.toUpperCase()) {
    case "LAZADA":
      platformImage =
        "https://user-images.githubusercontent.com/6206464/155825664-034ea33e-31ec-40ed-a320-52cdd13f04d1.png";
      color = "0f146c";
      break;

    case "SHOPEE":
      platformImage =
        "https://user-images.githubusercontent.com/6206464/155825741-b1ae6a6e-2839-4e92-a977-ac1c337aebef.png";
      color = "f36f21";
      break;

    case "TIKTOK":
      platformImage =
        "https://user-images.githubusercontent.com/6206464/169569609-82fc8678-5d4d-4d11-9b9a-586e9cd5fc72.png";
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