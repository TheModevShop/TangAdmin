import classNames from 'classnames';
import {branch} from 'baobab-react/higher-order';
import { Link, State, Navigation } from 'react-router';

import SignInForm from './components/SignInForm'


class Login extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {};
  }

  render() {
    var classes = classNames({
      'container-open': this.props.open
    });

    return (
      <Grid>
        <Row>
          <Col sm={6}>
            <PanelContainer>
              <Panel>
                
                <SignInForm /> 

              </Panel>
            </PanelContainer>
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default Login;
