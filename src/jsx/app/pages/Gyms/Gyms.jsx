import {branch} from 'baobab-react/higher-order';
import MainTable from 'pages/Components/Tables/MainTable/MainTable';
import _ from 'lodash';

class Gyms extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {};
  }

  render() {
    const gyms = _.get(this.props, 'gyms.allGyms');
    return (
      <div>
        {this.props.name}
        {
          gyms ?
          <MainTable gymList={gyms} /> : null
        }
       </div>
    );
  }
}

export default branch(Gyms, {
  cursors: {
    name: ['Some Name'],
  },
  facets: {
    gyms: 'Gyms'
  }
});
