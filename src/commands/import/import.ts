import "source-map-support/register";
import * as fs from "fs";
import * as popsicle from "popsicle";
import * as yargs from "yargs";

exports.describe = "import your import";
exports.builder = {};

yargs.nargs("app", 1)
  .describe("app", "your app name")
  .demandOption(["app"]);

yargs.nargs("apikey", 1)
  .describe("apikey", "your vendor-web api key")
  .demandOption(["apikey"]);

yargs.nargs("channel", 1)
  .describe("channel", "your release channel")
  .demandOption(["channel"]);

exports.handler = async (argv) => {
  popsicle.get({
    url: "https://api.replicated.com/vendor/v1/apps",
    headers: {
      Authorization: argv.apikey,
    },
  }).then((result: any) => {
    if (result.status === 200) {
      findApp(argv, result.body);
    } else {
      console.log("Unable to get apps: " + result.status);
    }
  }).catch(err => {
    console.log("Error: " + err);
  });
};

function findApp(argv, body) {
  let apps = JSON.parse(body);
  apps.forEach((app => {
      if (app.App.Name === argv.app) {
        findChannel(argv, app.App.Id, app.Channels);
      }
  }));
}

function findChannel(argv: any, appId: string, channels: any) {
    let maxReleaseSeq = 0;
    channels.forEach((channel => {
        if (channel.Name === argv.channel) {
            maxReleaseSeq = channel.ReleaseSequence;
        }
    }));

    if (maxReleaseSeq === 0) {
        console.log("No available release!");
        process.exit(1);
    }

    let selectedReleaseSeq;
    if (argv.release === "") {
        selectedReleaseSeq = maxReleaseSeq;
    } else {
        selectedReleaseSeq = argv.release;
    }

    downloadAppYaml(argv, appId, selectedReleaseSeq, maxReleaseSeq);
}

function downloadAppYaml(argv: any, appId: string, releaseSeqNumber: number, maxReleaseSeqNumber: number) {
    popsicle.get({
        url: "https://api.replicated.com/vendor/v1/app/" + appId + "/" + releaseSeqNumber + "/raw",
        headers: {
            Authorization: argv.apikey,
        },
    }).then((result: any) => {
        if (result.status === 200) {
            fs.writeFile("/replicated/" + maxReleaseSeqNumber, result.body);
            console.log("Wrote app yaml to /replicated/" + maxReleaseSeqNumber);
        } else {
            console.log("Unable to get apps, upstream server returned " + result.status);
        }
    }).catch(err => {
        console.log("Error: " + err);
    });
}
