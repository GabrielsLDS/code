const {
    Client,
    Collection
} = require("discord.js");
const Discord = require ("discord.js");
const {
    readdir,
    lstatSync
} = require("fs");
const {
    token,
    prefix
} = require("./config.json");
const client = new Client();
client.cmds = new Collection();
client.aliases = new Collection();
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('banco.json')
const db = low(adapter)

client.on("ready", () => {
    console.log("bot online !")
})

const carregarComandos = module.exports.carregarComandos = (dir = "./commands/") => {
    readdir(dir, (erro, arquivos) => {
        if (erro) return console.log(erro);
        arquivos.forEach((arquivo) => {
            try {
                if (lstatSync(`./${dir}/${arquivo}`).isDirectory()) {
                    carregarComandos(`./${dir}/${arquivo}`)
                } else if (arquivo.endsWith(".js")) {
                    console.log(`Iniciando leitura do arquivo: ${arquivo.split(".")[0]}`)
                    const salvar = (nome, aliases = [], props) => {
                        client.cmds.set(nome, props)
                        if(aliases.length > 0) aliases.forEach((alias) => client.aliases.set(alias, props))
                        console.log(`Comando salvo: ${nome} | ${aliases.length} aliases`)
                    }
                    const props = require(`./${dir}/${arquivo}`)
                    if(!props.run)  {
                        console.log(`Não existe uma função que ative o comando no arquivo: ${arquivo.split(".")[0]}. Então ele foi ignorado`);
                        return;
                    }

                    if (props.info && props.info.name) {
                        const nome = props.info.name
                        const aliases = props.info.aliases || []
                        salvar(nome, aliases, props)
                    } else {
                        const propsKeys = Object.keys(props)
                        if (!propsKeys) {
                            console.log(`Não existem propiedades no arquivo: ${arquivo.split(".")[0]}. Então ele foi ignorado.`)
                            return;
                        }
                        const nomeKey = propsKeys.find((key) => props[key] && (props[key].name || props[key].nome))
                        if(!nomeKey) {
                            console.log(`Não existe a propiedade que remeta ao nome do comando no arquivo: ${arquivo.split(".")[0]}. Então ele foi ignorado.`)
                            return; 
                        }

                        const nome = props[nomeKey].name || props[nomeKey].nome
                        const aliases = props[nomeKey].aliases || []
                        salvar(nome, aliases, props)
                    }
                }
            } catch (ex) {
                console.log(`Erro ao ler o arquivo ${arquivo}`)
                console.log(ex)
            }
        })
    })
}
carregarComandos();

/*
Todo arquivo de comando deve seguir o seguinte padrão:
module.exports.run = (client, message, args) => {
~ código do comando aqui ~
}
module.exports.info = {
    name: "nome do comando",
    aliases: ["outro meio de chamar o comando"] -- essa parte é opcional
}
*/

client.on("message", async message => {
    if (message.author.bot) return;
    if (message.content.indexOf(prefix) !== 0) return;
    if (message.channel.type != 'text') return; // opcional: vai ignorar todos os comandos que não forem executados em canais de texto
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    const cmdParaExecutar = client.cmds.get(cmd) || client.aliases.get(cmd)
    if (cmdParaExecutar) cmdParaExecutar.run(client, message, args)
})

client.on("guildMemberAdd", async member => {
    let embed = new Discord.RichEmbed()
    .setColor("BLUE")
    .addField(`<:LoliFofa:628000390910181397> ${member.user.username} | Bem vindo. `, `**Olá, seja bem vindo(a) ao servidor da UnK**`)
    .addField(`<:Cafe:628000390822101022> Sabia que...`, `**Você é o ${member.guild.members.size}º membro aqui no servidor?**`)
    .addField(`<:ocupado:628007864946130954> Tag do usuario`, `**${member.user.tag}(${member.id})**`)
    .addField(`<:LoliSla:628000390864175136> Alguma duvida?`, `**Use !duvida (duvida) no chat de comandos.**`)
    .addField(`<:Loli1900:628000390834814996> Evite punições`, `**Leia todas as nossas regras para que não seja punido.**`)
    .addField(`<:boss:628000390742540308> Alguma sugestão ?`, `**Use !sugestão em um chat de comandos**`)
    .setImage("https://cdn.discordapp.com/attachments/627307377066246182/628016919156621353/pikachufeliz.gif")
    .setTimestamp(new Date())

let canal = member.guild.channels.find(canal => canal.name === "┃ᴘᴏʀᴛᴀᴏ-ᴘʀɪɴᴄɪᴘᴀʟ┃");

canal.send(embed)
//`Você é o ${member.guild.members.size}º membro aqui no servidor`;

})

client.on("guildMemberRemove", async member => {
    
    let embed = new Discord.RichEmbed()
    .setTitle(`${member.user.tag} saiu do servidor...`)
    .setDescription(`<:sad:628015784370896926> Sentiremos sua falta... `)
    .setImage("https://cdn.discordapp.com/attachments/627307377066246182/628016928295747605/pikachutrist.gif")


    let canal = member.guild.channels.find(canal => canal.name === "┃ᴘᴏʀᴛᴀᴏ-ᴘʀɪɴᴄɪᴘᴀʟ┃");

    canal.send(embed)

})


client.on('ready', () => {
    let tt = [
         //Watching = Assistindo, Playing = Jogando, Streaming = Transmitindo, Listening = Ouvindo
        { name: `Sou um bot oficial desse servidor, Otaku's Forever.`, type: 'WATCHING'},
        { name: `Fui desenvolvido pelo gabriel, owner do Otaku's Forever.`, type: 'WATCHING'},
        { name: `Use !ajuda para ver meus comandos.`, type: 'PLAYING'}
    ];
    function st() {
        let rs = tt[Math.floor(Math.random() * tt.length)];
        client.user.setPresence({ game: rs });
    }
    st();
    setInterval(() => st(), 10000); //1000 = 1 segundo, 5000 = 5 segundos, 6700 = 6,7 segundos, 10000 = 10 segundos.

    client.on("guildMemberAdd", async member => {

        member.addRole('629479099810709504')

    })    
});

client.login(token)