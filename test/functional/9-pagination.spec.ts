import { DocumentReference } from '@google-cloud/firestore';
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
      dt.formationYear = 1985 + i;
      dt.genres = ['progressive-metal', 'progressive-rock'];
      dt.extra = {
        website: 'www.dreamtheater.net',
      };
      await bandRepository.create(dt);
    }

    // Filter a band by subfield
    const byWebsite = await bandRepository
      .orderByAscending('formationYear')
      .limit(3)
      .find();

    expect(byWebsite.length).toEqual(3);
    expect(byWebsite[0].id).toEqual('dream-theater-0');

    // Filter a band by subfield
    const byWebsitePaged = await bandRepository
      .orderByAscending('formationYear')
      .limit(3)
      .after(byWebsite[byWebsite.length - 1])
      .find();

      console.log(byWebsite[byWebsite.length - 1])
      console.log(byWebsitePaged[0])

      expect(byWebsitePaged[0].id).toEqual('dream-theater-3');

  });
});
