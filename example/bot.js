const discorded = require("../src/index");
const meta = require("./commands/meta");

console.log(`Discorded version ${discorded.version}`);

function getPrefix(client, message){
    return ["dc.", "dc "];
}

const client = new discorded.client(getPrefix, require("./config.json").token);
client.loadCommands(meta);

client.on("commandError", err => {
    ctx.send("There was an error, try again later.");
});

client.on("ready", async() => {
    console.log(`Logged in as ${client.user.toString()}`);
});

client.on("checkError", ctx => {
    ctx.send("You do not have permissions to do that.");
});

client.on("notNSFW", ctx => {
    ctx.send("This command cna only be used in nsfw channels.");
});