import fetcher from "../utils/fetcher.js";

export class TelegramConsumer {
  constructor(token, chatId) {
    this.token = token;
    this.chatId = chatId;
  }

  send = async (announcement) => {
    let message = `
  ------
  📣📣📣 ${announcement.platform.toUpperCase()} 📣📣📣
  \\[Announcement\]: *${announcement.title}*
  \\[Link\]: [${announcement.url}](${announcement.url})
    `;
    message = message.substring(0, 4096);
    message = encodeURIComponent(message);

    const url = `https://api.telegram.org/bot${this.tokenBot}/sendMessage?chat_id=${this.chatId}&text=${message}&parse_mode=markdown`;
    return fetcher(url).then(console.log).catch(console.warn);
  };
}
