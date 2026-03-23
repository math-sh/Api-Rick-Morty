export interface EpisodeLocation {
  name: string;
  url: string;
}

export interface EpisodeCharacter {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: EpisodeLocation;
  location: EpisodeLocation;
  image: string;
  created: string;
}

export interface Episode {
  id: number;
  name: string;
  air_date: string;
  episode: string;
  characters: EpisodeCharacter[];
  url: string;
  created: string;
}

export interface EpisodeWithCharactersResponse {
  episode: {
    id: number;
    name: string;
    air_date: string;
    episode: string;
    url: string;
    created: string;
  };
  characters: EpisodeCharacter[];
  totalCharacters: number;
}
