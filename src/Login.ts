process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let fs = require("fs");
let path = require("path");
let prompt = require('prompt-promise');
import * as rp from "request-promise";

export class Login {
    constructor() {
        if (fs.existsSync(path.resolve(__dirname, "..", "token.json"))) {
            console.log("A Bult user has already been logged in. Please clear out the token file before logging in again.");
        } else {
            // TODO: Make this an interactive console input.
            let login = {
                email: "",
                password: "",
            }


            let options = {
                method: "POST",
                uri: "https://bult.test/api-auth/v1/login",
                body: login,
                json: true,
            };
            
            prompt("Bult Email: ")
                .then((value: any) => {
                    login.email = value;

                    return prompt.password("Bult Password: ")
                })
                .then((value: any) => {
                    login.password = value;
                    
                    prompt.done()

                    return rp(options);
                })
                .then((body: any) => {
                    if (body.error) {
                        console.log(`Could not log into Bult. Message "${body.message}".`);
                    } else {
                        body["expires_at"] = Date.now() + Math.floor(body["expires_in"] / 1.01);

                        fs.writeFile(path.resolve(__dirname, "..", "token.json"), JSON.stringify(body), (err: any) => {
                            if (err) {
                                throw err;
                            }

                            console.log("You're now logged into Bult! You can now publish to the Bult addon registry.");
                        });
                    }
                })
                .catch((error: any) => {
                    console.log(`Could not log into Bult. Error: "${error.message}"`);
                    prompt.finish();
                });
        }
    }
}