import { getRepository, Collection } from '../../src';
import { Band as BandEntity } from '../fixture';
import { getUniqueColName } from '../setup';

describe('Integration test: Pagination', () => {
  @Collection(getUniqueColName('band-pagination'))
  class Band extends BandEntity {
    extra?: { website: string };
  }

  test('should do pagination', async () => {
    const bandRepository = getRepository(Band);
    // Create bands
    
    for (let i = 0; i <= 5; i++) {
      const dt = new Band();
      dt.id = `dream-theater-${i}`;
      dt.name = 'DreamTheater';
      dt.formationYear = 1985;
      dt.genres = ['progressive-metal', 'progressive-rock'];
      dt.extra = {
        website: 'www.dreamtheater.net',
      };
      await bandRepository.create(dt);
    }

    // Filter a band by subfield
    const byWebsite = await bandRepository
      .whereEqualTo(a => a.extra.website, 'www.dreamtheater.net')
      .limit(3)
      .find();

    expect(byWebsite.length).toEqual(3);
    expect(byWebsite[0].id).toEqual('dream-theater-0');

    // @ts-ignore
    const cursor: any = byWebsite.cursor;

    // Filter a band by subfield
    const byWebsitePaged = await bandRepository
      .whereEqualTo(a => a.extra.website, 'www.dreamtheater.net')
      .limit(3)
      .after(cursor)
      .find();

      expect(byWebsitePaged[0].id).toEqual('dream-theater-3');

  });
});
