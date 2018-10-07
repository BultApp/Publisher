import { Publisher } from "./Publisher";
import { Login } from "./Login";

let yargs = require("yargs");
let fs = require("fs");
let path = require("path");
let bultJSON = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "package.json")));


let argv = yargs
    .usage("Bult Publisher allows developers to publish their ChatBotCE addons to the Bult registry.\n\nUsage: $0 [options]")
    .help("help").alias("help", "h")
    .version("version", bultJSON.version).alias("version", "V")
    .options({}).argv;

function start() {
    if (argv._ === undefined || argv._ === null || argv._.length <= 0) {
        yargs.showHelp();
        return;
    }

    if (argv._[0].toLowerCase() === "publish") {
        return new Publisher();
    } else if (argv._[0].toLowerCase() === "login") {
        return new Login();
    } else if (argv._[0].toLowerCase() === "logout") {
        if (!fs.existsSync(path.resolve(__dirname, "..", "token.json"))) {
            console.log("A Bult user has not been logged in.");
        } else {
            fs.unlink(path.resolve(__dirname, "..", "token.json"), (error: any) => {
                if (error) {
                    throw error;
                }
                
                console.log("The login has been cleared. You can not login again.");
            });
        }
    }
}

start();