import React, { Component } from 'react';
import { Menu, Icon, Modal, Form, Input, Button } from 'semantic-ui-react';
import firebase from '../../firebase';

class Channels extends Component {
	state = {
		channels: [],
		channelName: '0',
		channelDetails: '',
		modal: false,
		channelsRef: firebase.database().ref('channels'),
	};

	closeModal = () => {
		this.setState({
			modal: false,
		});
	};

	openModal = () => {
		this.setState({
			modal: true,
		});
	};

	handleChange = e => {
		this.setState({
			[e.target.name]: e.target.value,
		});
	};
	onSubmit = e => {
		e.preventDefault();
		if (this.isFormValid(this.state)) {
			//Save to channels firebase
			this.addChannel();
		}
	};

	addChannel = () => {
		const { channelName, channelDetails, channelsRef } = this.state;
		const key = channelsRef.push().key;
		const { currentUser } = this.props;

		const newChannel = {
			id: key,
			name: channelName,
			details: channelDetails,
			createdBy: {
				uid: currentUser.uid,
				name: currentUser.name,
				avatar: currentUser.photoUrl,
			},
		};
		channelsRef
			.child(key)
			.update(newChannel)
			.then(createdChannel => {
				this.setState({
					channelName: '',
					channelDetails: '',
				});
				this.closeModal();
			})
			.catch(err => {
				console.error(err);
			});
	};

	isFormValid = ({ channelName, channelDetails }) => channelName && channelDetails;

	render() {
		const { channels, modal } = this.state;
		return (
			<React.Fragment>
				<Menu.Menu style={{ paddingBottom: '2rem' }}>
					<Menu.Item>
						<span>
							<Icon name="exchange" /> CHANNELS
						</span>{' '}
						({channels.length})
						<Icon name="add" onClick={this.openModal} />
					</Menu.Item>
				</Menu.Menu>
				{/* Add channel modal */}
				<Modal open={modal} onClose={this.closeModal}>
					<Modal.Header>Add a Channel</Modal.Header>
					<Modal.Content>
						<Form onSubmit={this.onSubmit}>
							<Form.Field>
								<Input fluid label="Name of Channel" name="channelName" onChange={this.handleChange} />
							</Form.Field>
							<Form.Field>
								<Input
									fluid
									label="Channel Details"
									name="channelDetails"
									onChange={this.handleChange}
								/>
							</Form.Field>
						</Form>
					</Modal.Content>
					<Modal.Actions>
						<Button color="green" inverted onClick={this.onSubmit}>
							<Icon name="checkmark" />
							Add
						</Button>

						<Button color="red" inverted onClick={this.closeModal}>
							<Icon name="remove" />
							Cancel
						</Button>
					</Modal.Actions>
				</Modal>
			</React.Fragment>
		);
	}
}

export default Channels;
