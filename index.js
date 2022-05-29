const Discord = require("discord.js");

const config = require("./config.json");

const { MessageEmbed } = require('discord.js');

const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES","GUILD_PRESENCES","GUILD_MEMBERS","GUILD_BANS", 'GUILD_VOICE_STATES']});

const https = require('https')

const http = require('http');
const { Console } = require("console");

client.login(config.BOT_TOKEN);


// Bot Prefix for messages
const prefix = "$";

// Riot APIs token
const singedBotToken = "RGAPI-0bf6db59-5698-45ee-9fd9-1bf7922f0ec8"

// Riot APIs hostname
const riotHostname = 'br1.api.riotgames.com'

// Function for retrieving all League of Legends Champions
function champions(){
    const lolChampionByIdOptions = {
        hostname: 'ddragon.leagueoflegends.com',
        path: '/cdn/12.6.1/data/pt_BR/champion.json',
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
        }).on('error', reject);
    })
}

// Retrieve summoner data
function summonerData(summoner){
    const summonerDataOptions = {
        hostname: riotHostname,
        path: '/lol/summoner/v4/summoners/by-name/' + encodeURIComponent(summoner.trim()),
        headers: {
            "X-Riot-Token": singedBotToken
        }
        
    }
    return new Promise(function(resolve,reject){
        https.get(summonerDataOptions, (res) => {
            var body = '';
            res.on('data', function(chunk) {
                body += chunk;
            });
            res.on('end', function() {
                resolve(JSON.parse(body))
            });
        }).on('error', reject);
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
                { name: '$main {nome de invocador}', value: 'diz o main da pessoa a partir do nome de invocador' },
                )
                .setImage('https://i.imgur.com/iIzaJGg.jpg')
                .setFooter({ text: 'Está do seu agrado???'});
                message.reply({ embeds: [embed]})
                break;
                
                // Returns the champion with most mastery from a summoner
                case "main":
                if(args[0]){
                    summoner = message.content.slice(prefix.length + command.length + 1)
                    summonerData(summoner).then(sum => {
                        const lolMasterySummonerOptions = {
                            hostname: riotHostname,
                            path: '/lol/champion-mastery/v4/champion-masteries/by-summoner/' + sum['id'],
                            headers: {
                                "X-Riot-Token": singedBotToken
                            }
                        }
                        https.get(lolMasterySummonerOptions, res => {
                            var body = '';
                            res.on('data', function(chunk) {
                                body += chunk;
                            });
                            res.on('end', function() {
                                mastery = JSON.parse(body)
                                if(res.statusCode == 200){
                                    champions().then(ch => {
                                        for(var keys of Object.keys(ch)){
                                          if(ch[keys]['key'] == mastery[0]['championId']){
                                              keys == 'Singed' ? message.reply(`${summoner} é main ${ch[keys]['name']}, melhor boneco do jogo, está do meu agrado!`) :  message.reply(`${summoner} é main ${ch[keys]['name']}, pior boneco do jogo, isto deve doer!`)
                                              break;
                                          }  
                                        }
                                    }
                                    )
                                }
                                else{
                                    message.reply(`${summoner} não existe, escreve direito fazendo o favor`)
                                }
                                
                            });
                        }).on('error', function(e) {
                            console.log("Got error: " + e.message);
                        });
                    })
                }
                break
                
                
                // Returns free League of Legends champions of the week
                case "rot":
                const lolRotationOptions = {
                    hostname: riotHostname,
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
    
    