import { MessageEmbed } from 'discord.js';
import { convertMillisecondsToTimestamp, calculateTimeBetween, nowUnixTime } from './time';
import { Server, Status, StatusColors } from '../data/models';

export const getOghmabotEmbed = (timestamp: boolean = true, icon: boolean = true): MessageEmbed => {
  const { OGHMABOT_ICON_URL } = process.env;
  const embed = new MessageEmbed();
  if (timestamp) embed.setTimestamp();
  if (icon && OGHMABOT_ICON_URL) embed.setFooter('Oghmabot', OGHMABOT_ICON_URL);
  return embed;
};

export const serverStatusToEmbed = (server: Server, status: Status): MessageEmbed => {
  const state = status.online ? status.passworded ? 'Stabilizing' : 'Online' : 'Offline';
  const embed = getOghmabotEmbed();
  embed.setTimestamp();
  embed.setTitle(server.name);
  embed.setColor(StatusColors[state.toLowerCase()]);
  embed.setDescription(status.online
    ? `**${state}** :hourglass: ${new Date(status.uptime).toISOString().substr(11, 8)} :busts_in_silhouette: ${status.players}`
    : `**${state}** :hourglass: ${status.lastSeen && convertMillisecondsToTimestamp(calculateTimeBetween(status.lastSeen, nowUnixTime()))}`,
  );
  if (server.img) embed.setThumbnail(server.img);
  if (server.href) embed.setURL(server.href);
  return embed;
};

export const serverStatusToStatusUpdateEmbed = (server: Server, status: Status): MessageEmbed => {
  const state = status.online ? status.passworded ? 'restarting' : 'online' : 'offline';
  const embed = getOghmabotEmbed();
  embed.setTitle(`${server.name} is now ${state}.`);
  embed.setColor(StatusColors[state]);
  if (server.img) embed.setThumbnail(server.img);
  return embed;
};
