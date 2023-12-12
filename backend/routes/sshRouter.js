import express from "express";
import {
    getSSHRegisteredClients,
    generateSSHKey,
    downloadprivateKeyFile,
    connectToSSHClient as connect,
    navigateToDirectory as navigate,
    listDirectory,
} from "../controllers/sshController.js";

const router = express.Router();

router.get("/", getSSHRegisteredClients);
router.post("/generate", generateSSHKey);
router.get("/download/:id", downloadprivateKeyFile);
router.post("/connect", connect);
router.post("/navigate", navigate);
router.post("/list-dir", listDirectory);

export { router as sshRouter };

