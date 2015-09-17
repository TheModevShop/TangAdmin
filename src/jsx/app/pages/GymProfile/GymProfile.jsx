import {branch} from 'baobab-react/higher-order';

class GymProfile extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {};
  }

  componentDidMount() {
    this.renderEditable();
  }

  toggleEditable() {
    $('#user .editable').editable('toggleDisabled');
  }

  handleModeChange(mode, e) {
    e.stopPropagation();
    this.setState(this.renderEditable);
  }

  renderEditable() {


    $('.text-field').editable({
      mode: 'inline',
      validate: function(value) {
        if($.trim(value) == '') return 'This field is required';
      }
    });

    $('.gym-description').editable({
      mode: 'inline',
      showbuttons: 'bottom'
    });

    $('.state-field').editable({
      mode: 'inline',
      value: 'California',
      typeahead: {
        name: 'state',
        local: ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Dakota','North Carolina','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming']
      }
    });
  }

  render() {
    return (
        <Grid>
          <Row>
            <Col xs={12}>
              <PanelContainer>
                <Panel>
                  <PanelHeader className='bg-darkgreen45 fg-white' style={{margin: 0}}>
                    <Grid>
                      <Row>
                        <Col xs={12}>
                          <h1>Gym Profile</h1>
                        </Col>
                      </Row>
                    </Grid>
                  </PanelHeader>
                  <PanelBody>
                    <Grid>
                      <Row>
                        <Col xs={12}>
                          <form>
                            <img className="xeditable gym-profile-img" src={"images/" + this.props.gymProfile.profileImg} />
                            <h2 className="xeditable text-field" data-type='text'>{this.props.gymProfile.name}</h2>
                            <a href={this.props.gymProfile.link} target="_blank">{this.props.gymProfile.link}</a>
                            <div className="xeditable gym-phone text-field" data-type='text'>{this.props.gymProfile.phone}</div>
                            <p className="xeditable gym-description" data-type='textarea'>{this.props.gymProfile.description}</p>
                            <ul className="xeditable gym-images">
                              {this.props.gymProfile.images.map(function(image) {
                                return (
                                  <li>
                                      <img src={image.url}/>
                                  </li>
                                );
                              })}
                            </ul>
                            <div className="xeditable gym-address">
                              <span className="xeditable text-field" data-type='text'>{this.props.gymProfile.address.line1}</span>
                              <span className="xeditable text-field" data-type='text'>{this.props.gymProfile.address.line2}</span>
                              <span className="xeditable text-field" data-type='text'>{this.props.gymProfile.address.city}</span>
                              <span className="xeditable state-field" data-type='typeaheadjs'>{this.props.gymProfile.address.state}</span>
                              <span className="xeditable text-field" data-type='text'>{this.props.gymProfile.address.zip}</span>
                            </div>
                          </form>
                        </Col>
                      </Row>
                    </Grid>
                  </PanelBody>
                </Panel>
              </PanelContainer>
            </Col>
          </Row>
        </Grid>
    );
  }

}

export default branch(GymProfile, {
  cursors: {
    gymProfile: ['gymProfile']
  }
});
