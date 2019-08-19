const index = require('./../index'); // Kann genutzt werden um z.B. die Prefix für eine Gilde zu ändern etc.
const loc = index.getLocalization(); // Hiermit kann auf die Lokalisation zugegriffen werden
const dc = require('discord.js'); // Praktisch für RichEmbed etc.

module.exports.cmd = {
    name: 'Commands',
    aliases: ['Command', 'cmd', 'cmds', 'Befehl', 'Befehle'],

    category: index.CommandCategory.INFO
};

module.exports.onCommand = async (bot, msg, cmd, args = [], guildPrefix) => {
    let cmdArr = [];

    // Get all unique commands
    for (const key of bot.cmds.values()) {
        if (!cmdArr.includes(key)) {
            cmdArr.push(key);
        }
    }
    for (const key of bot.cmdAliases.values()) {
        if (!cmdArr.includes(key)) {
            cmdArr.push(key);
        }
    }

    if (cmdArr.length > 0) {
        // Send RichEmbeds
        for (const key in index.CommandCategory) {
            if (index.CommandCategory.hasOwnProperty(key)) {
                const cat = index.CommandCategory[key];

                if (cat !== index.CommandCategory.HIDDEN) {
                    const locCat = loc.getCommandCategoryForGuild(cat, msg);

                    let embed = new dc.RichEmbed()
                        .setColor(cat.color)

                        .setTitle(locCat.name)
                        .setDescription(locCat.description).addBlankField()
                        .setFooter(`~${bot.user.username}`, bot.user.avatarURL);

                    let sendEmbed = false;

                    for (const cmd of cmdArr) {
                        if (cmd.cmd.category === cat) {
                            sendEmbed = true;

                            embed.addField(guildPrefix + cmd.cmd.name, `\`${loc.getStringForGuild(cmd, '{%cmd}:cmd.Usage', msg, '{0}{1}')
                                .format(guildPrefix, cmd.cmd.name, '@' + bot.user.tag)}\` | ${loc.getStringForGuild(cmd, '{%cmd}:cmd.Description', msg)}`);
                        }
                    }

                    if (sendEmbed) {
                        // ToDo: Send via DM
                        msg.author.send(embed);
                    }
                }
            }
        }

        let replyMsg;

        for (let i = 5; i >= 0; i--) {
            let str = loc.getStringForGuild(this, '{%cmd}:CheckDMs', msg).format(i);

            if (!replyMsg) {
                replyMsg = await msg.reply(str);
            } else if (i !== 0) {
                await replyMsg.edit(`${msg.author}, ${str}`);
            } else {
                replyMsg.delete();
                msg.delete();
            }

            await index.Utils.sleep(1000);
        }
    }
}