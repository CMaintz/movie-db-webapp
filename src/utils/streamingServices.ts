// Well-known streaming services with TMDB provider IDs and logos
// Users add their subscriptions here; these IDs are then used to filter TMDB discover results.
export interface StreamingService {
  id: number;       // TMDB provider_id
  name: string;
  logo: string;     // TMDB logo path (prefix with https://image.tmdb.org/t/p/original)
}

export const KNOWN_STREAMING_SERVICES: StreamingService[] = [
  { id: 8,    name: 'Netflix',         logo: '/t/p/original/9A1JSVmSxsyaBK4SUFsYVqbAYfW.jpg' },
  { id: 9,    name: 'Prime Video',     logo: '/t/p/original/emthp39XA2YScoYL1p0sdbAH2WA.jpg' },
  { id: 337,  name: 'Disney+',         logo: '/t/p/original/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg' },
  { id: 350,  name: 'Apple TV+',       logo: '/t/p/original/2E03IAZsX4ZaUqM7tXlctEPMGWS.jpg' },
  { id: 1899, name: 'Max',             logo: '/t/p/original/Ajqyt5aNxNGjmF9uOfxArGrdf3X.jpg' },
  { id: 15,   name: 'Hulu',            logo: '/t/p/original/zxrVdFjIjLqkfnwyghnfywTn3Lh.jpg' },
  { id: 283,  name: 'Crunchyroll',     logo: '/t/p/original/8Gt1iClBlzTeQs8WQm8UrCoIRnQ.jpg' },
  { id: 386,  name: 'Peacock',         logo: '/t/p/original/8VCV78prwd9QzZnEm0ReO6bERDa.jpg' },
  { id: 2,    name: 'Apple iTunes',    logo: '/t/p/original/ckC3af1GtHUdBYLE8g0UiKXoVh5.jpg' },
  { id: 3,    name: 'Google Play',     logo: '/t/p/original/8z7rC8udjnSTFUI6UCqPm95TOgt.jpg' },
];
