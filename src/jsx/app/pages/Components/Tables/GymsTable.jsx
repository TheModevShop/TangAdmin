var GymsTable = React.createClass({
  componentDidMount: function() {
    $('#gymsTable')
      .dataTable({
        responsive: true
    });
  },
  render: function() {
    return (
     <Grid>
        <Row>
          <Col xs={12}>
            <PanelContainer>
              <Panel>
                <PanelHeader className='bg-darkgreen45 fg-white'>
                  <Grid>
                    <Row>
                      <Col xs={12}>
                        <h1>Gyms</h1>
                        <Button outlined style={{marginBottom: 5}} bsStyle='default'><a href='#/gyms/add-gym'>Add a Gym</a></Button>
                      </Col>
                    </Row>
                  </Grid>
                </PanelHeader>
                <PanelBody>
                  <Grid>
                    <Row>
                      <Col xs={12}>  
                       <Table id='gymsTable' className='display' cellSpacing='0' width='100%'>
                         <thead>
                           <tr>
                             <th>Name</th>
                             <th>Position</th>
                             <th>Office</th>
                             <th>Age</th>
                             <th>Start date</th>
                             <th>Salary</th>
                           </tr>
                         </thead>
                         <tbody>
                           <tr>
                             <td>Tiger Nixon</td>
                             <td>System Architect</td>
                             <td>Edinburgh</td>
                             <td>61</td>
                             <td>2011/04/25</td>
                             <td>$320,800</td>
                           </tr>
                         </tbody>
                       </Table>
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
});

module.exports = GymsTable;