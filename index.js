const { readdir } = require("fs")
const Discord = require("discord.js");
const { BOT_TOKEN, prefix, RIOT_TOKEN } = require("./config.json");
const { MessageEmbed } = require('discord.js');
const http = require('http')

//Set client object
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_PRESENCES", "GUILD_MEMBERS", "GUILD_BANS"] });

//Set commands object
var commands = {
    "help": {
        uso: "",
        desc: "da ajuda",
        run: (message, args) => {
            var cmds = []
            for (cmd in commands) {
                console.log(cmd)
                cmds.push({name:`$${cmd} ${commands[cmd].uso}`,value:commands[cmd].desc})
            }
            const embed = new MessageEmbed()
                .setTitle('Comandos do Singed Bot')
                .setColor('#1d8e25')
                .setDescription('Já era a hora.')
                .setURL('http://colherelerda.com/')
                .setThumbnail('https://i.imgur.com/qWcChAl.png')
                .addFields(cmds)
                .setImage('https://i.imgur.com/iIzaJGg.jpg')
                .setFooter({ text: 'Está do seu agrado???' });
            message.reply({ embeds: [embed] })
        }
    }
}

//Add command modules
readdir('./comandos', (err, files) => {
    if (err) { console.log(err) }
    files.filter(file => file.endsWith('.js'));
    for (const file of files) {
        const com = require(`./comandos/${file}`)
        commands[file.split(".")[0]] = com
    }
})

// Actions executed when the bot is runned
client.on('ready', () => {
    //Set bot game activity
    client.user.setActivity('cola no seu pé', { type: 'PLAYING', url: 'http://colherelerda.com' });
})

// Message command reader
client.on("messageCreate", message => {
    if (message.content.charAt(0) == prefix && !message.member.user.bot) {
        const commandBody = message.content.slice(prefix.length);
        const args = commandBody.split(' ');
        const command = args.shift().toLowerCase();
        if (commands.hasOwnProperty(command)) {
            try {
                commands[command].run(message, args)
            } catch (err) { if (err) { console.log(err) } }
        }
        else {
            message.reply("comando não encontrado")
        }
    }
});

// Send a message on the channel when an user is kicked
client.on('guildMemberRemove', member => {
    client.channels.fetch('495690331447099403').then(channel => {
        channel.send(` A saída de ${member.user.tag} está do meu agrado.`);
    });
});
client.login(BOT_TOKEN);
