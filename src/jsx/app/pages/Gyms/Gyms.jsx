import {branch} from 'baobab-react/higher-order';

import GymsTable from 'pages/Components/Tables/GymsTable';

class Gyms extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {};
  }

  render() {
    return (
       <GymsTable />
    );
  }
}

export default branch(Gyms, {
  cursors: {
    gyms: ['gyms']
  }
});
