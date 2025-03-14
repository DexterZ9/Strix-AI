
module.exports = {
  commands: ['help'],
  handler: (ctx) => {
    ctx.reply(
    'Comandos disponibles:\n' +
    '/start - Inicia el bot\n' +
    '/help - Muestra este mensaje de ayuda'
  );
  }
};
