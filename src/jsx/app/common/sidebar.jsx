import {
  Sidebar, SidebarNav, SidebarNavItem,
  SidebarControls, SidebarControlBtn
} from 'global/jsx/sidebar_component';

import { Link } from 'react-router';
import LoremIpsum from 'global/jsx/loremipsum';



class ApplicationSidebar extends React.Component {
  render() {
    return (
      <div>
        <Grid>
          <Row>
            <Col xs={12}>
              <div className='sidebar-header'>PAGES</div>
              <div className='sidebar-nav-container'>
                <SidebarNav style={{marginBottom: 0}}>
                  <SidebarNavItem glyph='icon-fontello-gauge' name='Blank' href='/' />
                  <SidebarNavItem glyph='icon-feather-mail' name={<span>Menu <BLabel className='bg-darkgreen45 fg-white'>3</BLabel></span>}>
                    <SidebarNav>
                      <SidebarNavItem glyph='icon-feather-inbox' name='Inbox' />
                      <SidebarNavItem glyph='icon-outlined-mail-open' name='Mail' />
                      <SidebarNavItem glyph='icon-dripicons-message' name='Compose' />
                    </SidebarNav>
                  </SidebarNavItem>
                </SidebarNav>
              </div>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

class DummySidebar extends React.Component {
  render() {
    return (
      <Grid>
        <Row>
          <Col xs={12}>
            <div className='sidebar-header'>DUMMY SIDEBAR</div>
            <LoremIpsum query='1p' />
          </Col>
        </Row>
      </Grid>
    );
  }
}


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
          
        </div>
      </div>
    );
  }
}
