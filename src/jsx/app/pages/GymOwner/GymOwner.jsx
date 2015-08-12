import classNames from 'classnames';
import {branch} from 'baobab-react/higher-order';

import Header from 'common/header';
import Sidebar from 'common/sidebar';
import Footer from 'common/footer';


class GymOwner extends React.Component {
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
          <Col sm={12}>
            <PanelContainer>
              <Panel>
                <PanelBody>
                  {this.props.children}
                </PanelBody>
              </Panel>
            </PanelContainer>
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default branch(GymOwner, {
  cursors: {
    names: 'names'
  }
});
