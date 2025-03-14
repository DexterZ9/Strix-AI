const { Telegraf } = require('telegraf');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Inicializa el bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// Cargar comandos automáticamente
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

let loadedCommands = 0;

commandFiles.forEach(file => {
  const { commands, handler } = require(`./commands/${file}`);

  if (commands && handler) {
    commands.forEach(command => {
      bot.command(command, (ctx) => handler(ctx));
      console.log(`✅ Comando cargado: /${command}`);
      loadedCommands++;
    });
  } else {
    console.warn(`⚠️ Archivo ignorado (formato inválido): ${file}`);
  }
});

// Iniciar el bot
bot.launch().then(() => {
  console.log('🚀 Strix-AI ha iniciado correctamente.');
  console.log(`📌 Total de comandos cargados: ${loadedCommands}`);
}).catch((err) => {
  console.error('❌ Error al iniciar el bot:', err.message);
});
