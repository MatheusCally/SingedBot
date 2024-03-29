import http from 'http';
import https from 'https';
import fetch from 'node-fetch'
import {singedBotToken as SINGED_BOT_TOKEN,riotHostname as RIOT_HOSTNAME,embedHelp as EMBED_HELP} from './constants.js';

export async function patch(){
    const response = await fetch(`https://ddragon.leagueoflegends.com/api/versions.json`)
    const data = await response.json()
    return data[0]
};

// Function for retrieving all League of Legends Champions 
export async function champions(){
    const actualPatch = await patch();
    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/12.10.1/data/pt_BR/champion.json`)
    const data = await response.json();
    return data
}

// Retrieve summoner data
export function summonerData(summoner){
    const summonerDataOptions = {
        hostname: RIOT_HOSTNAME,
        path: '/lol/summoner/v4/summoners/by-name/' + encodeURIComponent(summoner.trim()),
        headers: {
            "X-Riot-Token": SINGED_BOT_TOKEN
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
export function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

// Apply timeout on user
export function memberTimeout(message,id,minutes,reason){
    message.guild.members.cache.filter(member => {
        if(member.user.id == id){
            member.disableCommunicationUntil(addMinutes(new Date(),minutes),reason ? reason : '').then((member)=>{
                const replyMessage = `<@${member.user.id}> tomou ${minutes} minutinhos pra ficar esperto, isto deve doer! `;
                console.log(replyMessage);
                message.reply(replyMessage);
            });
        }
    })
}

// Remove timeout from user
export function memberRemoveTimeout(message,id){
    message.guild.members.cache.filter(member => {
        if(member.user.id == id){
            member.disableCommunicationUntil(null).then((member)=>{
                const replyMessage = `<@${member.user.id}> liberdade cantou, eu te ouço!`
                console.log(replyMessage);
                message.reply(replyMessage)
            });
        }
    })
}

// Check the permission of the member who wrote the message
export function adminCheck(message){
    if(message.member.permissions.has("ADMINISTRATOR")){
        return true;
    } else{
        message.reply('Sai fora chapa, nem administrador é e quer meter o louco');
        return false;
    }
}

export async function getSummoner(summonerName){
    const response = await fetch(`https://${RIOT_HOSTNAME}/lol/summoner/v4/summoners/by-name/${summonerName}`,{
        headers: {
            "X-Riot-Token": SINGED_BOT_TOKEN
        }
    })
    const data = await response.json();
    return data;
}

export async function getLatestMatches(id, count=20){
   const response = await fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${id}/ids?count=${count}`,{
    headers: {
        "X-Riot-Token": SINGED_BOT_TOKEN
    }
   })
   const data = await response.json();
   return data
}

export async function getMatchFromId(id){
    const response = await fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/${id}`,{
        headers: {
            "X-Riot-Token": SINGED_BOT_TOKEN
        }
    })
    const data = await response.json();
    return data;
}

export async function getDeathNumberBySummonerName(summonerName){
    const summoner = await getSummoner(summonerName)
    const puuid = summoner.puuid;
    const matches = await getLatestMatches(puuid);
    const match = await getMatchFromId(matches[0]);
    var deaths = -1;
    if(match.info){
        match.info.participants.forEach(player => {
            if(player.puuid == puuid){
                deaths = player.deaths;
            }
        });
    }
    return deaths;
}

export async function getSingedMasteryFromSummonerName(summonerName){
    const summoner = await getSummoner(summonerName)
    const id = summoner.id;
    const response = await fetch(`https://${RIOT_HOSTNAME}/lol/champion-mastery/v4/champion-masteries/by-summoner/${id}/by-champion/27`,{
        headers: {
            "X-Riot-Token": SINGED_BOT_TOKEN
        }
    });
    const data = await response.json();
    return data.championPoints;
}
