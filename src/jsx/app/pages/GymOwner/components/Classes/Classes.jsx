import {branch} from 'baobab-react/higher-order';


class Classes extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {};
  }

  componentDidMount() {
    $('#transactionsTable')
      .dataTable({
        responsive: true,
        columnDefs: [
          { targets: [-1, -3], className: 'dt-body-right' }
        ]
    });
  }

  render() {
    return (
        <Grid>
          <Row>
            <Col xs={12}>  
              <Table id='transactionsTable' className='display' cellSpacing='0' width='100%'>
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
                <tfoot>
                  <tr>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Office</th>
                    <th>Age</th>
                    <th>Start date</th>
                    <th>Salary</th>
                  </tr>
                </tfoot>
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
}

export default branch(Classes, {
  cursors: {
    classes: ['classes']
  }
});
