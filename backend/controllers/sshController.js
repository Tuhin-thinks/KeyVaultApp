import fs from "fs";
import { exec } from "child_process";
import path from "path";
import { generate_random_filename } from "../utils/key_generation.js";

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
            return res.status(500).send("Internal Server Error");
        } else if (stderr) {
            console.log(stderr);
            return res.status(400).send("Bad Request");
        } else {
            console.log(stdout);
        }
    });

    return res.status(200).send({
        privateKeyID,
    });
};

const downloadprivateKeyFile = (req, res) => {
    const privateKeyID = req.params.id;
    const sshKeyPath = path.join(
        process.env.SSH_KEY_PATH,
        `key_${privateKeyID}`
    );
    if (fs.existsSync(sshKeyPath)) {
        res.download(sshKeyPath);
    } else {
        res.status(404).send("Not Found");
    }
};

export { getSSHRegisteredClients, generateSSHKey, downloadprivateKeyFile };

