import "source-map-support/register";

exports.command = "server";
exports.describe = "run the studio server";
exports.builder = (yargs) => {
    return yargs.commandDir("server");
};
