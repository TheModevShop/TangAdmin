import _ from 'lodash';
import RESTLoader from 'state/loaders/RESTLoader';
import paginationSuccessTransformer from 'state/loaders/utility/paginationSuccessTransformer';
import {BASE} from 'constants';

const PAGE_SIZE = 10;

const loader = new RESTLoader({
  getResourceUrl: (id, pageSize, offset) => {
    if (id) {
      return `${BASE}/quote/${id}`;
    } else if (pageSize !== undefined && offset !== undefined) {
      return `${BASE}/quote?$page_size=${pageSize}&$offset=${offset}`;
    } else {
      return `${BASE}/quote`;
    }
  },
  successTransformer: paginationSuccessTransformer()
});

export default function quoteListFacet() {
  return {
    cursors: {
      quotes: ['quotes'],
      removedQuotes: ['removedQuotes']
    },
    get(data) {
      if (!loader.cursor) {
        loader.setCursor(this.cursors.quotes);
      }
      if (data.quotes && data.quotes.stale) {
        loader.invalidateCache();
      }
      // If `stale` is set to a string, it assumes it to be the {id}
      // of a stale record to be replaced. If it's `true` it assumes
      // the staleness to be on the current page
      const fetchArgs = typeof data.quotes.stale === 'string' ?
        [data.quotes.stale] :
        [null, PAGE_SIZE, data.quotes.offset || 0];
      const loadedData = _.clone(loader.fetch(...fetchArgs));
      const allItems = (data.removedQuotes || []).concat(loadedData.items || []);
      loadedData.items = _(allItems)
        .uniq((q) => q.id)
        .sortBy((quote) => {
          return -(new Date(quote.created_at).getTime());
        })
        .value();
      return loadedData;
    }
  };
}