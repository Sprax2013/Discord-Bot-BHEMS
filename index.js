const fs = require('fs'),
    dc = require('discord.js');

// function createFiles() {
const defaultConfig = {
    botToken: 'INSERT_TOKEN_HERE',
    guildID: 'INSERT_ID_HERE'
    // Sprax2013_API_Token: 'INSERT_TOKEN_HERE',
};

if (!fs.existsSync('./commands')) {
    fs.mkdirSync('./commands');
}
if (!fs.existsSync('./storage')) {
    fs.mkdirSync('./storage');
}

if (!fs.existsSync('./storage/config.json')) {
    fs.writeFileSync('./storage/config.json', JSON.stringify(defaultConfig));
} else {
    fs.writeFileSync('./storage/config.json', JSON.stringify(Object.assign(defaultConfig, JSON.parse(fs.readFileSync('./storage/config.json', 'UTF-8')))));
}

if (!fs.existsSync('./storage/users.json')) {
    fs.writeFileSync('./storage/users.json', '{}');
}

if (!fs.existsSync('./storage/awaitApproval.json')) {
    fs.writeFileSync('./storage/awaitApproval.json', '{}');
}
// }

const cfg = require('./storage/config.json'),
    users = require('./storage/users.json'),
    awaitApproval = require('./storage/awaitApproval.json');

const names = fs.existsSync('./storage/names.json') ? require('./storage/names.json') : null;

/* module.exports */

module.exports = {
    CommandCategory: Object.freeze({
        'ADMIN': {
            __KEY: 'ADMIN',
            color: '0xEF2B48'
        },
        'MODERATOR': {
            __KEY: 'MODERATOR',
            color: '0xEF2B48'
        },
        'MISC': {
            __KEY: 'MISC',
            color: '0xB7C0EE'
        },
        'INFO': {
            __KEY: 'INFO',
            color: '0xFFFF33'
        },
        'HIDDEN': {
            __KEY: 'HIDDEN',
        }
    }),
    Utils: require('./utils'),
    saveToFile: () => {
        if (filesChanged) {
            module.exports.forceSaveToFile();

            console.log('Changes have automatically been written to ./storage');
        }
    },
    forceSaveToFile: () => {
        fs.writeFile('./storage/config.json', JSON.stringify(cfg), (err) => {
            if (err) console.error(err);
        });
        fs.writeFile('./storage/users.json', JSON.stringify(users), (err) => {
            if (err) console.error(err);
        });
        fs.writeFile('./storage/awaitApproval.json', JSON.stringify(awaitApproval), (err) => {
            if (err) console.error(err);
        });


        filesChanged = false;
    }
    // ,getSprax2013APIToken: () => {
    //     return cfg.Sprax2013_API_Token;
    // }
};

if (cfg.botToken == 'INSERT_TOKEN_HERE') {
    console.error('Insert your Bot-Token (./storage/config.json)');
    process.exit(1);
} else if (cfg.guildID == 'INSERT_ID_HERE') {
    console.error('Insert your Guild-ID (./storage/config.json)');
    process.exit(1);
}

// require('./webserver/webserver'); // Start WebServer or crash

const client = new dc.Client();
var servingGuild = null;
var filesChanged = false;

// initCommands();

/* Discord */

client.on('ready', () => {
    let guildCount = 0,
        guildsIgnoredCount = 0,
        channelCount = 0,
        clientCount = 0,
        botCount = 0;

    for (const guild of client.guilds.values()) {
        if (cfg.guildID == guild.id) {
            servingGuild = guild;

            guildCount++;
            channelCount += guild.channels.size;

            for (const member of guild.members.values()) {
                if (member.user.bot) {
                    if (member.user !== client.user) {
                        botCount++;
                    }
                } else {
                    firstMemberStep(member);

                    clientCount++;
                }
            }
        } else {
            guildsIgnoredCount++;
        }
    }

    for (const key in awaitApproval) {
        if (awaitApproval.hasOwnProperty(key)) {
            delete awaitApproval[key];
            filesChanged = true;

            client.fetchUser(key)
                .then((user) => {
                    user.send('**Die oben gezeigte Nachricht ist abgelaufen!** *Bitte schreibe mich an, um den Vorgang zu wiederholen*')
                        .catch(console.error);
                }).catch(console.error);
        }
    }

    console.log('Bot is active on {0} (while ignoring {1}), in {2} for {3} (+{4})'
        .format(`${guildCount} ${'Guild' + (guildCount != 1 ? 's' : '')}`,
            `${guildsIgnoredCount} ${'Guild' + (guildsIgnoredCount != 1 ? 's' : '')}`,
            `${channelCount} ${'Channel' + (channelCount != 1 ? 's' : '')}`,
            `${clientCount} ${'Client' + (clientCount != 1 ? 's' : '')}`,
            `${botCount} ${'Bot' + (botCount != 1 ? 's' : '')}`
        )
    );

    module.exports.client = client;

    updateBotActivity();
    setInterval(updateBotActivity, 900000); // 15min
});

client.on('error', (err) => {
    console.error(new Date() + ': Discord client encountered an error');
    console.error(err); //ToDo Log to file (Filter ECONNRESET - Die API bekommt ab und an einen Timeout oder so... Der Bot läuft normal weiter...)
});

client.on('guildCreate', (guild) => {
    console.log(`I have been added to '${guild.name}' (ID: ${guild.id})`);

    if (cfg.guildID == guild.id) {
        servingGuild = guild;
    }

    updateBotActivity();
});

client.on('guildDelete', (guild) => {
    console.log(`I have been removed from '${guild.name}' (ID: ${guild.id})`);

    if (guild.id == servingGuild.id) {
        servingGuild = null;
    }

    updateBotActivity();
});

client.on('guildMemberAdd', (member) => {
    firstMemberStep(member);
});

client.on('guildMemberRemove', (member) => {
    delete users[member.id];
    filesChanged = true;
})

// ToDo: Put in config'n stuff
const tempMapper = {
    // LK1
    '611214416540860427': 'Wirtschaft 1',
    '611214672573759488': 'Wirtschaft 2',
    '611214873447104532': 'Gesundheit 1',
    '611215154239242264': 'Gesundheit 2',
    '611214952270790657': 'Elektrotechnik',
    '611214992016146432': 'Datenverarbeitung',
    '611215038924980254': 'Ernährung',

    // LK2
    '611214032707387405': '12 A',
    '611214113955381249': '12 B',
    '611214166300033048': '12 C',
    '611214192384409600': '12 D',
    '611214225943166995': '12 E',
    '611214278589939732': '12 F',

    // PE
    '611223577055723530': 'Basketball',
    '611223661717880833': 'Volleyball',
    '611223528326561802': 'Schwimmen',
    '611223618101313579': 'Tischtennis',
    '611223598027243543': 'Klettern',

    // Religion
    '611223409954914345': 'Ethik 1',
    '611228662351659035': 'Ethik 2',
    '611215837688233986': 'Evangelisch 1',
    '611228611642654732': 'Evangelisch 2',
    '611219696175546399': 'Katholisch',

    // Science
    '611215630250541086': 'Physik 1',
    '611215720574877696': 'Physik 2',
    '611215753760342017': 'Chemie',

    // Misc.
    '611223896573739010': 'Spanisch',
    '611223756173607008': 'Bilingual',
    '611223818660216833': 'Kunst',
    '611224058436124672': 'Theaterpädagogik'
};

client.on('message', async (msg) => {
    if (msg.author.bot) return;
    if (!handleMessage(msg)) return;

    if (msg.channel instanceof dc.DMChannel) {
        if (msg.content.toLowerCase() == 'delete me') {
            delete users[msg.author.id];
            filesChanged = true;
            return firstMemberStep(msg.author);
        }

        let userStorage = users[msg.author.id] || (users[msg.author.id] = {});

        if (!userStorage['FullName']) {
            const inputArgs = msg.content.split(' ');

            let success = !names;
            let fullName = success ? msg.content : null;

            if (!success) {
                for (const nameObj of names) {
                    let matches = 0;

                    for (const nameArg of inputArgs) {
                        if (nameObj['incorrect']) {
                            if (nameObj['name'].toLowerCase().startsWith(nameArg.toLowerCase()) ||
                                nameObj['familyName'].toLowerCase().startsWith(nameArg.toLowerCase())
                                ||
                                nameObj['name'].toLowerCase().split(/(?:-| )/g).includes(nameArg.toLowerCase()) ||
                                nameObj['familyName'].toLowerCase().split(/(?:-| )/g).includes(nameArg.toLowerCase())) {
                                matches++;
                            }
                        } else {
                            if (nameObj['name'].toLowerCase() == nameArg.toLowerCase() ||
                                nameObj['familyName'].toLowerCase() == nameArg.toLowerCase()
                                ||
                                nameObj['name'].toLowerCase().split(/(?:-| )/g).includes(nameArg.toLowerCase()) ||
                                nameObj['familyName'].toLowerCase().split(/(?:-| )/g).includes(nameArg.toLowerCase())) {
                                matches++;
                            }
                        }

                        if (matches >= 2) {
                            fullName = `${nameObj['name']} ${nameObj['familyName']}`;
                            success = true;
                            break;
                        }
                    }

                    if (success) break;
                }
            }

            if (success) {
                let alreadyRegistered = false;

                if (names) {
                    for (const key in users) {
                        if (users.hasOwnProperty(key)) {
                            const userObj = users[key];

                            if (fullName == userObj['_FullNameFromNameList'] && !userObj['GaveRoles']) {
                                alreadyRegistered = true;
                                break;
                            }
                        }
                    }
                }

                if (alreadyRegistered) {
                    return msg.author.send('Dein Name ist bereits auf dem Server verwendet worden! Sollte es sich um einen Fehler handeln, melde dich bitte in #anmeldung auf dem Server!');
                }

                userStorage['FullName'] = msg.content;
                userStorage['_FullNameFromNameList'] = fullName;
                filesChanged = true;
            } else {
                return msg.author.send('Dein Name wurde nicht auf der Namensliste gefunden!\nBitte achte auf die Schreibweise.\n\n Bitte schreib uns bei Problemen im #anmeldung-Kanal mit @Moderator oder @Admin an.');
            }
        } else if (!userStorage['LK1']) {
            if (msg.content.toLowerCase() == 'wi 1' || msg.content.toLowerCase() == 'wi1' ||
                msg.content.toLowerCase() == 'wirtschaft 1' || msg.content.toLowerCase() == 'wirtschaft1') {
                userStorage['LK1'] = '611214416540860427';  // Wirtschaft 1
            } else if (msg.content.toLowerCase() == 'wi 2' || msg.content.toLowerCase() == 'wi2' ||
                msg.content.toLowerCase() == 'wirtschaft 2' || msg.content.toLowerCase() == 'wirtschaft2') {
                userStorage['LK1'] = '611214672573759488';  // Wirtschaft 2
            } else if (msg.content.toLowerCase() == 'ge 1' || msg.content.toLowerCase() == 'ge1' ||
                msg.content.toLowerCase() == 'gesundheit 1' || msg.content.toLowerCase() == 'gesundheit1') {
                userStorage['LK1'] = '611214873447104532';  // Gesundheit 1
            } else if (msg.content.toLowerCase() == 'ge 2' || msg.content.toLowerCase() == 'ge2' ||
                msg.content.toLowerCase() == 'gesundheit 2' || msg.content.toLowerCase() == 'gesundheit2') {
                userStorage['LK1'] = '611215154239242264';  // Gesundheit 2
            } else if (msg.content.toLowerCase() == 'et' || msg.content.toLowerCase() == 'elektrotechnik') {
                userStorage['LK1'] = '611214952270790657';  // Elektrotechnik
            } else if (msg.content.toLowerCase() == 'dv' || msg.content.toLowerCase() == 'datenverarbeitung') {
                userStorage['LK1'] = '611214992016146432';  // Datenverarbeitung
            } else if (msg.content.toLowerCase() == 'ök' || msg.content.toLowerCase() == 'ernährung') {
                userStorage['LK1'] = '611215038924980254';  // Ernährung
            } else {
                return msg.author.send('Unbekannter Schwerpunkt. Verfügbar: ```MarkDown\n* Wirtschaft 1 (Wi 1)\n* Wirtschaft 2 (Wi 2)\n* Gesundheit 1 (Ge 1)\n* Gesundheit 2 (Ge 2)\n* Elektrotechnik (Et)\n* Datenverarbeitung (Dv)\n* Ernährung (Ök)```');
            }

            filesChanged = true;
        } else if (!userStorage['LK2']) {
            if (msg.content.toLowerCase() == '12a' || msg.content.toLowerCase() == '12 a' ||
                msg.content.toLowerCase() == 'de' || msg.content.toLowerCase() == 'deutsch') {
                userStorage['LK2'] = '611214032707387405';  // 12 A
            } else if (msg.content.toLowerCase() == '12b' || msg.content.toLowerCase() == '12 b' ||
                msg.content.toLowerCase() == 'en' || msg.content.toLowerCase() == 'englisch' || msg.content.toLowerCase() == 'english') {
                userStorage['LK2'] = '611214113955381249';  // 12 B
            } else if (msg.content.toLowerCase() == '12c' || msg.content.toLowerCase() == '12 c' ||
                msg.content.toLowerCase() == 'bio' || msg.content.toLowerCase() == 'biologie') {
                userStorage['LK2'] = '611214166300033048';  // 12 C
            } else if (msg.content.toLowerCase() == '12d' || msg.content.toLowerCase() == '12 d' ||
                msg.content.toLowerCase() == 'ph' || msg.content.toLowerCase() == 'physik') {
                userStorage['LK2'] = '611214192384409600';  // 12 D
            } else if (msg.content.toLowerCase() == '12e' || msg.content.toLowerCase() == '12 e' ||
                msg.content.toLowerCase() == 'ma 1' || msg.content.toLowerCase() == 'ma1' ||
                msg.content.toLowerCase() == 'mathe 1' || msg.content.toLowerCase() == 'mathe1' ||
                msg.content.toLowerCase() == 'mathematik 1' || msg.content.toLowerCase() == 'mathematik1') {
                userStorage['LK2'] = '611214225943166995';  // 12 E
            } else if (msg.content.toLowerCase() == '12f' || msg.content.toLowerCase() == '12 f' ||
                msg.content.toLowerCase() == 'ma 2' || msg.content.toLowerCase() == 'ma2' ||
                msg.content.toLowerCase() == 'mathe 2' || msg.content.toLowerCase() == 'mathe2' ||
                msg.content.toLowerCase() == 'mathematik 2' || msg.content.toLowerCase() == 'mathematik2') {
                userStorage['LK2'] = '611214278589939732';  // 12 F
            } else {
                return msg.author.send('Unbekannter Leistungskurs. Verfügbar: ```MarkDown\n* [12a] Deutsch (de)\n* [12b] Englisch (en)\n* [12c] Biologie (bio)\n* [12d] Physik (ph)\n* [12e] Mathe 1 (ma1)\n* [12f] Mathe 2 (ma2)```');
            }

            filesChanged = true;
        } else if (!userStorage['PE']) {
            if (msg.content.toLowerCase() == 'basketball' || msg.content.toLowerCase() == 'basket' || msg.content.toLowerCase() == 'bb') {
                userStorage['PE'] = '611223577055723530';  // Basketball
            } else if (msg.content.toLowerCase() == 'volleyball' || msg.content.toLowerCase() == 'volley' || msg.content.toLowerCase() == 'vb') {
                userStorage['PE'] = '611223661717880833';  // Volleyball
            } else if (msg.content.toLowerCase() == 'schwimmen' || msg.content.toLowerCase() == 'sw') {
                userStorage['PE'] = '611223528326561802';  // Schwimmen
            } else if (msg.content.toLowerCase() == 'tischtennis' || msg.content.toLowerCase() == 'tisch' || msg.content.toLowerCase() == 'tt') {
                userStorage['PE'] = '611223618101313579';  // Tischtennis
            } else if (msg.content.toLowerCase() == 'klettern' || msg.content.toLowerCase() == 'kl') {
                userStorage['PE'] = '611223598027243543';  // Klettern
            } else {
                return msg.author.send('Unbekannter Sportkurs. Verfügbar: ```MarkDown\n* Basketball (bb)\n* Volleyball (vb)\n* Schwimmen (sw)\n* Tischtennis (tt)\n* Klettern (kl)```');
            }

            filesChanged = true;
        } else if (!userStorage['Religion']) {
            if (msg.content.toLowerCase() == 'ek 1' || msg.content.toLowerCase() == 'ek1' ||
                msg.content.toLowerCase() == 'ethik 1' || msg.content.toLowerCase() == 'ethik1') {
                userStorage['Religion'] = '611223409954914345';  // Ethik 1
            } else if (msg.content.toLowerCase() == 'ek 2' || msg.content.toLowerCase() == 'ek2' ||
                msg.content.toLowerCase() == 'ethik 2' || msg.content.toLowerCase() == 'ethik2') {
                userStorage['Religion'] = '611228662351659035';  // Ethik 2
            } else if (msg.content.toLowerCase() == 'rv 1' || msg.content.toLowerCase() == 'rv1' ||
                msg.content.toLowerCase() == 'evangelisch 1' || msg.content.toLowerCase() == 'evangelisch1') {
                userStorage['Religion'] = '611215837688233986';  // Evangelisch 1
            } else if (msg.content.toLowerCase() == 'rv 2' || msg.content.toLowerCase() == 'rv2' ||
                msg.content.toLowerCase() == 'evangelisch 2' || msg.content.toLowerCase() == 'evangelisch2') {
                userStorage['Religion'] = '611228611642654732';  // Evangelisch 2
            } else if (msg.content.toLowerCase() == 'rk' || msg.content.toLowerCase() == 'rk 1' || msg.content.toLowerCase() == 'rk1' ||
                msg.content.toLowerCase() == 'katholisch' || msg.content.toLowerCase() == 'katholisch 1' || msg.content.toLowerCase() == 'katholisch1') {
                userStorage['Religion'] = '611219696175546399';  // Katholisch
            } else {
                return msg.author.send('Unbekannter Ethik- oder Religionskurs. Verfügbar: ```MarkDown\n* Ethik 1 (ek1)\n* Ethik 2 (ek2)\n* Evangelisch 1 (rv1)\n* Evangelisch 2 (rv2)\n* Katholisch (rk1)```');
            }

            filesChanged = true;
        } else if (!userStorage['Science']) {
            if (msg.content.toLowerCase() != 'keine' && msg.content.toLowerCase() != '-'
                && msg.content.toLowerCase() != 'none' && msg.content.toLowerCase() != 'nein' && msg.content.toLowerCase() != 'no') {
                if (msg.content.toLowerCase() == 'ph 1' || msg.content.toLowerCase() == 'ph1' ||
                    msg.content.toLowerCase() == 'physik 1' || msg.content.toLowerCase() == 'physik1') {
                    userStorage['Science'] = '611215630250541086';  // Physik 1
                } else if (msg.content.toLowerCase() == 'ph 2' || msg.content.toLowerCase() == 'ph2' ||
                    msg.content.toLowerCase() == 'physik 2' || msg.content.toLowerCase() == 'physik2') {
                    userStorage['Science'] = '611215720574877696';  // Physik 2
                } else if (msg.content.toLowerCase() == 'ch' || msg.content.toLowerCase() == 'ch 1' || msg.content.toLowerCase() == 'ch1' ||
                    msg.content.toLowerCase() == 'chemie' || msg.content.toLowerCase() == 'chemie 1' || msg.content.toLowerCase() == 'chemie1') {
                    userStorage['Science'] = '611215753760342017';  // Chemie
                } else {
                    return msg.author.send('Unbekannte Naturwissenschaft. Verfügbar: ```MarkDown\n* Physik 1 (ph1)\n* Physik 2 (ph2)\n* Chemie (ch1)```');
                }
            } else {
                userStorage['Science'] = '-';
            }

            filesChanged = true;
        } else if (!userStorage['Spanish']) {
            userStorage['Spanish'] = msg.content.toLowerCase() != 'keine' && msg.content.toLowerCase() != '-' && msg.content.toLowerCase() != 'none'
                && msg.content.toLowerCase() != 'nein' && msg.content.toLowerCase() != 'no' ? '611223896573739010' : '-';
            filesChanged = true;
        } else if (!userStorage['Misc']) {
            if (msg.content.toLowerCase() != 'keine' && msg.content.toLowerCase() != '-'
                && msg.content.toLowerCase() != 'none' && msg.content.toLowerCase() != 'nein' && msg.content.toLowerCase() != 'no') {

                if (msg.content.toLowerCase() == 'bili' || msg.content.toLowerCase() == 'bilingual') {
                    userStorage['Misc'] = '611223756173607008';  // Bilingual
                } else if (msg.content.toLowerCase() == 'ku' || msg.content.toLowerCase() == 'kunst') {
                    userStorage['Misc'] = '611223818660216833';  // Kunst
                } else if (msg.content.toLowerCase() == 'th' || msg.content.toLowerCase() == 'theater' || msg.content.toLowerCase() == 'theaterpädagogik') {
                    userStorage['Misc'] = '611224058436124672';  // Theaterpädagogik
                } else {
                    return msg.author.send('Unbekannter Kurs. Verfügbar: ```MarkDown\n* Bilingual (bili)\n* Kunst (ku)\n* Theaterpädagogik (th)```');
                }
            } else {
                userStorage['Misc'] = '-';
            }

            filesChanged = true;
        }

        nextMemberStep(msg.author);
    } else if (msg.channel instanceof dc.TextChannel) {
        // console.log('GuildChannel', msg.content);
    }
    return; // temp.

    var guildPrefix = module.exports.getGuildPrefix(msg.guild.id);
    let usedPefix;

    if (msg.content.indexOf(guildPrefix) == 0) {
        usedPefix = guildPrefix;
    } else if (msg.content.indexOf(`<@${client.user.id}>`) == 0) {
        usedPefix = `<@${client.user.id}>`;
    } else {
        return;
    }

    const args = msg.content.substring(usedPefix.length).trim().split(/ +/g);
    const cmdOrg = args.shift();
    const cmd = cmdOrg.toLowerCase();

    try {
        if (client.cmds.has(cmd)) {
            client.cmds.get(cmd).onCommand(client, msg, cmdOrg, args, guildPrefix);
        } else if (client.cmdAliases.has(cmd)) {
            client.cmdAliases.get(cmd).onCommand(client, msg, cmdOrg, args, guildPrefix);
        } else {
            msg.channel.send(localization.getStringForGuild(null, 'Bot:UnknownCommand', msg));
        }
    } catch (ex) {
        console.error(ex);
    }
});

client.on('messageReactionAdd', async (msgR, user) => {
    if (awaitApproval[user.id] && awaitApproval[user.id] == msgR.message.id) {
        if (msgR.emoji.name == '✅') {
            delete awaitApproval[user.id];
            users[user.id]['Approved'] = true;
            filesChanged = true;

            nextMemberStep(user);
        } else if (msgR.emoji.name == '❌') {
            delete awaitApproval[user.id];
            delete users[user.id];
            filesChanged = true;

            await user.send('❌ **Vorgang abgebrochen** - *Ich stelle nun alle Fragen erneut...*');

            firstMemberStep(user);
        }
    }
});

client.login(cfg.botToken);

function updateBotActivity() {
    client.user.setActivity(`Tetris Online (Ranked)`, {
        type: 'PLAYING'
    })
        .catch(console.error);
}

// Alle 30s prüfen, ob Änderungen in die Datei geschrieben werden müssen
setInterval(module.exports.saveToFile, 30 * 1000);

/* private functions */

/*
function initCommands() {
    client.cmds = new dc.Collection();
    client.cmdAliases = new dc.Collection();

    let walk = dir => {
        var results = [];
        let list = fs.readdirSync(dir);

        list.forEach(file => {
            file = dir + '/' + file;
            var stat = fs.statSync(file);

            if (stat && stat.isDirectory()) {
                results = results.concat(walk(file));
            } else {
                results.push(file);
            }
        });

        return results;
    }

    let files = walk('./commands');

    //Alle Dateien, die auf .js Enden und nicht mit einem '.' beginnen
    let jsfile = files.filter(f => f.split('/').pop().indexOf('.') !== 0 && f.split(".").pop().toLocaleLowerCase() == 'js');
    if (jsfile.length <= 0) {
        console.log(localization.getStringForConsole('Bot:Console:NoCommandsLoaded', 'No commands were loaded'));
        return;
    }

    jsfile.forEach((f) => {
        let prop = require(f);

        if (prop.cmd) {
            let cmdPath = f.substr('./commands/'.length);

            if (!prop.cmd.category) {
                prop.cmd.category = module.exports.CommandCategory.MISC;
            }

            if (!client.cmds.has(prop.cmd.name.toLowerCase())) {
                client.cmds.set(prop.cmd.name.toLowerCase(), prop);
            } else {
                console.log(localization.getStringForConsole('Bot:Console:AlreadyRegistered', '\'{0}\' tried to register the {2} \'{1}\' that is already in use by another file').format(cmdPath, props.cmd.name, localization.getWordForConsole('Command')));
            }

            let aliasCount = 0;
            if (prop.cmd.aliases) {
                prop.cmd.aliases.forEach(alias => {
                    if (!client.cmdAliases.has(alias.toLowerCase())) {
                        client.cmdAliases.set(alias.toLowerCase(), prop);
                        aliasCount++;
                    } else {
                        console.log(localization.getStringForConsole('Bot:Console:AlreadyRegistered', '\'{0}\' tried to register the {2} \'{1}\' that is already in use by another file').format(cmdPath, props.cmd.name, localization.getWordForConsole('Alias')));
                    }
                });
            }

            if (aliasCount > 0) {
                console.log(localization.getStringForConsole('Bot:Console:CommandLoadedWithAliases', '\'{0}\' has been loaded ({1})!').format(cmdPath, `${aliasCount} ${localization.getWordForConsole('Alias', aliasCount)}`));
            } else {
                console.log(localization.getStringForConsole('Bot:Console:CommandLoaded', '\'{0}\' has been loaded!').format(cmdPath));
            }
        } else {
            console.log(localization.getStringForConsole('Bot:Console:InvalidCommandFile', '\'{0}\' is invalid - Please compare it to \'{1}\'').format(f, './commands/.template.js'));
        }
    });
}
*/

/**
 * @param {dc.Message} msg 
 */
function handleMessage(msg) {
    return servingGuild && cfg.guildID &&
        (
            (msg.guild && cfg.guildID == msg.guild.id) ||
            (msg.channel instanceof dc.DMChannel && servingGuild.member(msg.author))
        );
}

/**
 * @param {dc.GuildMember} member 
 */
function firstMemberStep(member) {
    if (!users[member.id]) {
        member.send(`Hallo ${member}, ich bin **BHMES** - Der *Bot* für die *Hems*!\n` +
            'Ich werde dir bei der Einrichtung helfen. Ich benötige folgende Infos von dir:\n' +
            '```MarkDown\n' +
            '* Vor- und Nachname\n' +
            '* Schwerpunkt (2. LK)\n' +
            '* Leistungskurs\n' +
            '* Sportkurs\n' +
            '* Religions-/Ethikkurs\n' +
            '* ergänzender Grundkurs (falls vorhanden)\n' +
            '```');

        nextMemberStep(member);
    } else if (!isMemberReady(member)) {
        nextMemberStep(member);
    }
}

/**
 * @param {dc.GuildMember} member 
 */
function isMemberReady(member) {
    const userStorage = users[member.id];

    const result = userStorage['FullName'] && userStorage['LK1'] && userStorage['LK2'] && userStorage['PE'] &&
        userStorage['Religion'] && userStorage['Science'] && userStorage['Misc'] && userStorage['Approved'];

    if (!result) {
        userStorage['Approved'] = false;
        filesChanged = true;
    }

    return result;
}

/**
 * @param {dc.User} member 
 */
async function nextMemberStep(member) {
    let userStorage = users[member.id] || (users[member.id] = {});

    if (!userStorage['FullName']) {
        member.send('\n\nBitte nenne mir deinen vollen Namen. Also zum Beispiel `Max Mustermann`');
    } else if (!userStorage['LK1']) {
        member.send('Bitte nenne mir deinen Schwerpunkt.\nVerfügbar: ```MarkDown\n* Wirtschaft 1 (Wi 1)\n* Wirtschaft 2 (Wi 2)\n* Gesundheit 1 (Ge 1)\n* Gesundheit 2 (Ge 2)\n* Elektrotechnik (Et)\n* Datenverarbeitung (Dv)\n* Ernährung (Ök)```');
    } else if (!userStorage['LK2']) {
        member.send('Bitte nenne mir deinen Leistungskurs.\nVerfügbar: ```MarkDown\n* [12a] Deutsch (de)\n* [12b] Englisch (en)\n* [12c] Biologie (bio)\n* [12d] Physik (ph)\n* [12e] Mathe 1 (ma1)\n* [12f] Mathe 2 (ma2)```');
    } else if (!userStorage['PE']) {
        member.send('Bitte nenne mir deinen Sportkurs.\nVerfügbar: ```MarkDown\n* Basketball (bb)\n* Volleyball (vb)\n* Schwimmen (sw)\n* Tischtennis (tt)\n* Klettern (kl)```');
    } else if (!userStorage['Religion']) {
        member.send('Bitte nenne mir deinen Ethik- oder Religionskurs.\nVerfügbar: ```MarkDown\n* Ethik 1 (ek1)\n* Ethik 2 (ek2)\n* Evangelisch 1 (rv1)\n* Evangelisch 2 (rv2)\n* Katholisch (rk1)```');
    } else if (!userStorage['Science']) {
        member.send('Bitte nenne mir deine Naturwissenschaft oder **Keine**.\nVerfügbar: ```MarkDown\n* Physik 1 (ph1)\n* Physik 2 (ph2)\n* Chemie (ch1)```');
    } else if (!userStorage['Spanish']) {
        member.send('Hast du Spanisch? (*Ja* oder *Nein*)');
    } else if (!userStorage['Misc']) {
        member.send('Bitte liste mir deine weiteren Kurse auf *(z.B. `Spanisch, Kunst`)* oder schreibe **Keine**. Verfügbar: ```MarkDown\n* Bilingual (bili)\n* Kunst (ku)\n* Theaterpädagogik (th)```');
    } else if (!userStorage['Approved']) {
        const embedMsg = await member.send(
            new dc.RichEmbed()
                .setColor(0xFFFF33)

                .setTitle('Dein Profil')
                .setDescription('**Bitte bestätige die folgenden Angaben mit dem Klick auf eines der Symbole unten**\n*Sollte etwas nicht stimmen, beginnt die Fragerei von Vorne!*').addBlankField()

                .addField('Vollständiger Name', userStorage['FullName'])
                .addField('Schwerpunkt', tempMapper[userStorage['LK1']])
                .addField('Leistungskurs', tempMapper[userStorage['LK2']])
                .addField('Sportkurs', tempMapper[userStorage['PE']])
                .addField('Ethik- oder Religionskurs', tempMapper[userStorage['Religion']])
                .addField('Naturwissenschaft', (userStorage['Science'] == '-' ? 'Keine' : tempMapper[userStorage['Science']]))
                .addField('Spanisch', (userStorage['Spanish'] == '-' ? 'Nein' : tempMapper[userStorage['Spanish']]))
                .addField('Weitere Kurse', tempMapper[userStorage['Misc']])

                .setFooter(`~${member instanceof dc.GuildMember ? member.user.username : member.username}`,
                    member instanceof dc.GuildMember ? member.user.avatarURL : member.avatarURL)
        );

        awaitApproval[member.id] = embedMsg.id;
        filesChanged = true;

        await embedMsg.react('✅')
            .catch(console.error);
        await embedMsg.react('❌')
            .catch(console.error);
    } else if (!userStorage['GaveRoles']) {
        let alreadyRegistered = false;

        if (names) {
            for (const key in users) {
                if (users.hasOwnProperty(key)) {
                    const userObj = users[key];

                    if (fullName == userObj['_FullNameFromNameList'] && !userObj['GaveRoles']) {
                        alreadyRegistered = true;
                        break;
                    }
                }
            }
        }

        if (alreadyRegistered) {
            return msg.author.send('Dein Name ist bereits auf dem Server verwendet worden! Sollte es sich um einen Fehler handeln, melde dich bitte in #anmeldung auf dem Server!');
        }


        const guildMember = await servingGuild.fetchMember(member);

        if (guildMember.nickname && guildMember.nickname != userStorage['FullName']) {
            await guildMember.setNickname(userStorage['FullName']).catch(async (err) => {
                if (err.code != 50013) {
                    console.error(err);
                }

                await member.send('⚠ *Dein Nickname konnte nicht gesetzt werden!* - Bitte schreib uns im #anmeldung-Kanal mit @Moderator oder @Admin an.');
            });
        }

        await guildMember.addRole(userStorage['LK1']).catch(console.error);
        await guildMember.addRole(userStorage['LK2']).catch(console.error);
        await guildMember.addRole(userStorage['PE']).catch(console.error);
        await guildMember.addRole(userStorage['Religion']).catch(console.error);

        if (userStorage['Science'] != '-') {
            await guildMember.addRole(userStorage['Science']).catch(console.error);
        }

        if (userStorage['Spanish'] != '-') {
            await guildMember.addRole(userStorage['Spanish']).catch(console.error);
        }

        if (userStorage['Misc'] != '-') {
            await guildMember.addRole(userStorage['Misc']).catch(console.error);
        }

        userStorage['GaveRoles'] = true;
        filesChanged = true;

        member.send('✅ **Du kannst nun auf den Server wechseln** - *In wenigen Sekunden erhälst du Zugriff auf mehrere Textchannel*');
        console.log(`Der Nutzer ${member.tag} (${userStorage['FullName']}) hat die Einrichtung abgeschlossen!`);
    }
}