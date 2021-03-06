import fetch, { Response } from 'node-fetch';
import { isValidBeamdogDbKey, isValidIPAndPort } from '../../../utils';

export interface BeamdogMapper<M> {
  fromBeamdogApiResponseBody(response: BeamdogApiResponseBody): M;
}

export interface BeamdogApiResponseBody {
  first_seen: number;
  last_advertisement: number;
  session_name: string;
  module_name: string;
  passworded: boolean;
  current_players: number;
  max_players: number;
  latency: number;
  host: string;
  port: number;
  kx_pk: string;
}

export class BeamdogApiError extends Error {
  code: number;
  response: Response;

  constructor(response: Response, message?: string) {
    super(message);
    this.name = 'BeamdogApiError';
    this.code = response.status;
    this.response = response;
  }
}

export class BeamdogApiProxy {
  static async fetchServer(identifier: string): Promise<BeamdogApiResponseBody>;
  static async fetchServer<M>(identifier: string, mapper: BeamdogMapper<M>): Promise<M>;
  static async fetchServer<M>(identifier: string, mapper?: BeamdogMapper<M>): Promise<BeamdogApiResponseBody | M> {
    const { BEAMDOG_NWN_API } = process.env;
    const url = `${BEAMDOG_NWN_API}${(isValidBeamdogDbKey(identifier) && identifier) || (isValidIPAndPort(identifier) && identifier.replace(':', '/'))}`;

    const response = await fetch(url);
    if (response.status !== 200) throw new BeamdogApiError(response, await response.text());

    const json: BeamdogApiResponseBody = await response.json();
    return mapper
      ? mapper.fromBeamdogApiResponseBody(json)
      : json;
  }
}
