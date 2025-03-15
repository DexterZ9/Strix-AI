const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  commands: ['applemusic'],
  handler: async (ctx) => {
    const message = ctx.message.text.split(' ').slice(1).join(' ');

    if (!message) {
      return ctx.reply('Debes proporcionar un enlace o texto para buscar. Ejemplo:\n/applemusic Twice\n/applemusic https://music.apple.com/...');
    }

    // Verificar si es un enlace de Apple Music
    const appleMusicRegex = /^https?:\/\/music\.apple\.com\/.+/;
    if (appleMusicRegex.test(message)) {
      // Descargar la canción
      const apiUrl = `https://delirius-apiofc.vercel.app/download/applemusicdl?url=${encodeURIComponent(message)}`;
      
      try {
        const response = await axios.get(apiUrl);
        if (!response.data.status) {
          return ctx.reply('No se pudo obtener la canción. Verifica el enlace.');
        }

        const { name, artists, download } = response.data.data;
        const filePath = path.join(__dirname, '../tmp', `${name} - ${artists}.mp3`);

        // Descargar el archivo de audio
        const writer = fs.createWriteStream(filePath);
        const downloadResponse = await axios.get(download, { responseType: 'stream' });
        downloadResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        // Enviar el archivo al chat
        await ctx.replyWithAudio({ source: filePath }, { title: name, performer: artists });

        // Eliminar el archivo después de enviarlo
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Error al descargar música:', error);
        ctx.reply('Ocurrió un error al descargar la canción.');
      }
    } else {
      // Realizar búsqueda
      const searchUrl = `https://delirius-apiofc.vercel.app/search/applemusicv2?query=${encodeURIComponent(message)}`;

      try {
        const searchResponse = await axios.get(searchUrl);
        const results = searchResponse.data.data;

        if (!results || results.length === 0) {
          return ctx.reply('No se encontraron resultados.');
        }

        let resultMessage = 'Resultados encontrados:\n\n';
        results.forEach((track, index) => {
          resultMessage += `${index + 1}. 🎵 *${track.title}* - ${track.artist}\n[Enlace](${track.url})\n\n`;
        });

        ctx.replyWithMarkdownV2(resultMessage);
      } catch (error) {
        console.error('Error al buscar música:', error);
        ctx.reply('Ocurrió un error al buscar la canción.');
      }
    }
  }
};
