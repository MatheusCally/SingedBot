import {MessageEmbed} from 'discord.js';
// Riot APIs token
const singedBotToken = "RGAPI-0bf6db59-5698-45ee-9fd9-1bf7922f0ec8"

// Riot APIs hostname
const riotHostname = 'br1.api.riotgames.com'


const embedHelp = new MessageEmbed()
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

export {singedBotToken,riotHostname,embedHelp}