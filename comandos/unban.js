const {adm} = require("../falas.json")
module.exports = {
    uso: "{usuario}",
    desc: "retira o timeout do usuário marcado",
    run: (message, args) => {
        if (adminCheck(message)) {
            if (args[0]) {
                userId = args[0].substring(args[0].indexOf('!') + 1, args[0].indexOf('>'));
                memberRemoveTimeout(message, userId);
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
// Remove timeout from user
function memberRemoveTimeout(message, id) {
    message.guild.members.cache.filter(member => {
        if (member.user.id == id) {
            member.disableCommunicationUntil(null).then((member) => {
                replyMessage = `<@${member.user.id}> liberdade cantou, eu te ouço!`
                console.log(replyMessage);
                message.reply(replyMessage)
            });
        }
    })
}
