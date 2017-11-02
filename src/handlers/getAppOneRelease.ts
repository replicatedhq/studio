import * as fs from "fs";
import * as path from "path";
import * as chalk from "chalk";

import consts from "../consts";
import { allowMultiDocumentResponse } from "../replicated/helpers";
import { listAvailableReleases } from "../replicated/release";

export default async function (req) {
  const releases = listAvailableReleases();
  if (releases.length === 0) {
    throw { status: 500, err: new Error("No releases found") };
  }

  let releaseFilename;
  if (fs.existsSync(path.join(consts.localPath, `${req.params.sequence}.yaml`))) {
    releaseFilename = path.join(consts.localPath, `${req.params.sequence}.yaml`);
  } else if (fs.existsSync(path.join(consts.localPath, `${req.params.sequence}.yml`))) {
    releaseFilename = path.join(consts.localPath, `${req.params.sequence}.yml`);
  }

  if (!releaseFilename) {
    chalk.red(`Replicated requested release sequence ${req.params.sequence}, but this realease yaml was not found in ${consts.localPath}`);
    throw { status: 500, err: new Error("Release not found") };
  }

  const lastModifiedTime = fs.lstatSync(releaseFilename).mtime.toISOString();
  const yamlContents = fs.readFileSync(releaseFilename, "utf8");

  return {
    status: 200,
    contentType: "text/yaml",
    headers: {
      "X-Replicated-ReleaseDate": lastModifiedTime,
    },
    body: yamlContents,
  };
}
