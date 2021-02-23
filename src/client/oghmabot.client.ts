import { Collection } from 'discord.js';
import { CommandoClient, CommandoClientOptions } from 'discord.js-commando';
import { getAllCommands } from '../commands';
import { BasePoller, MessageExpiryPoller, StatusPoller } from './pollers';
import { handleClientError, handleClientReady, handleGuildCreate, handleGuildDelete, handleMessageEvent } from './events';
import { SequelizeProvider } from './settings';

export class OghmabotClient extends CommandoClient {
  pollers: Collection<string, BasePoller<unknown>> = new Collection();

  constructor(options?: CommandoClientOptions) {
    super(options);
    this.setDefaultPollers();
    this.setRegistryDefaults();
    this.setEventListeners();
    this.setProvider(new SequelizeProvider(this));
  }

  setDefaultPollers(): void {
    this.pollers.set('messageExpiry', new MessageExpiryPoller(this));
    this.pollers.set('status', new StatusPoller(this));
  }

  setRegistryDefaults(): void {
    this.registry
      .registerDefaultTypes()
      .registerGroups([
        ['server', 'Server Information'],
        ['lore', 'Lore'],
        ['mechanics', 'Mechanics'],
        ['commands', 'Command Administration'],
        ['util', 'Help'],
        ['owner', 'Owner'],
      ])
      .registerDefaultCommands({ prefix: false, unknownCommand: false })
      .registerCommands(getAllCommands());
  }

  setEventListeners(): void {
    this.on('error', async error =>  await handleClientError(this, error));
    this.on('guildCreate', handleGuildCreate);
    this.on('guildDelete', handleGuildDelete);
    this.on('message', handleMessageEvent);
    this.on('ready', async () => await handleClientReady(this));
  }
}
