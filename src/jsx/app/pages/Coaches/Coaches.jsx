import {branch} from 'baobab-react/higher-order';

import CoachesTable from 'pages/Components/Tables/CoachesTable';

class Coaches extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {};
  }

  render() {
    return (
       <CoachesTable />
    );
  }
}

export default branch(Coaches, {
  cursors: {
    coaches: ['coaches']
  }
});
