import * as fs from "fs";
import * as _ from "lodash";
import * as chalk from "chalk";
import * as path from "path";
import * as linter from "replicated-lint";

import consts from "../consts";
import {fillOutYaml, listAvailableReleasesAfter} from "../replicated/release";

const ruleNotifiesAt = threshold => rule => !linter.ruleTypeLT(rule.type, threshold);

function releaseDetails(release, yamlContents: any, lastModifiedTime: string) {
  return {
    Sequence: _.parseInt(_.split(release, ".")[0]),
    ReleaseYaml: new Buffer(yamlContents).toString("base64"),
    ReleaseDate: lastModifiedTime,
    Required: false,
  };
}

export default async function (req) {
  const currentVersion = req.body.CurrentVersion;
  const releases = listAvailableReleasesAfter(currentVersion);

  const failedPaths = [] as string[];
  const versions = [] as any[];
  if (!releases) {
    return [];
  }
  _.forEach(releases, (release) => {
    let releasePath = path.join(consts.localPath, release);
    const lastModifiedTime = fs.lstatSync(releasePath).mtime.toISOString();
    const yamlContents = fillOutYaml(releasePath);

    const shouldLint = consts.lintThreshold !== "off";

    if (!shouldLint) {
      versions.push(releaseDetails(release, yamlContents, lastModifiedTime));
      return;
    }

    const ruleSet =  linter.rules.all.filter(ruleNotifiesAt(consts.lintThreshold));

    const linterErrors = linter.lint(
      yamlContents,
      {
        rules: ruleSet,
        schema: linter.schemas.parsed,
      },
    );

    if (!_.isEmpty(linterErrors)) {
      console.log();
      console.log(chalk.yellow(`${linterErrors.length} errors in ${releasePath}:`));
      linter.cmdutil.reporters.consoleReporter(
        yamlContents,
        ruleSet,
        linterErrors,
      );
      failedPaths.push(releasePath);
      return;
    }

    versions.push(releaseDetails(release, yamlContents, lastModifiedTime));
  });

  if (!_.isEmpty(failedPaths)) {
    console.log();
    console.log(chalk.yellow("One or more releases were not included in the release list because they failed linting."));
    console.log(chalk.yellow("Please correct the errors in"));
    console.log(chalk.yellow("  * " + failedPaths.join("\n  * ")));
  }

  return {
    status: 200,
    body: JSON.stringify({
      Versions: versions,
      UpdatePolicy: "manual",
    }),
  };
}
