import * as fs from "fs";
import * as _ from "lodash";
import * as path from "path";
import * as yaml from "js-yaml";

import consts from "../consts";

function listAvailableReleasesInDir(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const files = fs.readdirSync(filePath);
  const releases: string[] = [];
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

export function listAvailableReleases() {
  let files = listAvailableReleasesInDir(path.join(consts.localPath, "releases"));

  if (files.length === 0) {
    // create "releases" dir if it does not already exist
    if (!fs.existsSync(path.join(consts.localPath, "releases"))) {
        fs.mkdirSync(path.join(consts.localPath, "releases"));
    }

    // check parent dir for releases as part of migration process
    files = listAvailableReleasesInDir(consts.localPath);
    // and copy them to the releases dir if they exist
    if (files.length !== 0) {
      files.forEach((file) => {
          fs.copyFileSync(file, path.join(consts.localPath, "releases", path.basename(file)));
      });
      files = listAvailableReleasesInDir(path.join(consts.localPath, "releases"));
    }
  }
  return files;
}

export function listAvailableReleasesAfter(minSequence) {
  const availableReleases = listAvailableReleases();
  return _.remove(availableReleases, (release) => {
    const sequence = _.parseInt(_.split(release, ".")[0]);
    return sequence > minSequence;
  });
}

export function fillOutDoc(doc: any) {
// Some fields are added by the real api and we need to simulate that here
  if (doc.components) {
    doc.components.forEach((component) => {
      component.containers.forEach((container) => {
        if (!container.logs) {
          container.logs = {
            max_size: "",
            max_files: "",
          };
        }
        if (container.env_vars) {
          container.env_vars.forEach((envvar) => {
            if (envvar.static_val && !envvar.value) {
              envvar.value = envvar.static_val;
            }
            if (envvar.value && !envvar.static_val) {
              envvar.static_val = envvar.value;
            }
          });
        }
      });
    });
  }
  return doc;
}

export function fillOutYaml(filename) {
  const doc = yaml.safeLoad(fs.readFileSync(filename, "utf8"));
  fillOutDoc(doc);
  return yaml.safeDump(doc);
}
