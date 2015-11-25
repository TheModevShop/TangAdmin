exports.ids = [9];
exports.modules = {

/***/ 417:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _get = __webpack_require__(177)['default'];

	var _inherits = __webpack_require__(191)['default'];

	var _createClass = __webpack_require__(202)['default'];

	var _classCallCheck = __webpack_require__(205)['default'];

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _baobabReactHigherOrder = __webpack_require__(232);

	var AddGym = (function (_React$Component) {
	  _inherits(AddGym, _React$Component);

	  function AddGym() {
	    _classCallCheck(this, AddGym);

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _get(Object.getPrototypeOf(AddGym.prototype), 'constructor', this).apply(this, args);
	    this.state = {};
	  }

	  _createClass(AddGym, [{
	    key: 'render',
	    value: function render() {
	      return React.createElement(
	        Grid,
	        null,
	        React.createElement(
	          Row,
	          null,
	          React.createElement(
	            Col,
	            { xs: 12, xsOffset: 0, sm: 10, smOffset: 1, md: 8, mdOffset: 2 },
	            React.createElement(
	              PanelContainer,
	              { noOverflow: true, controlStyles: 'bg-green fg-white' },
	              React.createElement(
	                Panel,
	                null,
	                React.createElement(
	                  PanelHeader,
	                  { className: 'bg-green fg-white' },
	                  React.createElement(
	                    Grid,
	                    null,
	                    React.createElement(
	                      Row,
	                      null,
	                      React.createElement(
	                        Col,
	                        { xs: 12 },
	                        React.createElement(
	                          'h1',
	                          null,
	                          'Add A Gym'
	                        )
	                      )
	                    )
	                  )
	                ),
	                React.createElement(
	                  PanelBody,
	                  null,
	                  React.createElement(
	                    Grid,
	                    null,
	                    React.createElement(
	                      Row,
	                      null,
	                      React.createElement(
	                        Col,
	                        { xs: 12 },
	                        React.createElement(
	                          Form,
	                          null,
	                          React.createElement(
	                            FormGroup,
	                            null,
	                            React.createElement(
	                              Label,
	                              { htmlFor: 'gymName', control: true },
	                              'Gym Name'
	                            ),
	                            React.createElement(Input, { id: 'gymName', type: 'text', placeholder: 'Gym Name' })
	                          ),
	                          React.createElement(
	                            FormGroup,
	                            null,
	                            React.createElement(
	                              Label,
	                              { htmlFor: 'gymDescription', control: true },
	                              'Gym Description'
	                            ),
	                            React.createElement(Textarea, { id: 'gymDescription', rows: '5', placeholder: 'Gym Description' })
	                          ),
	                          React.createElement(
	                            FormGroup,
	                            null,
	                            React.createElement(
	                              Label,
	                              { htmlFor: 'gymPhone', control: true },
	                              'Gym Phone'
	                            ),
	                            React.createElement(Input, { id: 'gymPhone', type: 'text', placeholder: 'Gym Phone' })
	                          ),
	                          React.createElement(
	                            FormGroup,
	                            null,
	                            React.createElement(
	                              Label,
	                              { htmlFor: 'gymSite', control: true },
	                              'Gym Site'
	                            ),
	                            React.createElement(Input, { id: 'gymSite', type: 'text', placeholder: 'Gym Site' })
	                          ),
	                          React.createElement(
	                            FormGroup,
	                            null,
	                            React.createElement(
	                              Label,
	                              { control: true },
	                              'Gym Address'
	                            ),
	                            React.createElement(
	                              Grid,
	                              null,
	                              React.createElement(
	                                Row,
	                                null,
	                                React.createElement(
	                                  Col,
	                                  { xs: 6, collapseLeft: true, collapseRight: true },
	                                  React.createElement(Input, { id: 'addressOne', type: 'text', placeholder: 'Address Line 1' })
	                                ),
	                                React.createElement(
	                                  Col,
	                                  { xs: 6, collapseRight: true },
	                                  React.createElement(Input, { id: 'addressTwo', type: 'text', placeholder: 'Address Line 2' })
	                                )
	                              ),
	                              React.createElement(
	                                Row,
	                                null,
	                                React.createElement(
	                                  Col,
	                                  { xs: 4, collapseLeft: true, collapseRight: true },
	                                  React.createElement(Input, { id: 'City', type: 'text', placeholder: 'City' })
	                                ),
	                                React.createElement(
	                                  Col,
	                                  { xs: 4, collapseRight: true },
	                                  React.createElement(Input, { id: 'State', type: 'text', placeholder: 'State' })
	                                ),
	                                React.createElement(
	                                  Col,
	                                  { xs: 4, collapseRight: true },
	                                  React.createElement(Input, { id: 'Zip', type: 'text', placeholder: 'Zip' })
	                                )
	                              )
	                            )
	                          )
	                        )
	                      )
	                    )
	                  )
	                ),
	                React.createElement(
	                  PanelFooter,
	                  { className: 'bg-purple text-right' },
	                  React.createElement(
	                    Grid,
	                    null,
	                    React.createElement(
	                      Row,
	                      null,
	                      React.createElement(
	                        Col,
	                        { xs: 12 },
	                        React.createElement('br', null),
	                        React.createElement(
	                          'div',
	                          null,
	                          React.createElement(
	                            Button,
	                            { outlined: true, bsStyle: 'lightpurple' },
	                            'submit'
	                          )
	                        ),
	                        React.createElement('br', null)
	                      )
	                    )
	                  )
	                )
	              )
	            )
	          )
	        )
	      );
	    }
	  }]);

	  return AddGym;
	})(React.Component);

	exports['default'] = (0, _baobabReactHigherOrder.branch)(AddGym, {
	  cursors: {
	    addGym: ['views', 'AddGym']
	  }
	});
	module.exports = exports['default'];

/***/ }

};;