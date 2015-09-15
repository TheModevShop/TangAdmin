import {
  Sidebar, SidebarNav, SidebarNavItem,
  SidebarControls, SidebarControlBtn
} from 'global/jsx/sidebar_component';

import { Link } from 'react-router';
import LoremIpsum from 'global/jsx/loremipsum';



export default class extends React.Component {
  render() {
    return (
      <div id='sidebar' {...this.props}>
        <div id='avatar'>
          <Grid>
            <Row className='fg-white'>
              <Col xs={4} collapseRight>
                <img src='{/images/{this.props.name}' width='40' height='40' />
              </Col>
              <Col xs={8} collapseLeft id='avatar-col'>
                <div style={{top: 23, fontSize: 16, lineHeight: 1, position: 'relative'}}>{this.props.name}</div>
              </Col>
            </Row>
          </Grid>
        </div>
        <div id='sidebar-container'>
          <div className='sidebar-nav-container'>
            <SidebarNav>
              <SidebarNavItem name='Gym Profile' href='/gym-owner/gym-profile' />
              <SidebarNavItem name='Classes' href='/gym-owner/classes' />
              <SidebarNavItem name='Coaches' href='/gym-owner/coaches' />
              <SidebarNavItem name='Transactions' href='/gym-owner/transactions' />
            </SidebarNav>
          </div>
        </div>
      </div>
    );
  }
}
