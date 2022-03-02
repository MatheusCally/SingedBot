const Discord = require("discord.js");

const config = require("./config.json");

const { MessageEmbed } = require('discord.js');

const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES","GUILD_PRESENCES","GUILD_MEMBERS","GUILD_BANS"]});

const https = require('https')

const http = require('http')

client.login(config.BOT_TOKEN);


// Bot Prefix for messages
const prefix = "$";

// Riot APIs token
const singedBotToken = "RGAPI-0bf6db59-5698-45ee-9fd9-1bf7922f0ec8"

// Function for retrieving all League of Legends Champions
function champions(){
    const lolChampionByIdOptions = {
        hostname: 'ddragon.leagueoflegends.com',
        path: '/cdn/12.5.1/data/pt_BR/champion.json',
        method: 'GET',
    }
    return new Promise(function(resolve,reject){
        var response
        http.get(lolChampionByIdOptions, async function(res) {
            var body = '';
            res.on('data', function(chunk) {
                body += chunk;
            });
            res.on('end', async function() {
                resolve(JSON.parse(body)['data'])
            });
        }).on('error', function(e) {
            console.log("Got error: " + e.message);
        });
    })
}

// Add minutes into a date
function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

// Apply timeout on user
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

// Remove timeout from user
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

// Check the permission of the member who wrote the message
function adminCheck(message){
    if(message.member.permissions.has("ADMINISTRATOR")){
        return true;
    } else{
        message.reply('Sai fora chapa, nem administrador é e quer meter o louco');
        return false;
    }
}

// Actions executed when the bot is runned
client.on('ready', () => {
    //Set bot game activity
    client.user.setActivity('cola no seu pé',{type: 'PLAYING',url: 'http://colherelerda.com'});
})

// Message command reader
client.on("messageCreate", function(message) { 
    if(message.content.charAt(0) == prefix && !message.member.user.bot){
        const commandBody = message.content.slice(prefix.length);
        const args = commandBody.split(' ');
        const command = args.shift().toLowerCase();
        

        switch(command){

            // Help command
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
                { name: '$rot', value: 'lista os campeões na rotação da semana' },
                )
                .setImage('https://i.imgur.com/iIzaJGg.jpg')
                .setFooter({ text: 'Está do seu agrado???'});
                message.reply({ embeds: [embed]})
                break;
                
                // Returns free League of Legends champions of the week
                case "rot":
                const lolRotationOptions = {
                    hostname: 'br1.api.riotgames.com',
                    path: '/lol/platform/v3/champion-rotations',
                    method: 'GET',
                    headers: {
                        "X-Riot-Token": singedBotToken
                    }
                }
                https.get(lolRotationOptions, function(res) {
                    var body = '';
                    res.on('data', function(chunk) {
                        body += chunk;
                    });
                    res.on('end', function() {
                        championsId = JSON.parse(body)["freeChampionIds"]
                        champions().then(value => {
                            const rotationEmbed = new MessageEmbed()
                            .setTitle('Campeões na rotação')
                            .setColor('#1d8e25')
                            .setThumbnail('https://i.imgur.com/TlidKnV.png')
                            .setImage('https://i.imgur.com/iIzaJGg.jpg')
                            .setFooter({ text: 'Está do seu agrado???'});
                            // 
                            for(var rotationId of championsId){
                                for(var championName of Object.keys(value)){
                                    if(value[championName]['key'] == rotationId){
                                        rotationEmbed.addField(value[championName]['id'],value[championName]['title'])
                                    }
                                }
                            }
                            message.reply({ embeds: [rotationEmbed]})
                            console.log("Showing rotation champions")
                        })
                    });
                }).on('error', function(e) {
                    console.log("Got error: " + e.message);
                });
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
                        arg1 = args.shift().toLowerCase();
                        userId = arg1.substring(arg1.indexOf('!') + 1,arg1.indexOf('>'));
                        if(args[0]){
                            minutes = args.shift().toLowerCase();
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
                        userId = args[0].substring(args[0].indexOf('!') + 1,args[0].indexOf('>'));
                        memberRemoveTimeout(message,userId);
                    }
                }
                break;
                
            }
        }
    }); 
    
    // Send a message on the channel when an user is kicked
    client.on('guildMemberRemove', member => {
        client.channels.fetch('495690331447099403').then(channel => {
            channel.send(` A saída de ${member.user.tag} está do meu agrado.`);
        });
    });
    
    