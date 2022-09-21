const sounds = require('../kitten-sounds.js')
const { EmbedBuilder } = require('discord.js')

module.exports = (client, interaction) => {
  // Handle slash commands
  if (interaction.isChatInputCommand()) {
    // Verify command
    const command = client.commands.get(interaction.commandName)
    if (!command) {
      return interaction.reply({
        content: sounds.confused(),
        ephemeral: true
      })
    }

    // Verify user is in same voice channel as bot
    if (command.voiceChannel) {
      if (!interaction.member.voice.channel || (
        interaction.guild.members.me.voice.channel &&
        interaction.member.voice.channel.id !== interaction.guild.members.me.voice.channel.id
      )) {
        return interaction.reply({
          content: `${sounds.confused()} :microphone:`,
          ephemeral: true
        })
      }
    }

    // Turn options into args for compatibility with message commands
    interaction.args = []
    interaction.options.data.forEach((option) => {
      interaction.args.push(option.value)
    })
    interaction.silent = false

    // Do command
    console.log(`Running slash command: ${interaction.commandName}`)
    command.run(client, interaction)
  }

  // Handle buttons
  if (interaction.isButton()) {
    const queue = client.player.getQueue(interaction.guildId)
    switch (interaction.customId) {
      case 'saveTrack': {
        if (!queue || !queue.playing) {
          return interaction.reply({
            content: `${sounds.confused()} :question::speaker::question:`,
            ephemeral: true,
            components: []
          })
        } else {
          const embed = new EmbedBuilder()
            .setColor(client.config.color)
            .setTitle('Saved track')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
              { name: 'Track', value: `\`${queue.current.title}\`` },
              { name: 'Duration', value: `\`${queue.current.duration}\`` },
              { name: 'URL', value: `${queue.current.url}` },
              { name: 'Saved Server', value: `\`${interaction.guild.name}\`` },
              { name: 'Requested By', value: `${queue.current.requestedBy}` }
            ).setTimestamp()
          interaction.member.send({ embeds: [embed] }).then(() => {
            return interaction.reply({
              content: `${sounds.yes()} :white_check_mark:`,
              ephemeral: true
            }).catch(e => { console.log(e) })
          }).catch(e => {
            return interaction.reply({
              content: `${sounds.confused()} :x::incoming_envelope::x:`,
              ephemeral: true
            }).catch(e => { console.log(e) })
          })
        }
        break
      }
      case 'time': {
        if (!queue || !queue.playing) {
          return interaction.reply({
            content: `${sounds.no()} :x::zero::musical_note:`,
            ephemeral: true,
            components: []
          })
        } else {
          const progress = queue.createProgressBar()
          const timestamp = queue.getPlayerTimestamp()

          if (timestamp.progress === 'Infinity') {
            return interaction.message.edit({
              content: ':infinity:'
            }).catch(e => { console.log(e) })
          }

          const embed = new EmbedBuilder()
            .setColor(client.config.color)
            .setTitle(queue.current.title)
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp()
            .setDescription(`${progress} (**${timestamp.progress}**%)`)
          interaction.message.edit({ embeds: [embed] }).catch(e => { })
        }
      }
    }
  }
}
