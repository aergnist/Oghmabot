import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { DeityEmbed, OghmabotEmbed } from '../../client';
import { DeityCategory, DeityModel, getDeityCategory, getDeityCategoryName } from '../../data/models';
import { setNegativeReaction, setPositiveReaction, stripCommandNotation } from '../../utils';

export class DeityCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'deity',
      group: 'lore',
      memberName: 'deity',
      description: 'Replies with the details of a deity in the Arelith pantheon.',
      details: 'The command will return one deity based on the given input, assuming it is listed on Arelith\'s Deity Table. Results show aggregated information from the Arelith Wiki, The Forgotten Realms Wiki, and The Forgotten Realms Cormyr Wiki.',
      args: [
        {
          key: 'name',
          type: 'string',
          prompt: 'Specify deity by name.',
          parse: stripCommandNotation,
        },
      ],
      throttling: {
        duration: 10,
        usages: 2,
      },
      examples: [
        '-deity oghma',
      ],
    });
  }

  async run(msg: CommandoMessage, { name }: { name: string }): Promise<Message | null> {
    try {
      const deity = await DeityModel.fetch(name);
      if (deity) {
        setPositiveReaction(msg);
        return msg.embed(new DeityEmbed(deity));
      }

      const category = getDeityCategory(name);
      if (category) {
        setPositiveReaction(msg);
        return msg.embed(await this.getDeitiesOfCategory(category));
      }
    } catch (error) {
      console.error('[DeityCommand] Unexpected error.', error);
    }

    setNegativeReaction(msg);
    return null;
  }

  async getDeitiesOfCategory(cat: DeityCategory): Promise<MessageEmbed> {
    const deities = await DeityModel.getDeities({ where: { arelithCategory: cat } });
    const embed = new OghmabotEmbed();
    embed.setTitle(getDeityCategoryName(cat));
    embed.setDescription(deities.map(d => d.name).join('\n'));
    return embed;
  }
}
