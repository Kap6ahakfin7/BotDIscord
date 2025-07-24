const Discord = require("discord.js");
const chalk = require('chalk'); // Cor no Terminal

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.DirectMessages,
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildMessageReactions,
    "32767"
  ],
  partials: [Discord.Partials.Channel],
});

// LIMPA TODO O TERMINAL - (Opcional)
console.clear();

// COMANDOS SLASH
module.exports = client;
client.slashCommands = new Discord.Collection();
client.aliases = new Discord.Collection();
require('./handler')(client);

// DATABASES
const { JsonDatabase, } = require("wio.db");
const dbB = new JsonDatabase({ databasePath: "./databases/myJsonBotConfig.json" });

/*============================= | BOT - ON | =========================================*/

client.login(dbB.get(`token`));

/*============================= | READY TERMINAL | =========================================*/

client.on('ready', async () => {

  console.log(chalk.hex(`4169E1`).bold(`[BOT] APP ${chalk.hex(`00FF00`).bold(`${client.user.username}`)} Online!`));
  console.log(chalk.hex(`4169E1`).bold(`[BOT] Estou em ${client.guilds.cache.size} Servidores!`));
  console.log(chalk.hex(`4169E1`).bold(`[BOT] Base Feita por Z BOTS`));

  /*============================= | STATUS | =========================================*/

  let activityText = `LN Captcha - BOT`;
  client.user.setActivity(activityText, {
    type: Discord.Activity.Streaming,
    url: ''
  });
  client.user.setStatus("online");

});

/*============================= | CMDS'S | =========================================*/
client.on('interactionCreate', async (interaction) => {

  if (!interaction.isCommand()) return;
  if (interaction.isCommand()) {

    const cmd = client.slashCommands.get(interaction.commandName);
    if (!cmd) return interaction.reply({ content: `<a:naosz:1093773559081467974> | Erro, Este comando não existe!`, ephemeral: true });

    interaction["member"] = interaction.guild.members.cache.get(interaction.user.id);
    cmd.run(client, interaction)

  };
});

let codeCaptchaQuit = ""; // Código fora do escopo

/*============================= | BOTÕES - LN <3 | =========================================*/
client.on('interactionCreate', async (interactionBM) => {
  if (interactionBM.isButton()) {

    if (interactionBM.customId === "verificarCap") {

      let codeCaptcha = "";
      for (let i = 0; i < 6; i++) {
        var codeAll = "QWERTYUIOPASDFGHJKLZXCVBNM123456789";
        codeCaptcha += codeAll[Math.floor(Math.random() * codeAll.length)];
      };
      codeCaptchaQuit = codeCaptcha;

      let modalVerify = new Discord.ModalBuilder()
        .setCustomId('modalVerify')
        .setTitle(`🔑 | ${codeCaptcha}`)

      let modalCode = new Discord.TextInputBuilder()
        .setCustomId('code')
        .setLabel(`Código de Verificação: ${codeCaptcha}`)
        .setStyle(Discord.TextInputStyle.Short)
        .setMaxLength(6)
        .setPlaceholder(`Insirá o Código: ${codeCaptcha}`)
        .setRequired(true)

      const codeM = new Discord.ActionRowBuilder().addComponents(modalCode);

      modalVerify.addComponents(codeM);
      await interactionBM.showModal(modalVerify);

    };
  };
});

/*============================= | MODAIS - LN <3 | =========================================*/
client.on('interactionCreate', async (interactionM2) => {
  if (interactionM2.isModalSubmit()) {

    if (interactionM2.customId === "modalVerify") {

      let codeInserido = interactionM2.fields.getTextInputValue('code').toUpperCase();

      // Verifica se o código que o usuário inseriu é o mesmo do captcha
      if (codeInserido !== codeCaptchaQuit) {

        await interactionM2.reply({
          content: `❌ | O código inserido não corresponde ao código captcha.`,
          ephemeral: true
        });

      } else {

        // Try-catch p evitar erros
        try {

          const roleV = interactionM2.guild.roles.cache.get(`${dbB.get(`cargoId`)}`);
          const memberV = interactionM2.guild.members.cache.get(`${interactionM2.user.id}`);
          await memberV.roles.add(roleV);

          await interactionM2.reply({
            content: `✅ | Verificação concluída com sucesso! Cargo atribuído: ${roleV}.`,
            ephemeral: true
          });

        } catch (error) {
          return interactionM2.reply({
            content: `❌ | Erro ao Atribuir o cargo: **${error.name + ": " + error.message}**`,
            ephemeral: true
          });
        };

      };

    };
  };
});
