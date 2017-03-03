import * as fs from "fs";
import * as _ from "lodash";
import * as path from "path";

import consts from "../consts";
import { listAvailableReleasesAfter, fillOutYaml } from "../replicated/release";

export default async function (req) {
  const currentVersion = req.body.CurrentVersion;
  const releases = listAvailableReleasesAfter(currentVersion);

  const versions: any[] = _.map(releases, (release) => {
    const lastModifiedTime = fs.lstatSync(path.join(consts.localPath, release)).mtime.toISOString();
    const yamlContents = fillOutYaml(path.join(consts.localPath, release));

    return {
      Sequence: _.parseInt(_.split(release, ".")[0]),
      ReleaseYaml: new Buffer(yamlContents).toString("base64"),
      ReleaseDate: lastModifiedTime,
      Required: false,
    };
  });

  return {
    status: 200,
    body: JSON.stringify({
      Versions: versions,
      UpdatePolicy: "manual",
    }),
  };
}
