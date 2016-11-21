/*
 * HTML5 GUI Framework for FreeSWITCH - XUI
 * Copyright (C) 2015-2016, Seven Du <dujinfang@x-y-t.cn>
 *
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is XUI - GUI for FreeSWITCH
 *
 * The Initial Developer of the Original Code is
 * Seven Du <dujinfang@x-y-t.cn>
 * Portions created by the Initial Developer are Copyright (C)
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Seven Du <dujinfang@x-y-t.cn>
 *
 *
 */

'use strict';

import React from 'react';
import T from 'i18n-react';
import { Modal, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Col } from 'react-bootstrap';

class NewRoute extends React.Component {
	propTypes: {handleNewRouteAdded: React.PropTypes.func}

	constructor(props) {
		super(props);

		this.last_id = 0;

	    // This binding is necessary to make `this` work in the callback
	    this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var route = form2json('#newRouteForm');
		console.log("route", route);

		$.ajax({
			type: "POST",
			url: "/api/routes",
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify(route),
			success: function () {
				_this.last_id++;
				route.id = "NEW" + _this.last_id;
				_this.props["data-handleNewRouteAdded"](route);
			},
			error: function(msg) {
				console.error("route", msg);
			}
		});
	}

	render() {
		console.log(this.props);

		return <Modal {...this.props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Create New Route" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newRouteForm">
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" /></Col>
					<Col sm={10}><FormControl type="input" name="name" placeholder="Name" /></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description" /></Col>
					<Col sm={10}><FormControl type="input" name="description" placeholder="Description" /></Col>
				</FormGroup>

				<FormGroup controlId="fromPrefix">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Prefix" /></Col>
					<Col sm={10}><FormControl type="input" name="prefix" placeholder="Prefix" /></Col>
				</FormGroup>

				<FormGroup controlId="formLength">
					<Col componentClass={ControlLabel} sm={2}><T.span text="length" /></Col>
					<Col sm={10}><FormControl type="input" name="length" placeholder="4" /></Col>
				</FormGroup>

				<FormGroup controlId="formDNC">
					<Col componentClass={ControlLabel} sm={2}><T.span text="DNC" /></Col>
					<Col sm={10}><FormControl type="input" name="dnc" placeholder="DNC" /></Col>
				</FormGroup>

				<FormGroup controlId="formSDNC">
					<Col componentClass={ControlLabel} sm={2}><T.span text="SDNC" /></Col>
					<Col sm={10}><FormControl type="input" name="sdnc" placeholder="SDNC" /></Col>
				</FormGroup>

				<FormGroup controlId="formContext">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Context" /></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="context" placeholder="select">
							<option value="default">default</option>
							<option value="public">public</option>
						</FormControl>
					</Col>
				</FormGroup>

				<FormGroup controlId="formDestType">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Dest Type" /></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="dest_type" placeholder="select">
							<option value="LOCAL">Local User</option>
							<option value="GATEWAY">Gateway</option>
							<option value="IP">IP</option>
							<option value="SYSTEM">System</option>
						</FormControl>
					</Col>
				</FormGroup>

				<FormGroup controlId="formDestUUID">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Dest UUID" /></Col>
					<Col sm={10}><FormControl type="input" name="dest_uuid" placeholder="UUID" /></Col>
				</FormGroup>

				<FormGroup controlId="formBody">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Body" /></Col>
					<Col sm={10}> <FormControl componentClass="textarea" name="body" placeholder="textarea" /></Col>
				</FormGroup>

				<FormGroup>
					<Col smOffset={2} sm={10}><Button type="button" bsStyle="primary" onClick={this.handleSubmit}><T.span text="Save" /></Button></Col>
				</FormGroup>
			</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={this.props.onHide}>Close</Button>
			</Modal.Footer>
		</Modal>;
	}
}

class RoutesPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { formShow: false, rows: []};

	    // This binding is necessary to make `this` work in the callback
	    this.handleControlClick = this.handleControlClick.bind(this);
	    this.handleDelete = this.handleDelete.bind(this);
	}

	handleControlClick(e) {
		var data = e.target.getAttribute("data");
		console.log("data", data);

		if (data == "new") {
			this.setState({ formShow: true});
		}
	}

	handleDelete(e) {
		var id = e.target.getAttribute("data-id");
		console.log("deleting id", id);
		var _this = this;

		$.ajax({
			type: "DELETE",
			url: "/api/routes/" + id,
			success: function () {
				console.log("deleted")
				var rows = _this.state.rows.filter(function(row) {
					return row.id != id;
				});

				_this.setState({rows: rows});
			},
			error: function(msg) {
				console.error("route", msg);
			}
		});
	}

	handleClick(x) {
	}

	componentWillMount() {
	}

	componentWillUnmount() {
	}

	componentDidMount() {
		var _this = this;
		$.getJSON("/api/routes", "", function(data) {
			_this.setState({rows: data});
		}, function(e) {
			console.log("list_users ERR");
		});
	}

	handleFSEvent(v, e) {
	}

	handleRouteAdded(route) {
		var rows = this.state.rows;
		rows.push(route);
		this.setState({rows: rows, formShow: false});
    }

	render() {
	    let formClose = () => this.setState({ formShow: false });
	    var _this = this;

		var rows = this.state.rows.map(function(row) {
			return <tr key={row.id}>
					<td>{row.id}</td>
					<td>{row.context}</td>
					<td>{row.name}</td>
					<td>{row.prefix}</td>
					<td>{row.dest_type}</td>
					<td>{row.dest}</td>
					<td><T.a href='#' onClick={_this.handleDelete} data-id={row.id} text="Delete" /></td>
			</tr>;
		})

		return <div>
			<div className="controls">
				<T.button onClick={this.handleControlClick} data="new" text="New" />
			</div>

			<h1><T.span text="Routes" /></h1>

			<div>
				<table className="table">
				<tbody>
				<tr>
					<th>ID</th>
					<th><T.span text="Context" /></th>
					<th><T.span text="Name" /></th>
					<th><T.span text="Prefix" /></th>
					<th><T.span text="Dest Type" /></th>
					<th><T.span text="Dest" /></th>
					<th>*</th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>

			<NewRoute show={this.state.formShow} onHide={formClose} data-handleNewRouteAdded={this.handleRouteAdded.bind(this)}/>
		</div>
	}
}

export default RoutesPage;
