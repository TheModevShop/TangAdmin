import _ from 'lodash';
import RESTLoader from '../loaders/RESTLoader';
import {BASE} from 'constants';

const loader = new RESTLoader({
  getResourceUrl: (id) => {
    return `${BASE}/gyms`;
  },
  successTransformer: (data) => {
    return {
      allGyms: data.body
    };
  },
  errorTransformer: (err) => {
    return {
      sessions: [],
      error: err
    };
  }
});

export default function LocationScheduleFacet() {
  return {
    cursors: {
      gyms: ['views', 'GymList'],
    },
    get(data) {
      if (data.gyms && data.gyms.stale) {
        loader.invalidateCache();
      }
      if (!loader.cursor) {
        loader.setCursor(this.cursors.gyms);
      }
      const gyms = _.clone(loader.fetch());
      return gyms
    }
  };
};

