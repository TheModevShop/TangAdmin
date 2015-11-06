import _ from 'lodash';

var MainTableRow = React.createClass({
  render: function() {
    const data = this.props.data;
    return (
       <tr>
         <td>Tiger Nixon</td>
         <td>System Architect</td>
         <td>Edinburgh</td>
         <td>61</td>
         <td>2011/04/25</td>
         <td>$320,800</td>
       </tr>
    );
  }
});

module.exports = MainTableRow;