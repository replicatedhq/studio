import * as fs from "fs";
import * as path from "path";

import consts from "../consts";
import { getRelease } from "../replicated/helpers";
import { listAvailableReleases } from "../replicated/release";

export default async function(req) {
  const releases = listAvailableReleases();
  if (releases.length === 0) {
    try {
      const yaml = await getRelease(req, 1);
      const date = new Date();
      return {
        status: 200,
        contentType: "text/yaml",
        headers: {
          "X-Replicated-ReleaseDate": date.toISOString(),
        },
        body: yaml,
      };
    } catch (err) {
      throw { status: 500, err: new Error("No releases found") };
    }
  }

  const defaultReleaseFilename = releases[releases.length - 1];
  const lastModifiedTime = fs.lstatSync(path.join(consts.localPath, "releases", defaultReleaseFilename)).mtime.toISOString();
  const yamlContents = fs.readFileSync(path.join(consts.localPath, "releases", defaultReleaseFilename), "utf8");

  return {
    status: 200,
    contentType: "text/yaml",
    headers: {
      "X-Replicated-ReleaseDate": lastModifiedTime,
    },
    body: yamlContents,
  };
}
