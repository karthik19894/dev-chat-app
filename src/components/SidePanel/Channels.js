import React, { Component } from 'react';
import { Menu, Icon, Modal, Form, Input, Button } from 'semantic-ui-react';
import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setCurrentChannel } from '../../actions';

class Channels extends Component {
	state = {
		// activeChannel: '',
		channels: [],
		channelName: '0',
		channelDetails: '',
		modal: false,
		channelsRef: firebase.database().ref('channels'),
		firstLoad: true,
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
				name: currentUser.displayName,
				avatar: currentUser.photoURL,
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

	componentDidMount() {
		this.addListeners();
	}

	componentWillUnmount() {
		this.removeListeners();
	}

	removeListeners = () => {
		this.state.channelsRef.off();
	};

	addListeners = () => {
		let loadedChannels = [];
		this.state.channelsRef.on('child_added', snap => {
			loadedChannels.push(snap.val());
			this.setState(
				{
					channels: loadedChannels,
				},
				() => this.setActiveChannel()
			);
			this.setState({ firstLoad: false });
		});
	};

	setActiveChannel = () => {
		const firstChannel = this.state.channels[0];
		if (this.state.firstLoad && this.state.channels.length > 0) {
			// this.setState({
			// 	activeChannel: firstChannel,
			// });
			this.props.setCurrentChannel(firstChannel);
		}
	};
	isFormValid = ({ channelName, channelDetails }) => channelName && channelDetails;

	setCurrentChannel = channel => {
		this.props.setCurrentChannel(channel);
		// this.setState({
		// 	activeChannel: channel,
		// });
	};
	displayChannels = channels => {
		return (
			channels.length > 0 &&
			channels.map(channel => (
				<Menu.Item
					key={channel.id}
					onClick={this.setCurrentChannel.bind(null, channel)}
					name={channel.name}
					style={{ opacity: 0.7 }}
					active={this.props.channel.id === channel.id}
				>
					# {channel.name}
				</Menu.Item>
			))
		);
	};

	render() {
		const { channels, modal } = this.state;
		if (!this.props.channel) {
			return <div>Loading...</div>;
		}
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
					{this.state.channels.length > 0 && this.displayChannels(channels)}
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

const mapStateToProps = state => ({
	channel: state.channels.currentChannel,
});
export default connect(
	mapStateToProps,
	{ setCurrentChannel }
)(Channels);
