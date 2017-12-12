import {watch} from "../index";
import * as https from "https";
import consts from "../consts";
import * as path from "path";
import * as fs from "fs";

export async function allowMultiDocumentResponse(userAgent) {
  return false;
}

export function getRelease(req, sequence) {
  return new Promise((resolve, reject) => {
    const { URL } = require("url");
    const upstreamURL = new URL(consts.upstreamEndpoint);
    const options = {
      host: upstreamURL.host,
      path: "/market" + req.originalUrl,
      headers: req.headers,
    };
    options.headers.host = upstreamURL.host;

    let yamldata = "";
    https.get(options, (newRes) => {
      newRes.on("data", (chunk) => {
        console.log(chunk);
        if (chunk) {
          yamldata = yamldata + chunk.toString();
        }
      });

      newRes.on("end", () => {
        console.log("end");
        fs.writeFileSync(path.join(consts.localPath, "releases", sequence + ".yaml"), yamldata);
        if (!fs.existsSync(path.join(consts.localPath, "current.yaml"))) {
          fs.copyFileSync(path.join(consts.localPath, "releases", sequence + ".yaml"), path.join(consts.localPath, "current.yaml"));
          watch();
        } else {
          console.log("Release " + sequence + " was requested and was created using yaml returned by the Replicated API.");
          console.log("However, a current.yaml was already present, and was not overwritten.");
        }
        resolve(yamldata);
      });

    }).on("error", (e) => {
      console.error(e);
      reject(e);
    });
  });
}
