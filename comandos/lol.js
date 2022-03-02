module.exports={
    uso:"",
    desc:"ameaça de ban todos que estão jogando essa merda no momento",
    run:(message,args)=>{
        message.guild.members.cache.filter(member => {
            if (member.presence) {
                if (member.presence.activities.length > 0) {
                    if (member.presence.activities[0].name == 'League of Legends') {
                        message.channel.send(`<@${member.user.id}> toma cuidado, vai levar ban se continuar jogando Lol.`);
                    }

                }
            }
        });
    }
}