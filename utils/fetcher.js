import https from "https";

export default (url) => {
  return new Promise((resolve, reject) => {
    https
      .get(url, (resp) => {
        let data = "";

        resp.on("data", (chunk) => {
          data += chunk;
        });

        resp.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (err) => {
        reject(error);
      });
  });
};

export const post = (url, headers, body) => {
  const data = JSON.stringify(body);

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data),
      ...headers,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https
      .request(url, options, (resp) => {
        let data = "";

        resp.on("data", (chunk) => {
          data += chunk;
        });

        resp.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (err) => {
        reject(error);
      });

    req.write(data);
    req.end();
  });
};
