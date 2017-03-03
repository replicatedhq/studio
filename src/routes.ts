import getAppDefaultRelease from "./handlers/getAppDefaultRelease";
import getAppOneRelease from "./handlers/getAppOneRelease";
import getAppUpgrades from "./handlers/getAppUpgrades";
import getAppMetadata from "./handlers/getAppMetadata";

export default {
  //
  // local routes
  //
  getAppDefaultRelease: {
    path: "/v1/app/:appId",
    method: "get",
    handler: getAppDefaultRelease,
  },
  getAppOneRelease: {
    path: "/v1/app/:appId/:sequence",
    method: "get",
    handler: getAppOneRelease,
  },
  getAppUpgrades: {
    path: "/v1/app/:appId/upgrades",
    method: "post",
    handler: getAppUpgrades,
  },
  getAppMetadata: {
    path: "/app/:appId/:sequence/metadata",
    method: "get",
    handler: getAppMetadata,
  },

  //
  // proxied routes
  //
  echoClientIP: {
    path: "*",
    method: "proxy",
  },
};
