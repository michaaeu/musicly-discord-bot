const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { QueryType } = require("discord-player")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("playlist")
        .setDescription("Plays a playlist from YT")
        .addStringOption(
            option => option.setName("url").setDescription("the playlist's url").setRequired(true)
        )
    ,
    execute: async ({ client, interaction }) => {
        // Make sure the user is inside a voice channel
        if (!interaction.member.voice.channel) return interaction.reply("You need to be in a Voice Channel to play a song.");

        // Create a play queue for the server
        const queue = await client.player.createQueue(interaction.guild);

        // Wait until you are connected to the channel
        if (!queue.connection) await queue.connect(interaction.member.voice.channel)

        let embed = new EmbedBuilder()

        // Search for the playlist using the discord-player
        let url = interaction.options.getString("url")
        const result = await client.player.search(url, {
            requestedBy: interaction.user,
            searchEngine: QueryType.YOUTUBE_PLAYLIST
        })

        if (result.tracks.length === 0)
            return interaction.reply(`No playlists found with ${url}`)

        // Add the tracks to the queue
        const playlist = result.playlist
        await queue.addTracks(result.tracks)
        embed
            .setDescription(`**${result.tracks.length} songs from [${playlist.title}](${playlist.url})** have been added to the Queue`)
        // .setThumbnail(playlist.thumbnail)

        // Play the song
        if (!queue.playing) await queue.play()

        // Respond with the embed containing information about the player
        await interaction.reply({
            embeds: [embed]
        })
    },
}
