import {Link, State, Navigation} from 'react-router';
import {signIn} from 'actions/authenticationActions';

class SignInForm extends React.Component {
  
  async submitForm(e) {
    e.preventDefault();
    await signIn(e);
  }

  render() {
    return (
      <div style={{padding: 25, paddingTop: 0, paddingBottom: 0, margin: 'auto', marginBottom: 25, marginTop: 25}}>                
        <Form onSubmit={this.submitForm.bind(this)}>
          <FormGroup>
            <InputGroup lg>
              <InputGroupAddon>
                <Icon glyph='icon-fontello-mail' />
              </InputGroupAddon>
              <Input autoFocus type='email' id='emailaddress' className='border-focus-blue' placeholder='support@sketchpixy.com' />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <InputGroup lg>
              <InputGroupAddon>
                <Icon glyph='icon-fontello-key' />
              </InputGroupAddon>
              <Input type='password' id='password' className='border-focus-blue' placeholder='password' />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <Grid>
              <Row>
                <Col xs={6} collapseLeft collapseRight style={{paddingTop: 10}}>
                  <Link to='/app/signup'>Create a Rubix account</Link>
                </Col>
                <Col xs={6} collapseLeft collapseRight className='text-right'>
                  <Button outlined lg type='submit' bsStyle='blue' onClick={this.back}>Login</Button>
                </Col>
              </Row>
            </Grid>
          </FormGroup>
        </Form>    
      </div>       
    );
  }
}

export default SignInForm