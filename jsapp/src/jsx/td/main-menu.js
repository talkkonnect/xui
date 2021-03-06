/*
 * HTML5 GUI Framework for FreeSWITCH - XUI
 * Copyright (C) 2015-2017, Seven Du <dujinfang@x-y-t.cn>
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
 * Liyang <liyang@x-y-t.cn>
 *
 * main-menu.js
 *
 */

'use strict';

import React from 'react';
import T from 'i18n-react';
import ReactDOM from 'react-dom';
import { Button, Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { Router, Route, Link, browserHistory } from 'react-router'
import { LinkContainer, IndexLinkContainer } from 'react-router-bootstrap';
import Phone from './phone';
import { VertoPage } from '../verto';

class Notice extends React.Component {
	constructor(props) {
		super(props);
		this.notice = 0;
		this.state = {msg: null};
		this.handleNotification = this.handleNotification.bind(this);
	}

	componentDidMount() {
		window.addEventListener("notification", this.handleNotification);
	}

	componentWillUnmount() {
		window.removeEventListener("notification", this.handleNotification);
	}

	handleNotification(e) {
		console.log("notice", e);
		this.notice++;
		this.setState({msg: e.detail.msg, level: e.detail.level});

		const _this = this;
		const clear_notice = function() {
			if (--_this.notice == 0) _this.setState({msg: null, level: 'none'});
		};

		setTimeout(clear_notice, e.detail.timeout ? e.detail.timeout : 3000);
	}

	render() {
		let class_name = 'none';

		if (this.state.msg) class_name = 'info';
		if (this.state.level == 'error') class_name = 'error';

		return <NavItem><span className={class_name} id='notification'>{this.state.msg ? this.state.msg : ""}</span></NavItem>
	}
}

class MainMenu extends React.Component {
	render() {
		const menus = this.props.menus.map(function(item) {
			var active = false;

			console.log('item', item)

			if (item.data == 'DROPDOWN') {
				console.log('item', item.items)
				const items = (item.items || []).map((i) => {
					return <LinkContainer to={i.data} key={i.id}>
						<MenuItem eventKey={i.id} id={i.id}>{T.translate(i.description)}</MenuItem>
				    </LinkContainer>
				});
				console.log('item', items)

				return <NavDropdown id={item.id} key={item.id} eventKey={item.id} title={T.translate(item.description)}>
					{items}
				</NavDropdown>
			}

			if (item.description == 'Monitor Center') active = true;

			return <LinkContainer to={item.data} key={item.id} onlyActiveOnIndex={active}>
				<NavItem eventKey={item.id}><T.span text={item.description}/></NavItem>
			</LinkContainer>
		});

		const rmenus = this.props.rmenus.map(function(item) {
			return <LinkContainer to={item.data} key={item.id}>
				<NavItem eventKey={item.id}>{T.translate(item.description)}</NavItem>
			</LinkContainer>
		});

       const navbarInstance = (
			<Nav pullRight>
				<NavDropdown id='user_profile' eventKey={3} title={<img src="/assets/img/sit.png" />} noCaret>
					<IndexLinkContainer to="/settings/users/1">
						<MenuItem eventKey={3.1}><T.span text="User Settings"/></MenuItem>
					</IndexLinkContainer>
					<IndexLinkContainer to="/settings/users/password">
						<MenuItem eventKey={3.1}><T.span text="Change Password"/></MenuItem>
					</IndexLinkContainer>
					<MenuItem divider />
					<IndexLinkContainer to="/logout">
						<MenuItem eventKey={3.2}><T.span text="Logout"/></MenuItem>
					</IndexLinkContainer>
				</NavDropdown>
			</Nav>
		);

		const phone = this.props.rmenus.length > 0 ? <Phone /> : null;

		return <Navbar inverse fixedTop staticTop>
			<Navbar.Header>
				<Navbar.Brand>
					<a href="#"><img src="/assets/img/xui.png" style={{height: "24px"}}/></a>
				</Navbar.Brand>
				<Navbar.Toggle />
			</Navbar.Header>
			<Navbar.Collapse>
				<Nav>
					{ menus }
				</Nav>
				{ navbarInstance }
				<Nav pullRight>{ rmenus }</Nav>
				<Nav pullRight>{ phone }</Nav>
				<Nav pullRight><Notice/></Nav>
			</Navbar.Collapse>
			<audio id="ringer" autoPlay="autoplay"/>
			<video id="webcam" className="webcam" autoPlay="autoplay"/>
		</Navbar>;
	}
}

export default MainMenu;
