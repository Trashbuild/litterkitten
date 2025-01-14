// Imports
const fs = require('node:fs')
const path = require('node:path')
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials
} = require('discord.js')

// Create the actual bot with the things it intends to do
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ],
  // Fix failure to read DMs
  partials: [Partials.Channel]
})

// Load commands from "commands" directory into client.commands
client.commands = new Collection()
const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)
for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder)
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)
    const commandName = file.split('.')[0]
    client.commands.set(commandName, command)
  }
}

// Load events from "events" directory
const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))
for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file)
  const event = require(filePath)
  const eventName = file.split('.')[0]
  if (event.once) {
    client.once(eventName, (...args) => event.execute(...args))
  } else {
    client.on(eventName, (...args) => event.execute(...args))
  }
}

// Create music player from player.js file
require('./player.js').initPlayer(client)

// Login!
client.login(require('./config.json').token)
