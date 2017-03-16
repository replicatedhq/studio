import "source-map-support/register";

exports.command = "import";
exports.describe = "import your app yaml";
exports.builder = (yargs) => {
    return yargs.commandDir("import");
};
