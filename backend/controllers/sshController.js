import fs from "fs";
import { exec } from "child_process";
import path from "path";
import { generate_random_filename } from "../utils/key_generation.js";
import { connect, execute } from "./ssh2-client.js";

const ssh_clients = {};

const getSSHRegisteredClients = (req, res) => {
    res.send("sshController");
};

/**
 * Function to generate SSH key and return the private key to the client, keep the public key in the server
 * @param {*} req
 * @param {*} res
 */
const generateSSHKey = async (req, res) => {
    const privateKeyID = generate_random_filename();

    const sshKeyPath = path.join(
        process.env.SSH_KEY_PATH,
        `key_${privateKeyID}`
    );
    const key_generation_command = `ssh-keygen -t rsa -b 4096 -f ${sshKeyPath} -N ""`;
    exec(key_generation_command, (err, stdout, stderr) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ message: "Internal Server Error" });
        } else if (stderr) {
            console.log(stderr);
            return res.status(400).send({ message: "Bad Request" });
        } else {
            console.log(stdout);
        }
    });

    return res.status(200).send({
        privateKeyID,
    });
};

/**
 * After private and public key are generated, the client can download the private key file
 * @param {*} req
 * @param {*} res
 */
const downloadprivateKeyFile = (req, res) => {
    const privateKeyID = req.params.id;
    const sshKeyPath = path.join(
        process.env.SSH_KEY_PATH,
        `key_${privateKeyID}`
    );
    if (fs.existsSync(sshKeyPath)) {
        res.download(sshKeyPath);
    } else {
        res.status(404).send({ message: "Inavlid Private key ID" });
    }
};

/**
 * To connect to client using SSH, the client must send the host, username and private key ID
 * @param {*} req
 * @param {*} res
 * @returns
 */
const connectToSSHClient = async (req, res) => {
    const { host, username, privateKeyID } = req.body;

    try {
        const config = {
            host,
            port: 22,
            username,
            privateKey: fs.readFileSync(
                path.join(process.env.SSH_KEY_PATH, `key_${privateKeyID}`)
            ),
        };

        if (!ssh_clients[privateKeyID]) {
            const conn = await connect(config);
            ssh_clients[privateKeyID] = conn;
        }
        return res.status(200).send({ message: "OK" });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: err.message ?? err });
    }
};

/**
 * Function to navigate to a directory in the client, for the provided private key ID
 * @param {*} req
 * @param {*} res
 * @returns
 */
const navigateToDirectory = async (req, res) => {
    const { privateKeyID, directoryPath } = req.body;
    const { code, signal } = await execute(
        ssh_clients[privateKeyID],
        `cd ${directoryPath}`,
        process.stdout
    );
    return res.status(200).send({ code, signal });
};

/**
 * Function to list all files and folders in a directory
 * @param {*} req
 * @param {*} res
 * @returns
 */
const listDirectory = async (req, res) => {
    const { privateKeyID } = req.body;

    if (!ssh_clients[privateKeyID])
        return res.status(400).send({ message: "SSH client not connected" });

    let contents = [];

    const { code } = await execute(
        ssh_clients[privateKeyID],
        `ls`, // TODO: Add support for windows devices
        contents,
        process.stdout
    );

    if (code !== 0)
        return res
            .status(500)
            .send({ message: "Failed to list contents of the directory" });

    return res.status(200).send({ contents });
};

export {
    getSSHRegisteredClients,
    generateSSHKey,
    downloadprivateKeyFile,
    connectToSSHClient,
    navigateToDirectory,
    listDirectory,
};

