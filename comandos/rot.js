const https = require("https");
const http = require("http");
const {RIOT_TOKEN} = require("../config.json")
const {MessageEmbed} = require("discord.js")
module.exports = {
    uso:"",
    desc:"lista os campeões na rotação da semana",
    run:(message, args)=>{
        const lolRotationOptions = {
            hostname: 'br1.api.riotgames.com',
            path: '/lol/platform/v3/champion-rotations',
            method: 'GET',
            headers: {
                "X-Riot-Token": RIOT_TOKEN
            }
        }
        https.get(lolRotationOptions, function (res) {
            var body = '';
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                championsId = JSON.parse(body)["freeChampionIds"]
                champions().then(value => {
                    const rotationEmbed = new MessageEmbed()
                        .setTitle('Campeões na rotação')
                        .setColor('#1d8e25')
                        .setThumbnail('https://i.imgur.com/TlidKnV.png')
                        .setImage('https://i.imgur.com/iIzaJGg.jpg')
                        .setFooter({ text: 'Está do seu agrado???' });
                    // 
                    for (var rotationId of championsId) {
                        for (var championName of Object.keys(value)) {
                            if (value[championName]['key'] == rotationId) {
                                rotationEmbed.addField(value[championName]['id'], value[championName]['title'])
                            }
                        }
                    }
                    message.reply({ embeds: [rotationEmbed] })
                    console.log("Showing rotation champions")
                })
            });
        }).on('error', function (e) {
            console.log("Got error: " + e.message);
        });
    }
}
function champions() {
    const lolChampionByIdOptions = {
        hostname: 'ddragon.leagueoflegends.com',
        path: '/cdn/12.5.1/data/pt_BR/champion.json',
        method: 'GET',
    }
    return new Promise(function (resolve, reject) {
        http.get(lolChampionByIdOptions, async function (res) {
            var body = '';
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', async function () {
                resolve(JSON.parse(body)['data'])
            });
        }).on('error', function (e) {
            console.log("Got error: " + e.message);
        });
    })
}