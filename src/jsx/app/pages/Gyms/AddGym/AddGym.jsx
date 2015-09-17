import {branch} from 'baobab-react/higher-order';

class AddGym extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {};
  }

  render() {
    return (
      <Grid>
        <Row>
          <Col xs={8} mdOffset={2}>
            <PanelContainer noOverflow controlStyles='bg-green fg-white'>
              <Panel>
                <PanelHeader className='bg-green fg-white'>
                  <Grid>
                    <Row>
                      <Col xs={12}>
                        <h1>Add A Gym</h1>
                      </Col>
                    </Row>
                  </Grid>
                </PanelHeader>
                <PanelBody>
                  <Grid>
                    <Row>
                      <Col xs={12}>
                        <Form>
                          <FormGroup>
                            <Label htmlFor='gymName' control>Gym Name</Label>
                            <Input id='gymName' type="text" placeholder='Gym Name' />
                          </FormGroup>
                          <FormGroup>
                            <Label htmlFor='gymDescription' control>Gym Description</Label>
                            <Textarea id='gymDescription' rows="5" placeholder='Gym Description' />
                          </FormGroup>
                          <FormGroup>
                            <Label htmlFor='gymPhone' control>Gym Phone</Label>
                            <Input id='gymPhone' type="text" placeholder='Gym Phone' />
                          </FormGroup>
                          <FormGroup>
                            <Label htmlFor='gymSite' control>Gym Site</Label>
                            <Input id='gymSite' type="text" placeholder='Gym Site' />
                          </FormGroup>
                          <FormGroup>
                            <Label control>Gym Address</Label>
                            <Grid>
                              <Row>
                                <Col xs={6} collapseLeft collapseRight>
                                  <Input id='addressOne' type="text" placeholder='Address Line 1' />
                                </Col>
                                <Col xs={6}  collapseRight>
                                  <Input id='addressTwo' type="text" placeholder='Address Line 2' />
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={4} collapseLeft collapseRight >
                                  <Input id='City' type="text" placeholder='City' />
                                </Col>
                                <Col xs={4}  collapseRight>
                                  <Input id='State' type="text" placeholder='State' />
                                </Col>
                                <Col xs={4}  collapseRight>
                                  <Input id='Zip' type="text" placeholder='Zip' />
                                </Col>
                              </Row>
                            </Grid>
                          </FormGroup>
                        </Form>
                      </Col>
                    </Row>
                  </Grid>
                </PanelBody>
                <PanelFooter className='bg-purple text-right'>
                  <Grid>
                    <Row>
                      <Col xs={12}>
                        <br/>
                        <div>
                          <Button outlined bsStyle='lightpurple'>submit</Button>
                        </div>
                        <br/>
                      </Col>
                    </Row>
                  </Grid>
                </PanelFooter>
              </Panel>
            </PanelContainer>
         </Col>
        </Row>
      </Grid>
    );
  }
}

export default branch(AddGym, {
  cursors: {
    addGym: ['addGym']
  }
});
