import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { DeityEmbed, OghmabotEmbed } from '../../client';
import { SequelizeProvider } from '../../client/settings';
import { DeityCategory, DeityModel, getDeityCategory, getDeityCategoryName, MessageExpiryModel } from '../../data/models';
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
      const embed = await this.getResultEmbed(name);
      if (embed) {
        const embedMsg = await msg.embed(embed);
        await setPositiveReaction(msg);
        await this.setToExpire(embedMsg);
        return embedMsg;
      }
    } catch (error) {
      console.error('[DeityCommand] Unexpected error.', error);
    }

    setNegativeReaction(msg);
    return null;
  }

  private async getResultEmbed(query: string): Promise<MessageEmbed | undefined> {
    const deity = await DeityModel.fetch(query);
    if (deity) return new DeityEmbed(deity);

    const category = getDeityCategory(query);
    if (category) return await this.getDeitiesOfCategory(category);
  }

  private async getDeitiesOfCategory(cat: DeityCategory): Promise<MessageEmbed> {
    const deities = await DeityModel.getDeities({ where: { arelithCategory: cat } });
    const embed = new OghmabotEmbed();
    embed.setTitle(getDeityCategoryName(cat));
    embed.setDescription(deities.map(d => d.name).join('\n'));
    return embed;
  }

  private async setToExpire(msg: CommandoMessage): Promise<void> {
    const provider = this.client.provider as SequelizeProvider;
    const expiry = provider.getForChannel(msg.channel, `expire-${this.name}`) ?? provider.get(msg.guild, 'expire-all');
    if (expiry && typeof expiry === 'number') await MessageExpiryModel.setExpiry(msg, new Date(Date.now() + expiry));
  }
}
