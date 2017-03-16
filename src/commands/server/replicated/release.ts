import * as fs from "fs";
import * as _ from "lodash";
import * as yaml from "js-yaml";

import consts from "../consts";

export function listAvailableReleases() {
  const files = fs.readdirSync(consts.localPath);
  const releases: String[] = [];
  files.forEach((file) => {
    // Valid releases are <int>.y[a]ml
    if (_.endsWith(file, ".yaml") || _.endsWith(file, ".yml")) {
      const filenameParts = _.split(file, ".");
      if (filenameParts.length !== 2) {
        return;
      }

      const sequence = _.parseInt(filenameParts[0]);
      if (_.isNaN(sequence)) {
        return;
      }

      releases.push(file);
    }
  });

  return _.sortBy(releases, (release) => {
    return _.parseInt(_.split(release, ".")[0]);
  });
}

export function listAvailableReleasesAfter(minSequence) {
  const availableReleases = listAvailableReleases();
  return _.remove(availableReleases, (release) => {
    const sequence = _.parseInt(_.split(release, ".")[0]);
    return sequence > minSequence;
  });
}

export function fillOutYaml(filename) {
  const doc = yaml.safeLoad(fs.readFileSync(filename, "utf8"));

  // Some fields are added by the real api and we need to simulate that here

  doc.components.forEach((component) => {
    component.containers.forEach((container) => {
      if (!container.logs) {
        container.logs = {
          max_size: "",
          max_files: "",
        };
      }
    });
  });

  return yaml.safeDump(doc);
}
