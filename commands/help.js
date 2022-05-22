const { MessageEmbed } = require('discord.js')

module.exports = {
  description: 'How to the kitten.',
  name: 'help',
  options: [],
  showHelp: false,

  run: async (client, interaction) => {
    // Get list of commands (except this one)
    const commands = client.commands.filter(x => x.showHelp !== false)

    // Create embed
    const embed = new MessageEmbed()
      .setColor('BLUE')
      .setTitle(client.user.username)
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription('"It hath an head like a swine, and a tail like a rat,' +
        ' and is of the bigness of a cat."')
      .addField(
        `${commands.size} commands available:`,
        commands.map(x => `\`/${x.name}\``).join(' | ')
      )
      .setTimestamp()
      .setFooter({
        text: 'Kitten how-to',
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })

    // Send reply
    interaction.reply({ embeds: [embed] }).catch(e => { })
  }
}
