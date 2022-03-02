const {adm} = require("../falas.json")
module.exports ={
    uso:"{usuario} {tempo}",
    desc:"aplica timeout no usuário marcado no tempo indicado, caso não seja informado o tempo, serão só 5 minutos",
    run:(message, args)=>{
        if (adminCheck(message)) {
            if (args[0]) {
                arg1 = args.shift().toLowerCase();
                userId = arg1.substring(arg1.indexOf('!') + 1, arg1.indexOf('>'));
                if (args[0]) {
                    minutes = args.shift().toLowerCase();
                    isNaN(minutes) ? '' : memberTimeout(message, userId, minutes, 'Banido by Singed Bot');
                } else {
                    memberTimeout(message, userId, 5, 'Banido by Singed Bot');
                }
            }
        }
    }
}
// Check the permission of the member who wrote the message
function adminCheck(message) {
    if (message.member.permissions.has("ADMINISTRATOR")) {
        return true;
    } else {
        message.reply(adm[Math.floor(adm.length*Math.random() )-1]);
        return false;
    }
}
// Apply timeout on user
function memberTimeout(message, id, minutes, reason) {
    message.guild.members.cache.filter(member => {
        if (member.user.id == id) {
            member.disableCommunicationUntil(addMinutes(new Date(), minutes), reason ? reason : '').then((member) => {
                replyMessage = `<@${member.user.id}> tomou ${minutes} minutinhos pra ficar esperto, isto deve doer! `;
                console.log(replyMessage);
                message.reply(replyMessage);
            });
        }
    })
}
// Add minutes into a date
function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}
