import express from "express";
import { config } from "dotenv";

// configure the dotenv package to read the .env file
config({
    path: "./.env",
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import { sshRouter } from "./routes/sshRouter.js";

// register the routes
app.use("/ssh", sshRouter);

app.listen(3000, () => {
    console.log("Listening on port 3000");
});

process.on("SIGINT", () => {
    console.log("Bye bye!");
    process.exit();
});

process.on("SIGTERM", () => {
    console.log("Bye bye!");
    process.exit();
});

process.on("uncaughtException", (err) => {
    console.log("Uncaught exception!"); // TODO: We should add a logger here
    console.log(err);
    process.exit();
});

