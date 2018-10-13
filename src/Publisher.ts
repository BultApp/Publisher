process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import * as r from "request";
import * as JSZip from "jszip";
let fs = require("fs");
let path = require("path");

export class Publisher {
    constructor() {
        // TODO: Add detection for login to ensure that a valid user is logged in.

        let directory = process.cwd();
        let packageJSON = JSON.parse(fs.readFileSync(path.resolve(directory, "package.json")));

        if (!("bult" in packageJSON)) {
            console.log("Bult Publisher configuration not found. Please ensure you're running Bult Publisher on a valid Bult module/addon");
            return;
        }

        if (!("publisher" in packageJSON["bult"])) {
            console.log("Bult Publisher configuration not found. Please ensure you're running Bult Publisher on a valid Bult module/addon");
            return;
        }

        if (!("files" in packageJSON["bult"]["publisher"])) {
            console.log("Bult Publisher files configuration not found. Please ensure you're running Bult Publisher on a valid Bult module/addon");
            return;
        }

        let fileData: { [index: string]: any } = {};

        fileData["package.json"] = fs.readFileSync(path.resolve(directory, "package.json"));

        packageJSON["bult"]["publisher"]["files"].forEach((file: any) => {
            
        });

        let files: Array<any> = [];

        packageJSON["bult"]["publisher"]["files"].forEach((file: any) => {
            files.push(fs.createReadStream(path.resolve(directory, file)));
        });

        files.push(fs.createReadStream(path.resolve(directory, "package.json")));

        let zip = new JSZip();
        let userToken = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "token.json")));

        packageJSON["bult"]["publisher"]["files"].forEach(((file: any) => {
            zip.file(file, fs.readFileSync(path.resolve(directory, file)));
        }));
    
        zip.file("package.json", fs.readFileSync(path.resolve(directory, "package.json")));
    
        zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
            .pipe(fs.createWriteStream(path.resolve(directory, `${packageJSON.name}-${packageJSON.version}.zip`)))
            .on('finish', function () {
                console.log("Bult has compressed the files, preparing to upload.");

                let options = {
                    url: "https://bult.test/api-registry/v1/addon/publish",
                    headers: {
                        "Authorization": `Bearer ${userToken.access_token}`,
                        "Content-Type": "multipart/form-data"
                    },
                    formData: {
                        addon: fs.createReadStream(path.resolve(directory, `${packageJSON.name}-${packageJSON.version}.zip`)),
                        package: JSON.stringify(packageJSON)
                    },
                    json: true
                };
        
                r.post(options, (err: any, response: any, body: any) => {
                    if (err) {
                        return console.error('upload failed:', err);
                    }
        
                    if (body.message) {
                        console.error('message:', body.message);
                    }

                    fs.unlinkSync(path.resolve(directory, `${packageJSON.name}-${packageJSON.version}.zip`));
                });
            });

}