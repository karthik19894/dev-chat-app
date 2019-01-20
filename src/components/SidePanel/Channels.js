import React, { Component } from 'react';
import { Menu, Icon, Modal, Form, Input, Button, Label } from 'semantic-ui-react';
import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel } from '../../actions';

class Channels extends Component {
	state = {
		// activeChannel: '',
		channels: [],
		channelName: '0',
		channelDetails: '',
		modal: false,
		channelsRef: firebase.database().ref('channels'),
		firstLoad: true,
		messagesRef: firebase.database().ref('messages'),
		notifications: [],
		typingRef: firebase.database().ref('typing'),
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
			this.addNotificationListener(snap.key);
			this.setState({ firstLoad: false });
		});
	};

	addNotificationListener = channelId => {
		this.state.messagesRef.child(channelId).on('value', snap => {
			if (this.props.channel) {
				this.handleNotifications(channelId, this.props.channel.id, this.state.notifications, snap);
			}
		});
	};

	handleNotifications = (channelId, currentChannelId, notifications, snap) => {
		let lastTotal = 0;
		let index = notifications.findIndex(notification => notification.id === channelId);

		if (index !== -1) {
			if (channelId !== currentChannelId) {
				lastTotal = notifications[index].total;

				if (snap.numChildren() - lastTotal > 0) {
					notifications[index].count = snap.numChildren() - lastTotal;
				}
			}
			notifications[index].lastKnownTotal = snap.numChildren();
		} else {
			notifications.push({
				id: channelId,
				total: snap.numChildren(),
				lastKnownTotal: snap.numChildren(),
				count: 0,
			});
		}

		this.setState({ notifications });
	};

	setActiveChannel = () => {
		const firstChannel = this.state.channels[0];
		if (this.state.firstLoad && this.state.channels.length > 0) {
			this.props.setCurrentChannel(firstChannel);
			this.props.setPrivateChannel(false);
		}
	};
	isFormValid = ({ channelName, channelDetails }) => channelName && channelDetails;

	setCurrentChannel = channel => {
		this.clearNotifications();
		this.props.setCurrentChannel(channel);
		const { currentUser } = this.props;
		const { typingRef } = this.state;
		typingRef
			.child(channel.id)
			.child(currentUser.uid)
			.remove();
		this.props.setPrivateChannel(false);
	};
	clearNotifications = () => {
		let index = this.state.notifications.findIndex(notification => notification.id === this.props.channel.id);
		if (index !== -1) {
			let updatedNotifications = [...this.state.notifications];
			updatedNotifications[index].total = this.state.notifications[index].lastKnownTotal;
			updatedNotifications[index].count = 0;
			this.setState({
				notifications: updatedNotifications,
			});
		}
	};
	getNotificationCount = channel => {
		let count = 0;
		this.state.notifications.forEach(notification => {
			if (notification.id === channel.id) {
				count = notification.count;
			}
		});
		return count > 0 ? count : null;
	};
	displayChannels = channels => {
		return (
			channels.length > 0 &&
			channels.map(channel => {
				const notificationCount = this.getNotificationCount(channel);
				return (
					<Menu.Item
						key={channel.id}
						onClick={this.setCurrentChannel.bind(null, channel)}
						name={channel.name}
						style={{ opacity: 0.7 }}
						active={this.props.channel.id === channel.id}
					>
						{notificationCount && <Label color="red">{notificationCount}</Label>}# {channel.name}
					</Menu.Item>
				);
			})
		);
	};

	render() {
		const { channels, modal } = this.state;
		if (!this.props.channel) {
			return <div>Loading...</div>;
		}
		return (
			<React.Fragment>
				<Menu.Menu className="menu">
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
	{ setCurrentChannel, setPrivateChannel }
)(Channels);
