const Message = require('../models/Message');
const Store = require('../util/Store');
const User = require("../models/User"), Guild = require("../models/Guild"), Member = require("../models/Member"), Channel = require("../models/TextChannel");
const Context = require("../models/Context");

module.exports = {
    'ready': (client, d) => {
        client.user = new User(d.d.user, client);
        client.sessionId = d.d.session_id;

        for (const [obj] in d.d.guilds) {
            client.guilds.set(d.d.guilds[obj].id, { available:false });
        }

        client.emit('ready');
    },

    'guildCreate': (client, d) => {
        let obj = d.d;

        let channels = new Store();
        for (let channel of d.d.channels) {
            channel = new Channel(channel, client);
            channels.set(channel.id, channel);
            client.channels.set(channel.id, channel);
        }

        let members = new Store();
        obj.channels = channels;
        for (let member of obj.members) {
            let user = new User(member.user, client);
            client.users.set(member.user.id, user);
        }
        const guild = new Guild(obj, client);
        for (let member of obj.members) {
            member = new Member(member.user, member, guild, client);
            members.set(member.id, member);
        }
        guild.members = members;
        guild.owner = guild.members.get(obj.owner_id);

        if (client.guilds.has(d.d.id) && client.guilds.get(d.d.id).available == false) {
            client.guilds.set(d.d.id, guild);
            client.emit('guildAvailable', guild);
        } else {
            client.guilds.set(d.d.id, guild);
            client.emit('guildCreate', guild);
        }
    },

    'message': (client, d) => {
        const channel = client.channels.get(d.d.channel_id);
        let msg = channel.messages.get(d.d.id);
        if (msg) return;
        msg = new Message(d.d, {
            guild: client.guilds.get(d.d.guild_id),
            channel: channel
        }, client);
        channel.messages.set(msg.id, msg);
        let ctx = new Context(msg, client);

        client.emit('message', ctx);
        client.processCommands(ctx);
    },

    'messageEdit': (client, d) => {
        const channel = client.channels.get(d.d.channel_id);
        const guild = client.guilds.get(d.d.guild_id);
        let oldMsg = channel.messages.get(d.d.id);
        if (!oldMsg){
            oldMsg = new Message(d.d, {
                guild: guild,
                channel: channel
            }, client);
        }
        let newMsg = new Message(oldMsg, {guild:oldMsg.guild, channel:oldMsg.channel}, client);
        newMsg.content = d.d.content;
        newMsg.embed = d.d.embed;
        newMsg.mentions = [];
        if (d.d.mentions){
            for (let mention of d.d.mentions){
                newMsg.mentions.push(guild.members.get(mention.id));
            }
        }
        channel.messages.set(d.d.id, newMsg)
    },

    'channelCreate': (client, d) => {
        
    }
}