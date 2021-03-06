import { EmbedFieldData } from 'discord.js';
import { Deity, getAlignmentAbbreviation, getAlignmentName } from '../../data/models';
import { getUntilLastWithin, stripParenthesis } from '../../utils';
import { OghmabotEmbed } from './oghmabot.embed';

export class DeityEmbed extends OghmabotEmbed {
  private deity;

  constructor(deity: Deity) {
    super();
    this.deity = deity;

    const { name, titles, arelithWikiUrl, fandomFRThumbnail, fandomFRCormyrThumbnail, fandomTitles, thumbnail, pronunciations } = deity;
    this.setTitle(pronunciations?.length ? `${stripParenthesis(name)} (${pronunciations[0]})` : stripParenthesis(name));
    if (fandomTitles) {
      this.setDescription(`*${fandomTitles.join(', ')}*`);
    } else if (titles) {
      this.setDescription(`*${titles.join(', ')}*`);
    }
    if (arelithWikiUrl) {
      this.setURL(arelithWikiUrl);
    }

    if (thumbnail) {
      this.setThumbnail(thumbnail);
    } else if (fandomFRCormyrThumbnail) {
      this.setThumbnail(fandomFRCormyrThumbnail);
    } else if (fandomFRThumbnail) {
      this.setThumbnail(fandomFRThumbnail);
    }

    this.setFields();
  }

  private setFields() {
    const { alignment, arelithClergyAlignments, powerLevel, arelithAspects, dogma, fandomFRAbstract, fandomFRId, synergies } = this.deity;
    const fields: EmbedFieldData[] = [];

    if (alignment) {
      const value = getAlignmentName(alignment);
      if (value) fields.push({ name: 'Alignment', value, inline: !!(powerLevel || arelithClergyAlignments) });
    }

    if (powerLevel) {
      fields.push({ name: 'Power Level', value: powerLevel, inline: !!alignment });
    }

    if (arelithClergyAlignments?.length) {
      const value = arelithClergyAlignments.sort().map(getAlignmentAbbreviation).join(', ');
      fields.push({
        name: 'Clergy Alignments',
        value,
        inline: !!alignment && !powerLevel,
      });
    }

    if (arelithAspects?.length) {
      const value = arelithAspects.join(', ');
      if (value) fields.push({ name: 'Aspects', value });
    }

    if (synergies?.length) {
      const value = synergies.join(', ');
      if (value) fields.push({ name: 'Synergies', value });
    }

    const infoField = this.getInfoFieldString();
    if (infoField) fields.push({ name: ':book:', value: infoField });

    if (dogma) {
      const value = getUntilLastWithin(dogma, '.', 350);
      if (value) fields.push({ name: 'Dogma', value });
    } else if (fandomFRAbstract) {
      const { IGNORE_FANDOMFR_ABSTRACT } = process.env;
      const ignore = fandomFRId && IGNORE_FANDOMFR_ABSTRACT?.includes(fandomFRId.toString());

      if (!ignore) {
        const value = getUntilLastWithin(fandomFRAbstract, '.', 200);
        if (value) fields.push({ name: 'The Forgotten Realms Wiki', value });
      }
    }

    this.addFields(fields);
  }

  private getInfoFieldString(): string {
    const { symbol, portfolio, worshippers, domains } = this.deity;
    let result = '';
    if (symbol) result += `**Symbol:** ${symbol}\n`;
    if (portfolio?.length) result += `**Portfolio:** ${portfolio.join(', ')}\n`;
    if (worshippers?.length) result += `**Worshippers:** ${worshippers.join(', ')}\n`;
    if (domains?.length) result += `**Domains:** ${domains.join(', ')}\n`;
    return result;
  }
}
