import _ from 'lodash';

export default function paginationSuccessTransformer({replaceItemFunc} = {}) {
  return function(next, current) {
    const items = _.get(current, 'items');
    const offset = _.get(current, 'offset');
    if (next.id) {
      // adding/replacing a single record in the current set
      const exisitingItem = _.find(items, (item) => item.id === next.id);
      if (!exisitingItem) {
        current.items.push(next);
      } else {
        current.items = _.map(items, (item, i) => {
          if (item.id === exisitingItem.id) {
            return _.isFunction(replaceItemFunc) ? replaceItemFunc({next, current: exisitingItem, index: i}) : next;
          }
          return item;
        });
      }
      delete current.stale;
      return current;
    } else if (items && offset) {
      // Adding next page of records
      const newItems = items.concat(next.items);
      if (newItems.length === next.count) {
        next.depleted = true;
      }
      next.items = _.uniq(newItems, (q) => q.id);
      return next;
    } else {
      // Adding first page of records
      return next;
    }
  }
}