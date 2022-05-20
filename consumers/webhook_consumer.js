import { post } from "../utils/fetcher.js";

export class WebhookConsumer {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl;
  }

  send = async (announcement) => {
    let platformImage = "";
    let color = "0076D7";
    switch (announcement.platform.toUpperCase()) {
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

    let body = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      themeColor: color,
      summary: announcement.title,
      sections: [
        {
          activityTitle: announcement.title,
          activitySubtitle: `[${announcement.url}](${announcement.url})`,
          activityImage: platformImage,
        },
      ],
    };

    const headers = {};
    return post(this.webhookUrl, headers, body)
      .then(console.log)
      .catch(console.warn);
  };
}
