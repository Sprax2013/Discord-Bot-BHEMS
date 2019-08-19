const index = require('./../index'); // Kann genutzt werden um z.B. die Prefix für eine Gilde zu ändern etc.
const loc = index.getLocalization(); // Hiermit kann auf die Lokalisation zugegriffen werden
const dc = require('discord.js');
const os = require('os-utils');

module.exports.cmd = {
    name: 'Status',

    category: index.CommandCategory.INFO
};

module.exports.onCommand = async (bot, msg, cmd, args = [], guildPrefix) => {
    // Bot-Status
    let guildCount = 0,
        channelCount = 0,
        clientCount = 0;

    for (const guild of bot.guilds.values()) {
        if (index.handleGuild(guild)) {
            guildCount++;
            channelCount += guild.channels.size;

            for (const member of guild.members.values()) {
                if (!member.user.bot) {
                    clientCount++;
                }
            }
        }
    }

    let ping = Math.round(bot.ping);

    let memoryUsage = Math.round((os.freemem() / os.totalmem()) * 100);
    if (memoryUsage >= 50 && memoryUsage <= 90) {
        memoryUsage = 'Normal *(50-90%)*';
    } else if (memoryUsage > 90) {
        memoryUsage = 'Close to the limit *(Above 90%)*';
    } else {
        memoryUsage = 'More than optimal *(Below 50%)*';
    }

    let reply = await msg.channel.send(
        new dc.RichEmbed()
            .setColor('0x81c6c8')

            .setTitle('Bot-Status')

            .setDescription(loc.getStringForGuild(this, 'Bot:Status_Public', msg)
                .format(`${guildCount} ${loc.getWordForGuild('Guild', msg, guildCount)}`,
                    `${channelCount} ${loc.getWordForGuild('Channel', msg, channelCount)}`,
                    `${clientCount} ${loc.getWordForGuild('Client', msg, clientCount)}`
                ))
            .addBlankField()
            .addField('API-Ping', `${ping}ms`)
            .addField('Memory Usage', memoryUsage)
            .addField('CPU Usage', ':mag:')

            .setFooter(`Requested by ${index.Utils.getUsernameFromUser(msg)}`, msg.author.avatarURL)
    );

    // System-Status
    os.cpuUsage((cpuUsage) => {
        cpuUsage = Math.round(cpuUsage * 100);

        if (cpuUsage >= 50 && cpuUsage <= 90) {
            cpuUsage = 'Normal *(50-90%)*';
        } else if (cpuUsage > 90) {
            cpuUsage = 'Close to the limit *(Above 90%)*';
        } else {
            cpuUsage = 'Perfectly Normal *(Below 50%)*';
        }

        reply.edit(
            new dc.RichEmbed()
                .setColor('0x81c6c8')

                .setTitle('Bot-Status')

                .setDescription(loc.getStringForGuild(this, 'Bot:Status_Public', msg)
                    .format(`${guildCount} ${loc.getWordForGuild('Guild', msg, guildCount)}`,
                        `${channelCount} ${loc.getWordForGuild('Channel', msg, channelCount)}`,
                        `${clientCount} ${loc.getWordForGuild('Client', msg, clientCount)}`
                    ))
                .addBlankField()
                .addField('API-Ping', `About ${ping}ms`)
                .addField('Memory Usage', memoryUsage)
                .addField('CPU Usage', cpuUsage)

                .setFooter(`Requested by ${index.Utils.getUsernameFromUser(msg)}`, msg.author.avatarURL)
        );
    });
}