import {branch} from 'baobab-react/higher-order';

import TransactionsTable from 'pages/Components/Tables/TransactionsTable';


class Transactions extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {};
  }
  render() {
    return (
        <TransactionsTable />
    );
  }
}
export default branch(Transactions, {
  cursors: {
    transactions: ['transactions']
  }
});
