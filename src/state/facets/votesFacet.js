import _ from 'lodash';
import RESTLoader from 'state/loaders/RESTLoader';
import {BASE} from 'constants';

const loader = new RESTLoader({
  getResourceUrl: () => {
    return `${BASE}/site/vote`;
  }
});

export default function votesFacet() {
  return {
    cursors: {
      votes: ['votes']
    },
    get(data) {
      if (data.votes && data.votes.stale) {
        loader.invalidateCache();
      }
      loader.setCursor(this.cursors.votes);
      const votes = _.clone(loader.fetch());
      return votes;
    }
  };
}