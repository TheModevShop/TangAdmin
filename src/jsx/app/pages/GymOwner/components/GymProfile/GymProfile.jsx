import {branch} from 'baobab-react/higher-order';


class GymProfile extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {};
  }

  render() {
    console.log(this)
    return (
      <div className="profile">
        GYM PROFILE
        <h2>{this.props.gymProfile}</h2>
      </div>
    );
  }
}

export default branch(GymProfile, {
  cursors: {
    gymProfile: ['gymProfile']
  }
});
