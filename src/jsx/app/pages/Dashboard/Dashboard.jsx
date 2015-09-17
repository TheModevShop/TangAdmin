import {branch} from 'baobab-react/higher-order';

class Dashboard extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {};
  }
  render() {
    return (
        <Grid>
          <Row>
           
          </Row>
        </Grid>
    );
  }
}
export default branch(Dashboard, {
  cursors: {
    dashboard: ['dashboard']
  }
});
