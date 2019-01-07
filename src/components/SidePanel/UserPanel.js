import React, { Component } from 'react';
import { Grid, Header, Icon, Dropdown, Image } from 'semantic-ui-react';
import firebase from '../../firebase';

class UserPanel extends Component {
	dropdownOptions = () => {
		return [
			{
				key: 'user',
				text: (
					<span>
						Signed in as <strong>{this.props.currentUser.displayName}</strong>
					</span>
				),
				disabled: true,
			},
			{
				key: 'avatar',
				text: <span>Change Avatar</span>,
			},
			{
				key: 'signout',
				text: <span onClick={this.handleSignout}>Sign Out</span>,
			},
		];
	};

	handleSignout = () => {
		firebase
			.auth()
			.signOut()
			.then(() => console.log('user signed out'));
	};
	render() {
		const { currentUser } = this.props;
		return (
			<Grid style={{ background: '#4c3c4c' }}>
				<Grid.Column>
					<Grid.Row style={{ padding: '1.2rem', margin: 0 }}>
						<Header inverted floated="left" as="h2">
							<Icon name="code" />
							<Header.Content as="h6">Disprz Chat</Header.Content>
						</Header>
					</Grid.Row>
					<Header style={{ padding: '0.25em' }} as="h4" inverted>
						<Dropdown
							trigger={
								<span>
									<Image src={currentUser.photoURL} spaced="right" avatar />
									{currentUser.displayName}
								</span>
							}
							options={this.dropdownOptions()}
						/>
					</Header>
				</Grid.Column>
			</Grid>
		);
	}
}

export default UserPanel;
