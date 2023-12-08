import express from "express";
import {
    getSSHRegisteredClients,
    generateSSHKey,
    downloadprivateKeyFile,
} from "../controllers/sshController.js";

const router = express.Router();

router.get("/", getSSHRegisteredClients);
router.post("/generate", generateSSHKey);
router.get("/download/:id", downloadprivateKeyFile);

export { router as sshRouter };

