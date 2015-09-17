import {branch} from 'baobab-react/higher-order';

import ClassesTable from 'pages/Components/Tables/ClassesTable';

class Classes extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {};
  }

  render() {
    return (
      <ClassesTable />
    );
  }
}

export default branch(Classes, {
  cursors: {
    classes: ['classes']
  }
});
