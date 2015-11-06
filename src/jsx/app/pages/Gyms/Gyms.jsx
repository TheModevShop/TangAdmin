import {branch} from 'baobab-react/higher-order';
import MainTable from 'pages/Components/Tables/MainTable/MainTable';

class Gyms extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {};
  }

  render() {
    console.log(this.props.name)
    return (
      <div>
        {this.props.name}
       <MainTable MainTableData={this.props.gyms} />
       </div>
    );
  }
}

export default branch(Gyms, {
  cursors: {
    gyms: ['allGyms'],
    name: ['gymProfile', 'name']
  }
});
