import { Client } from "ssh2";
import { parseBufferToList } from "../utils/ssh_output_parser.js";

const connect = (config) => {
    return new Promise((resolve, reject) => {
        try {
            const conn = new Client();
            conn.on("ready", () => {
                resolve(conn);
            })
                .on("error", (err) => {
                    reject(
                        new Error(
                            `Error while connecting to ${config.username}@${
                                config.host
                            }:\n         ${err.message ?? err}`
                        )
                    );
                })
                .connect(config);
        } catch (err) {
            reject(
                new Error(
                    `Error while connecting to ${config.username}@${
                        config.host
                    }:\n         ${err.message ?? err}`
                )
            );
        }
    });
};

const execute = (conn, cmd, output_arr, writeStream) => {
    return new Promise((resolve, reject) => {
        conn.exec(cmd, (err, stream) => {
            if (err)
                reject(
                    new Error(
                        `Error while executing ${cmd}:\n         ${
                            err.message ?? err
                        }`
                    )
                );
            stream
                .on("close", (code, signal) => {
                    resolve({ code, signal });
                })
                .on("data", (data) => {
                    output_arr.push(...parseBufferToList(data));
                    writeStream.write("STDOUT: " + data);
                })
                .stderr.on("data", (data) => {
                    writeStream.write("STDERR: " + data);
                });
        });
    });
};

export { connect, execute };

