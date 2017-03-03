import getAppDefaultRelease from "./handlers/getAppDefaultRelease";
import getAppOneRelease from "./handlers/getAppOneRelease";
import getAppUpgrades from "./handlers/getAppUpgrades";

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

  //
  // proxied routes
  //
  echoClientIP: {
    path: "*",
    method: "proxy",
  },
};
