var CoachesTable = React.createClass({
  componentDidMount: function() {
    $('#coachesTable').dataTable({responsive: true});
  },
  render: function() {
    return (
      <Grid>
        <Row>
         <Col xs={12}>  
           <Table id='coachesTable' className='display' cellSpacing='0' width='100%'>
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
    );
  }
});

module.exports = CoachesTable;