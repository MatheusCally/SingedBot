const Discord = require("discord.js");
const config = require("./config.json");
const { MessageEmbed } = require('discord.js');
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES","GUILD_PRESENCES","GUILD_MEMBERS","GUILD_BANS"]});
client.login(config.BOT_TOKEN);

const heitorId = '450337907383730190';

const prefix = "$";
function getInterval(initialDate,finalDate){
    return (finalDate.getTime() - initialDate.getTime()) / (1000 * 60);
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

function memberTimeout(message,id,minutes,reason){
    message.guild.members.cache.filter(member => {
        if(member.user.id == id){
            member.disableCommunicationUntil(addMinutes(new Date(),minutes),reason ? reason : '').then((member)=>{
                replyMessage = `<@${member.user.id}> tomou ${minutes} minutinhos pra ficar esperto, isto deve doer! `;
                console.log(replyMessage);
                message.reply(replyMessage);
            });
        }
    })
}

function memberRemoveTimeout(message,id){
    message.guild.members.cache.filter(member => {
        if(member.user.id == id){
            member.disableCommunicationUntil(null).then((member)=>{
                replyMessage = `<@${member.user.id}> liberdade cantou, eu te ouço!`
                console.log(replyMessage);
                message.reply(replyMessage)
            });
        }
    })
}

function adminCheck(message){
    if(message.member.permissions.has("ADMINISTRATOR")){
        return true;
    } else{
        message.reply('Sai fora chapa, nem administrador é e quer meter o louco');
        return false;
    }
}

client.on('ready', () => {
    client.user.setActivity('cola no seu pé',{type: 'PLAYING',url: 'http://colherelerda.com'});
})
client.on("messageCreate", function(message) { 
    if(message.content.charAt(0) == prefix && !message.member.user.bot){
        const commandBody = message.content.slice(prefix.length);
        const args = commandBody.split(' ');
        const command = args.shift().toLowerCase();
        
        switch(command){
            case 'help':
            const embed = new MessageEmbed()
            .setTitle('Comandos do Singed Bot')
            .setColor('#1d8e25')
            .setDescription('Já era a hora.')
            .setURL('http://colherelerda.com/')
            .setThumbnail('https://i.imgur.com/qWcChAl.png')
            .addFields(
                { name: '$caio', value: 'descreve o nosso amigo Caio' },
                { name: '$heitor', value: 'descreve o nosso amigo Heitor' },
                { name: '$luis', value: 'descreve o nosso amigo Luis' },
                { name: '$lol', value: 'ameaça de ban todos que estão jogando essa merda no momento' },
                { name: '$ban {usuario} {tempo}', value: 'aplica timeout no usuário marcado no tempo indicado, caso não seja informado o tempo, serão só 5 minutos' },
                { name: '$unban {usuario}', value: 'retira o timeout do usuário marcado' },
            )
            .setImage('https://i.imgur.com/iIzaJGg.jpg')
            .setFooter({ text: 'Está do seu agrado???'});
            message.reply({ embeds: [embed]})
            break;
            
            case "caio":
            message.reply(`Macaco gorila chimpanzé orangotango`);
            break;
            
            case "heitor":
            message.reply(`gay`);
            break;
            
            case "luis":
            message.channel.send('Luis come traveco');
            break;
            
            case "lol":
            message.guild.members.cache.filter(member => {
                if(member.presence){
                    if(member.presence.activities.length > 0){
                        if(member.presence.activities[0].name == 'League of Legends'){
                            message.channel.send(`<@${member.user.id}> toma cuidado, vai levar ban se continuar jogando Lol.`);
                        }
                        
                    }
                }
            });
            break;
            
            case "ban":
            if(adminCheck(message)){
                if(args[0]){
                    arg1 = args.shift().toLowerCase();
                    userId = arg1.substring(arg1.indexOf('!') + 1,arg1.indexOf('>'));
                    if(args[0]){
                        minutes = args.shift().toLowerCase();
                        isNaN(minutes) ? '' : memberTimeout(message,userId,minutes,'Saiu sem autorização');
                    } else{
                        memberTimeout(message,userId,5,'Saiu sem autorização');
                    }
                } 
            }
            break;
            
            case "unban":
            if(adminCheck(message)){
                if(args[0]){
                    userId = args[0].substring(args[0].indexOf('!') + 1,args[0].indexOf('>'));
                    memberRemoveTimeout(message,userId);
                }
            }
            break;
            
        }
    }
}); 

client.on('guildMemberRemove', member => {
    client.channels.fetch('495690331447099403').then(channel => {
        channel.send(` A saída de ${member.user.tag} está do meu agrado.`);
    });
});

