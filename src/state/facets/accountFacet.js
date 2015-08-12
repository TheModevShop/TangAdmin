import _ from 'lodash';
import RESTLoader from 'state/loaders/RESTLoader';
import {BASE} from 'constants';

const loader = new RESTLoader({
  getResourceUrl: (id) => {
    return `${BASE}/email`;
  }
});

export default function accountFacet() {
  return {
    cursors: {
      account: ['account']
    },
    get(data) {
      if (data.account && data.account.stale) {
        loader.invalidateCache();
      }
      if (!loader.cursor) {
        loader.setCursor(this.cursors.account);
      }
      const account = _.clone(loader.fetch());
      return account;
    }
  };
}