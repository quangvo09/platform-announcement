import { Feed } from "feed";

const feed = new Feed({
  title: "Platform Announcements",
  description: "Platform Announcements Feed",
  id: "https://github.com/quangvo09/platform-announcement",
  link: "https://github.com/quangvo09/platform-announcement",
  language: "en",
  image: "",
  favicon: "",
  copyright: "2024",
  generator: "",
  author: {
    name: "Quang Vo",
    email: "quangvt.la@gmail.com",
    link: "https://github.com/quangvo09/platform-announcement"
  },
});

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
      feed.addItem({
        title: `[${announcement.platform.toLocaleUpperCase()}] - ${announcement.title}`,
        id: announcement.url,
        link: announcement.url,
        description: announcement.title,
        content: announcement.title,
        published: new Date(announcement.createdAt * 1000),
        category: [{ name: announcement.platform }]
      })
    })



  return feed.rss2();
}

export default generateFeed;