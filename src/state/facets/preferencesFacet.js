import _ from 'lodash';
import RESTLoader from 'state/loaders/RESTLoader';
import {BASE} from 'constants';

const loader = new RESTLoader({
  getResourceUrl: (id) => {
    return `${BASE}/preferences`;
  }
});

export default function preferencesFacet() {
  return {
    cursors: {
      preferences: ['preferences']
    },
    get(data) {
      if (data.preferences && data.preferences.stale) {
        loader.invalidateCache();
      }
      if (!loader.cursor) {
        loader.setCursor(this.cursors.preferences);
      }
      const preferences = _.clone(loader.fetch());
      return preferences;
    }
  };
}