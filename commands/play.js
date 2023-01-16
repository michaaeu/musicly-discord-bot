const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { QueryType } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays a single song from YT")
    .addStringOption((option) =>
      option.setName("url").setDescription("the song's url").setRequired(true)
    ),
  execute: async ({ client, interaction }) => {
    // Make sure the user is inside a voice channel
    if (!interaction.member.voice.channel)
      return interaction.reply(
        "You need to be in a Voice Channel to play a song."
      );

    // Create a play queue for the server
    const queue = await client.player.createQueue(interaction.guild);

    // Wait until you are connected to the channel
    if (!queue.connection)
      await queue.connect(interaction.member.voice.channel);

    let embed = new EmbedBuilder();

    let url = interaction.options.getString("url");

    // Search for the song using the discord-player
    const result = await client.player.search(url, {
      requestedBy: interaction.user,
      searchEngine: QueryType.YOUTUBE_VIDEO,
    });

    // finish if no tracks were found
    if (result.tracks.length === 0) return interaction.reply("No results");

    // Add the track to the queue
    const song = result.tracks[0];
    await queue.addTrack(song);
    embed
      .setDescription(
        `**[${song.title}](${song.url})** has been added to the Queue`
      )
      .setFooter({ text: `Duration: ${song.duration}` });
    // .setThumbnail(song.thumbnail)

    // Play the song
    if (!queue.playing) await queue.play();

    // Respond with the embed containing information about the player
    await interaction.reply({
      embeds: [embed],
    });
  },
};
