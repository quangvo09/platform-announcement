import { post } from "../utils/fetcher.js";

export class DiscordConsumer {
  constructor(token, channelId) {
    this.token = token;
    this.channelId = channelId;
  }

  send = async (announcement) => {
    let message = `
>>> ------
📣 ${announcement.platform.toUpperCase()} 📣
\\[Announcement\]: **${announcement.title}**
\\[Link\]: ${announcement.url}
    `;

    const url = `https://discord.com/api/channels/${this.channelId}/messages`;
    const headers = {
      authorization: `Bot ${this.token}`,
    };
    console.log(
      "🚀 ~ file: discord_consumer.js ~ line 21 ~ DiscordConsumer ~ send= ~ headers",
      headers
    );
    const data = { content: message };
    return post(url, headers, data).then(console.log).catch(console.warn);
  };
}
