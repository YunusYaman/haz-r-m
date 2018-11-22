
//değişkenlerimiz
const Discord = require('discord.js');
const { Client, Util } = require('discord.js');
const chalk = require('chalk');
const ayarlar = require('./ayarlar');
const { token, prefix, GOOGLE_API_KEY } = require('./ayarlar');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core'); 
const client = new Client({ disableEveryone: true }); 
const youtube = new YouTube(GOOGLE_API_KEY);
const queue = new Map();
const moment = require("moment");
require("moment-duration-format");

console.log(`Gaza geldim hizmete hazırım.`);

var disconnect = 
   chalk.red('Discord veri tabanlı ile bağlantım kesildi. ♣')+
   chalk.yellow('Tekrar bağ"lanıyorum..')


var reconnecting = 
  chalk.bgWhite.red('Tekrardan bağlandım. \n  Müzik komutları aktif. ');


client.on('warn', console.warn);
client.on('error', console.error);
client.on('disconnect', () => console.log(disconnect));
client.on('reconnecting', () => console.log(reconnecting));




//asıl kodlama burada başlıyor
 client.on('message', async msg => { //eğer herhangi bir komutu herhangi bir bot yazarsa çalıştırma!
  if (msg.author.bot) return undefined;
  if (!msg.content.startsWith(prefix)) return undefined;


  //DEĞİŞKENLERİMİZ 
  const args = msg.content.split(' ');
  const searchString = args.slice(1).join(' ');
  const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
  const serverQueue = queue.get(msg.guild.id);

  let command = msg.content.toLowerCase().split(' ')[0];
  command = command.slice(prefix.length)
   
   
  //oynat komutu başlığı
  if (command === 'oynat') {
    const voiceChannel = msg.member.voiceChannel;// bu kısımda sesli kanalımızı belirtelim.
    if (!voiceChannel) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setAuthor(msg.author.username , msg.author.avatarURL)
    .setColor('RANDOM')
    .setDescription(' <:asagiparmak:514589468540534811> | Öncelikle sesli bir kanala katılmalısınız.'));//eğer sesli kanalda yoksa
    const permissions = voiceChannel.permissionsFor(msg.client.user);//eğer botun sesli kanala girmeye yetkisi yoksa!
    if (!permissions.has('CONNECT')) {//eğer bağlanamıyorsa
      return msg.channel.sendEmbed(new Discord.RichEmbed()
      .setAuthor(msg.author.username, msg.author.avatarURL)
      .setColor('RANDOM')
      .setDescription(' <:asagiparmak:514589468540534811> | Lütfen sesli kanala giriş yapabilmem için bana gereken yetkileri veriniz.'));
    }
    if (!permissions.has('SPEAK')) {//mikrafon kapalı ise
      return msg.channel.sendEmbed(new Discord.RichEmbed()
      .setAuthor(msg.author.username,msg.author.avatarURL)
      .setColor('RANDOM')
      .setDescription(' <:asagiparmak:514589468540534811> | Mikrafonum kapalı lütfen açtığınıza veya yetkileri verdiğinize emin olun!'));
    }

    //sorun yoksa geri dönelim dostlar
    if (String(url).match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      const playlist = await youtube.getPlaylist(url);
      const videos = await playlist.getVideos();
      for (const video of Object.values(videos)) {
        const video2 = await youtube.getVideoByID(video.id); 
        await handleVideo(video2, msg, voiceChannel, true); 
      }//ops başarılı
      return msg.channel.sendEmbed(new Discord.RichEmbed()
      .setAuthor(msg.author.username,msg.author.avatarURL)
      .setColor('RANDOM')
      .setDescription(` <:yukariparmak:514588503775117313>  | Başarılı \n  **${playlist.title}** adlı şarkı başarıyla kuyruğa eklendi.`)).then(xnxx => {xnxx.delete(5000)});
    } else {
      try {
        var video = await youtube.getVideo(url);
      } catch (error) {
        try {

          //şarkı seçimine geçelim
          var videos = await youtube.searchVideos(searchString, 10);
          let index = 0;
          msg.channel.sendEmbed(new Discord.RichEmbed()
          .setColor('RANDOM')
          .setAuthor('Şarkı Seçimi',client.user.avatarURL)
          .setDescription(`
${videos.map(video2 => `**${++index} -** [${video2.title}](https:://youtube.com/)`).join('\n')} \n
<:sagok:514594927452094465> | **lütfen 1-10 arasında bir rakam seciniz 30 saniye içinde liste iptal edilecektir. **
          `));
          // zamanlayıcıyı ayarlayalım.
          try {
            var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
              maxMatches: 1,
              time: 10000,
              errors: ['time']
            });
          } catch (err) {
            console.error(err);//eğer 30 saniye içinde seçilmez ise
            return msg.channel.sendEmbed(new Discord.RichEmbed()
            .setColor('RANDOM')
            .setDescription(' <:asagiparmak:514589468540534811> | Şarkı seçimi iptal edildi.'));
          }
          const videoIndex = parseInt(response.first().content);
          var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
        } catch (err) {
          console.error(err);
          return msg.channel.sendEmbed(new Discord.RichEmbed()
          .setColor('RANDOM')
          .setDescription('<:asagiparmak:514589468540534811> | Bir hata çıktı sorunu yöneticilere bildiriniz.'));
        }
      }
      return handleVideo(video, msg, voiceChannel);
    }
  } else if (command === 'geç') {//geç komutu
    if (!msg.member.voiceChannel) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setAuthor(msg.author.username,msg.author.avatarURL)
    .setDescription(' <:asagiparmak:514589468540534811> | Lütfen öncelikle sesli bir kanala giriş yapınız. '));
    //eğer şu an bir şey çalmıyorsa hata ver.
    if (!serverQueue) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(' <:asagiparmak:514589468540534811> | Şu an herhangi bir şey çalmıyor.'));
    //şarkıyı geçelim.
		serverQueue.connection.dispatcher.end('Geç komutu kullanıldı.');
    return undefined;
  } else if (command === 'qweıqwyeoqıwe2940112905732151*35809') {//kapat
    if (!msg.member.voiceChannel) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setAuthor(msg.author.username,msg.author.avatarURL)
    .setDescription(' <:asagiparmak:514589468540534811> | Lütfen öncelikle sesli bir kanala giriş yapmayınız. '));
    //herhangi bir şey çalmıyorsa
    if (!serverQueue) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(' <:asagiparmak:514589468540534811> | Şu an herhangi bir şey çalmıyor o yüzden bu komutu kullanamazsınız.'));
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end('Kapat komutu kullanıldı.');
    return undefined;
  } else if (command === 'ses') {//Ses
    if (!msg.member.voiceChannel) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(' <:asagiparmak:514589468540534811> | Lütfen öncelikle sesli bir kanala katılınız.'));
    if (!serverQueue) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(' <:asagiparmak:514589468540534811> | Şu an herhangi bir şey çalmıyor.'));
    if (!args[1]) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')//şu andaki ses seviyesini gösterir.
    .setDescription(`<:loading:503547908306632715> | Şu andaki ses seviyesi : **${serverQueue.volume}**`));
    serverQueue.volume = args[1];
    serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 100);
    return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(`Ses seviyesi ayarlandı. \n Yeni ses seviyesi :  **${args[1]}**`));
  } else if (command === 'şarkıadı') {//şu an oynatılan şarkı 
    if (!serverQueue) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(' <:asagiparmak:514589468540534811> | Şu anda herhangi bir şey çalmıyor.'));
    return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .addField("• Ses Seviyesi", `${serverQueue.volume}%`, true)
    .setDescription(`🎶 Şarkı adı : **${serverQueue.songs[0].title}** `));
  } else if (command === 'kuyruk') {
    if (!serverQueue) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(' <:asagiparmak:514589468540534811> | şu anda herhangi bir şey çalmıyor.'));
    return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle(`**${msg.guild.name}** Sunucusunun müzik listesi:`)
    .setDescription(`
${serverQueue.songs.map(song => `**»** ${song.title}`).join('\n')} \n 
 \n **Şu an oynatılan:** ${serverQueue.songs[0].title}
    `));
  } else if (command === 'durdur') {//durdur
    if (serverQueue && serverQueue.playing) {
      serverQueue.playing = false;
      serverQueue.connection.dispatcher.pause();
      return msg.channel.sendEmbed(new Discord.RichEmbed()
      .setColor('RANDOM')
      .setDescription('⏸ | Müzik başarı ile durduruldu.'));
    }//eğer bir şey çalmıyorsa
    return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setDescription(' <:asagiparmak:514589468540534811> | Şu anda herhangi bir şey çalmıyor.'));
  } else if (command === 'devamet') {//devamet
    if (serverQueue && !serverQueue.playing) {
      serverQueue.playing = true;
      serverQueue.connection.dispatcher.resume();
      return msg.channel.sendEmbed(new Discord.RichEmbed()
      .setColor('RANDOM')
      .setDescription('▶ | Müzik tekrar devam ediyor.'));
    }//eğer bir şey çalmıyorsa
    return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(' <:asagiparmak:514589468540534811> | Şu anda herhangi bir şey çalmıyor.'));
  }

  return undefined;
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
const serverQueue = queue.get(msg.guild.id);
console.log(video.title);
const song = {
  id: video.id,
  title: video.title, 
  url: `https://www.youtube.com/watch?v=${video.id}`,
  durationh: video.duration.hours,
  durationm: video.duration.minutes,
  durations: video.duration.seconds,
  views: video.views,
};
if (!serverQueue) {
  const queueConstruct = {
    textChannel: msg.channel,
    voiceChannel: voiceChannel,
    connection: null,
    songs: [],
    volume: 100,
    playing: true
  };
  queue.set(msg.guild.id, queueConstruct);

  queueConstruct.songs.push(song);

  try {
    var connection = await voiceChannel.join();
    queueConstruct.connection = connection;
    play(msg.guild, queueConstruct.songs[0]);
  } catch (error) {
    console.error(`I could not join the voice channel: ${error}`);
    queue.delete(msg.guild.id);
    return msg.channel.send(`I could not join the voice channel: ${error}`);
  }
} else {
  serverQueue.songs.push(song);
  console.log(serverQueue.songs);
  if (playlist) return undefined;
  else return msg.channel.sendEmbed(new Discord.RichEmbed()
.addField('\n• Başlık', `[${song.title}](${song.url})`, true)
.addField("• Ses Seviyesi", `${serverQueue.volume}%`, true)
.addField("• Süre", `${song.durationm}:${song.durations}`, true)
.setThumbnail(`https://img.youtube.com/vi/${song.id}/hqdefault.jpg`) // yaptımm 
.setAuthor(`Ekleyen: ${msg.author.username}`,msg.author.avatarURL)
.setDescription(`<:yukariparmak:514588503775117313> | **${song.title}** Adlı şarkı kuyruğa eklendi.`)
.setColor('RANDOM'));
}
return undefined;
}

function play(guild, song) {
const serverQueue = queue.get(guild.id);

if (!song) {
  serverQueue.voiceChannel.leave();
  queue.delete(guild.id);
  return;
}
console.log(serverQueue.songs);

const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
  .on('end', reason => {
    if (reason === 'Stream is not generating quickly enough.') console.log('Şarkı sonlandı.');
    else console.log(reason);
    serverQueue.songs.shift();
    play(guild, serverQueue.songs[0]);
  })
  .on('error', error => console.error(error));
dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);


serverQueue.textChannel.sendEmbed(new Discord.RichEmbed()
.addField('\n• Başlık', `[${song.title}](${song.url})`, true)
.addField("• Ses Seviyesi", `${serverQueue.volume}%`, true)
.addField("• Süre", `${song.durationm}:${song.durations}`, true)
.setAuthor('İşlem Başarılı',client.user.avatarURL)
.setThumbnail(`https://img.youtube.com/vi/${song.id}/hqdefault.jpg`) // yaptımm 
.setDescription(` <:yukariparmak:514588503775117313> |  Şu anda oynatılıyor: **${song.title}**`)
.setColor('RANDOM'));
}


client.on('message', (message) => {
  if (message.content.toLowerCase() === prefix + 'gir') {
      if (!message.guild) {
          const ozelmesajuyari = new Discord.RichEmbed()
          .setDescription(`You can not use commands here.`)
          return message.author.sendEmbed(ozelmesajuyari); }
      try 
  {
  message.member.voiceChannel.join();
   return message.channel.sendEmbed(new Discord.RichEmbed()
   .setDescription(' <:yukariparmak:514588503775117313> | Başarı ile bulunduğunuz kanala giriş yaptım.')
   .setColor('RANDOM'));
  }
  catch(e) 
  {
  return message.channel.sendEmbed(new Discord.RichEmbed()
  .setDescription(' <:asagiparmak:514589468540534811>  | Lütfen ilk olarak sesli bir kanala giriş yapınız.')
  .setColor('RANDOM'));
  }
  }

  if (message.content.toLocaleLowerCase() === prefix + 'kapat') {
      if (!message.guild) {
          const ozelmesajuyari = new Discord.RichEmbed()
          .setDescription(`You can not use commands here.`)
          return message.author.sendEmbed(ozelmesajuyari); }
          try
          {
              message.member.voiceChannel.leave();
              return message.channel.sendEmbed(new Discord.RichEmbed()
              .setDescription(':outbox_tray: | Başarılı bir şekilde çıkış yaptım.')
              .setColor('RANDOM'));
             }
             catch(e) 
             {
             return message.channel.sendEmbed(new Discord.RichEmbed()
             .setDescription(' <:asagiparmak:514589468540534811>  | Lütfen ilk olarak sesli bir kanala giriş yapınız.')
             .setColor('RANDOM'));
             }
          };           
        if (message.content.toLowerCase() === prefix + 'sesli-kanasdjkbkjAWHKHKSAGJKSGDJHASGDJHASDGAJHSDGSJHal-bilgi' ) {
          if (!message.guild) {
            const ozelmesajuyari = new Discord.RichEmbed()
            .setDescription(`You can not use commands here.`)
            return message.author.sendEmbed(ozelmesajuyari); }
          try 
          {
         message.channel.sendEmbed(new Discord.RichEmbed().addField(' __Sesli kanal bilgileri__', ` **•** Kanal adı: **${message.member.voiceChannel.name}** \n **•** Max kişi sayısı: **${message.member.voiceChannel.userLimit}** \n **•** Bit hızı: **${message.member.voiceChannel.bitrate}** \n **•** kanal ID: **${message.member.voiceChannelID} ** \n **•** Kanal pozisyonu: **${message.member.voiceChannel.position}**`).setColor('RANDOM'));
            }
            catch(e)
            {
              message.channel.sendEmbed(new Discord.RichEmbed()
              .setDescription(' <:asagiparmak:514589468540534811> | Lütfen ilk olarak sesli bir kanala giriş yapınız.')
              .setColor('RANDOM'));
            };
          }           
      });      
/*
if (command === "setprefix") {
//if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send(`__**Access Denied**__\nYou must have __MANAGE_GUILD__ perms to use this command.`); // Checks for permissions to change the prefix
//const newprefix = args.slice(1).join(" "); // define the prefix
//guilds[message.guild.id].prefix = newprefix; // set the prefix
  message.channel.send(`this command is closed.`); // reply with the new sexy prefix!
}
*/

client.login(ayarlar.token);
