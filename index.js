import Discord from 'discord.js';
import {patch,champions,summonerData,memberTimeout,memberRemoveTimeout,adminCheck} from './functions.js';
import {MessageEmbed} from 'discord.js';
import {singedBotToken as SINGED_BOT_TOKEN,riotHostname as RIOT_HOSTNAME,embedHelp as EMBED_HELP} from './constants.js';
import fetch from 'node-fetch';
import {exec} from 'child_process';
import { BOT_TOKEN } from './config.js';

const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES","GUILD_PRESENCES","GUILD_MEMBERS","GUILD_BANS", 'GUILD_VOICE_STATES']});

client.login(BOT_TOKEN);


// Bot Prefix for messages
const prefix = "$";

// Message command reader
client.on("messageCreate", async function(message) { 
    if(message.content.charAt(0) == prefix && !message.member.user.bot){
        const commandBody = message.content.slice(prefix.length);
        const args = commandBody.split(' ');
        const command = args.shift().toLowerCase();
        
        
        switch(command){
            case 'roletarussa':
            if(adminCheck(message)){
                const userId = message.member.id;
                message.guild.members.fetch(userId).then(res => {
                    var voiceChatRelated = res.voice;
                    const membersInVoice = voiceChatRelated.channel.members;
                    var memberToKick = membersInVoice.random();
                    memberToKick.voice.disconnect(`ROLETA RUSSA RODOU E UMA DEDADA VOCÊ TOMOU`)
                    message.reply(`<@${memberToKick.user.id}> ROLETA RUSSA RODOU E UMA DEDADA VOCÊ TOMOU`)
                }) 
            }
            break;
            
            case 'patch':
            message.reply(`Tamo no patch ${await patch()} chefe`)
            break;
            // Help command
            case 'help':
            message.reply({ embeds: [EMBED_HELP]})
            break;
            
            // Returns the champion with most mastery from a summoner
            case "main":
            if(args[0]){
                const summoner = message.content.slice(prefix.length + command.length + 1)
                const sum = await summonerData(summoner);
                const response = await fetch(`https://${RIOT_HOSTNAME}/lol/champion-mastery/v4/champion-masteries/by-summoner/${sum['id']}`,{
                headers: {
                    "X-Riot-Token": SINGED_BOT_TOKEN
                }})
                const mastery = await response.json()
                if(response.status == 200){
                    const champs = await champions();
                    const ch = await champs.data;
                    for(var keys of Object.keys(ch)){
                        if(ch[keys]['key'] == mastery[0]['championId']){
                            keys == 'Singed' ? message.reply(`${summoner} é main ${ch[keys]['name']}, melhor boneco do jogo com ${mastery[0]['championPoints'].toLocaleString('pt-BR')} pontos, está do meu agrado!`) :  message.reply(`${summoner} é main ${ch[keys]['name']} com ${mastery[0]['championPoints']} pontos, pior boneco do jogo, isto deve doer!`)
                            break;
                        }  
                    }
                }
                else{
                    message.reply(`${summoner} não existe, escreve direito fazendo o favor`)
                }
            }
            break
            
            
            // Returns free League of Legends champions of the week
            case "rot":
            const response = await fetch(`https://${RIOT_HOSTNAME}/lol/platform/v3/champion-rotations`, {
            headers: {
                "X-Riot-Token": SINGED_BOT_TOKEN
            }})
            const data = await response.json()
            const championsId = await data[Object.keys(data)[0]]
            const championsres = await champions();
            const rotationEmbed = new MessageEmbed()
            .setTitle('Campeões na rotação')
            .setColor('#1d8e25')
            .setThumbnail('https://i.imgur.com/TlidKnV.png')
            .setFooter({ text: 'Está do seu agrado???'});
            // 
            
            for(var rotationId of championsId){
                for(var championName of Object.keys(championsres.data)){
                    if(championsres.data[championName]['key'] == rotationId){
                        rotationEmbed.addField(championsres.data[championName]['id'],championsres.data[championName]['title'])
                    }
                }
            }
            message.reply({ embeds: [rotationEmbed]})
            console.log("Showing rotation champions")
            break;
            
            // Send a message marking all users playing League of Legends at the moment, and threatens them
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
            
            // Applies timeout on specified user for the specified minutes (time is optional, 5 minutes default)
            case "ban":
            if(adminCheck(message)){
                if(args[0]){
                    console.log(args)
                    const arg1 = args.shift().toLowerCase();
                    console.log(arg1)
                    const userId = arg1.substring(arg1.indexOf('@') + 1,arg1.indexOf('>'));
                    
                    if(args[0]){
                        const minutes = args.shift().toLowerCase();
                        isNaN(minutes) ? '' : memberTimeout(message,userId,minutes,'Banido by Singed Bot');
                    } else{
                        memberTimeout(message,userId,5,'Banido by Singed Bot');
                    }
                } 
            }
            break;
            
            // Removes timeout from user
            case "unban":
            if(adminCheck(message)){
                if(args[0]){
                    const userId = args[0].substring(args[0].indexOf('@') + 1,args[0].indexOf('>'));
                    memberRemoveTimeout(message,userId);
                }
            }
            break;
            
        }
    }
}); 

// Actions executed when the bot is runned
client.on('ready', () => {
    console.info("[SingedBot] Singed Bot Started")
    //Set bot game activity
    client.user.setActivity('cola no seu pé',{type: 'PLAYING',url: 'http://colherelerda.com'});
    exec("TITLE Singed Bot",(error, stdout, stderr) => {})
})

// Send a message on the channel when an user is kicked
client.on('guildMemberRemove', member => {
    client.channels.fetch('495690331447099403').then(channel => {
        channel.send(` A saída de ${member.user.tag} está do meu agrado.`);
    });
});

