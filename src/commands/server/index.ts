import "source-map-support/register";
import * as express from "express";
import * as proxy from "express-http-proxy";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as uuid from "uuid";
import * as chalk from "chalk";
import * as _ from "lodash";
import * as util from "util";
import * as fs from "fs";
import * as path from "path";
import * as process from "process";

import routes from "./routes";
import consts from "./consts";

const app = express();
app.use(bodyParser.json());
app.use(cors());

exports.command = "server";
exports.describe = "runs the studio server";
exports.handler = async (argv) => {
  console.log("Starting studio server");
  buildRoutes();
  watch();
  serve();
};

function buildRoutes() {
  // Add a healthcheck endpoint
  app.get("/healthz", (req, res) => {
    res.send("");
  });

  // Define the handling callback for each route.
  _.forOwn(routes, (route, handlerName) => {
    const routeCallback = (req, res) => {
      const reqId = `${handlerName}:${uuid.v4().replace("-", "").substring(0, 8)}`;
      console.log(chalk.yellow(`[${reqId}] <- ${req.method} ${req.originalUrl}`));
      if (!_.isEmpty(req.body)) {
        let bodyString = JSON.stringify(req.body);
        if (bodyString.length > 512) {
          bodyString = `${bodyString.substring(0, 512)} (... truncated, total ${bodyString.length} bytes)`;
        }
        console.log(chalk.yellow(`[${reqId}] <- ${bodyString}`));
      }

      const handlerFunc = route.handler;

      // FIXME: I couldn't get this to work using async/await. Node kept complaining about
      // unhandled promise rejections. Something to do with the transpiler?
      handlerFunc(req)
          .then((result: any) => {
            if (result) {
              let statusToSend = result.status || 200;
              let contentType = result.contentType || "application/json";

              let bodyToLog = result.body;
              if (!bodyToLog) {
                bodyToLog = "";
              } else if (bodyToLog.length > 512) {
                bodyToLog = `${bodyToLog.substring(0, 512)} (... truncated, total ${bodyToLog.length} bytes)`;
              }
              console.log(chalk.cyan(`[${reqId}] => ${result.status} ${bodyToLog}`));
              let respObj = res.status(statusToSend).type(contentType).set("X-ReplicatedLocal-RequestId", reqId);
              if (result.filename) {
                respObj.attachment(result.filename);
              }
              if (result.headers) {
                _.forOwn(result.headers, (value, key) => {
                  respObj.set(key, value);
                });
              }
              respObj.send(result.body);
            } else {
              // Generic response. Shouldn't happen in most cases, but...
              console.log(chalk.cyan(`[${reqId}] => 200`));
              res.status(200).set("X-ReplicatedLocal-RequestId", reqId).json(result);
            }
          })
          .catch((err) => {
            if (err.status) {
              // Structured error, specific status code.
              const errMsg = err.err ? err.err.message : "An unexpected error occurred";
              console.log(chalk.red(`[${reqId}] !! ${err.status} ${errMsg} ${err.stack || util.inspect(err)}`));
              const bodyToSend = {
                error: errMsg,
              };
              res.status(err.status).set("X-ReplicatedLocal-RequestId", reqId).json(bodyToSend);
            } else {
              // Generic error, default code (500).
              const bodyToSend = {
                error: err.message || "An unexpected error occurred",
              };
              console.log(chalk.red(`[${reqId}] !! 500 ${err.stack || err.message || util.inspect(err)}`));
              res.status(500).set("X-ReplicatedLocal-RequestId", reqId).json(bodyToSend);
            }
          });
    };

    // Register this route and callback with express.
    console.log(`[${route.method}] '${route.path}'`);
    if (route.method === "get") {
      app.get(route.path, routeCallback);
    } else if (route.method === "post") {
      app.post(route.path, routeCallback);
    } else if (route.method === "put") {
      app.put(route.path, routeCallback);
    } else if (route.method === "delete") {
      app.delete(route.path, routeCallback);
    } else if (route.method === "proxy") {
      app.use(route.path, proxy(consts.upstreamEndpoint, {
        forwardPath: (req, res) => {
          return path.join(require("url").parse(consts.upstreamEndpoint).path, req.originalUrl);
        },
      }));
    } else {
      console.log(`Unhandled HTTP method: '${route.method}'`);
    }
  });

  app.use((req, res, next) => {
    const errMsg = `Route not found for ${req.method} ${req.originalUrl}`;
    console.log(chalk.red(`[${req.ip}] ${errMsg}`));
    res.status(404).send(errMsg);
  });
}

function watch() {
  if (!fs.existsSync(consts.localPath)) {
    console.log(chalk.red(`Please create your application yaml at ${consts.localPath} before continuing.`));
    process.exit(1);
  }
  console.log(chalk.green(`Watching "${consts.localPath}" for changes. Any updates to this file will be sent as an application update.`));
}

function serve() {
  app.listen(8006, "0.0.0.0", () => {
    console.log("Replicated Studio listening on port 8006...");
  });
}
