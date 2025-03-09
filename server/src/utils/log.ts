import * as fs from "fs";

const log = fs.createWriteStream("/tmp/log.txt");

export default {
  write: (message: object | unknown) => {
    if (typeof message === "object") {
      log.write(JSON.stringify(message));
    } else {
      log.write("Unknown message type");
    }
    log.write("\n");
  },
};
