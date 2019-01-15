import React, { Component } from 'react';
import { Segment, Comment } from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import firebase from '../../firebase';
import Message from './Message';

class Messages extends Component {
	state = {
		messagesRef: firebase.database().ref('messages'),
		channel: this.props.currentChannel,
		user: this.props.currentUser,
		messages: [],
		messagesLoading: true,
		numUniqueUsers: 0,
		searchTerm: '',
		searchLoading: false,
		privateMessagesRef: firebase.database().ref('privateMessages'),
		isStarred: false,
		usersRef: firebase.database().ref('users'),
	};
	handleStar = () => {
		this.setState(
			prevState => ({
				isStarred: !prevState.isStarred,
			}),
			() => this.starChannel()
		);
	};
	starChannel = () => {
		if (this.state.isStarred) {
			this.state.usersRef.child(`${this.state.user.uid}/starred`).update({
				[this.state.channel.id]: {
					name: this.state.channel.name,
					details: this.state.channel.details,
					createdBy: this.state.channel.createdBy,
				},
			});
		} else {
			this.state.usersRef
				.child(`${this.state.user.uid}/starred`)
				.child(this.state.channel.id)
				.remove(err => {
					if (err !== null) {
						console.error(err);
					}
				});
		}
	};
	addListeners = channelId => {
		this.addMessageListener(channelId);
	};
	addMessageListener = channelId => {
		const ref = this.getMessagesRef();
		let loadedMessages = [];
		ref.child(channelId).on('child_added', snap => {
			loadedMessages.push(snap.val());
			this.setState({
				messages: loadedMessages,
				messagesLoading: false,
			});
			this.countUniqueUsers(loadedMessages);
		});
	};

	getMessagesRef = () => {
		const { messagesRef, privateMessagesRef } = this.state;
		const { isPrivateChannel } = this.props;
		return isPrivateChannel ? privateMessagesRef : messagesRef;
	};

	countUniqueUsers = messages => {
		const uniqueUsers = messages.reduce((acc, message) => {
			if (!acc.includes(message.user.name)) {
				acc.push(message.user.name);
			}
			return acc;
		}, []);
		const numUniqueUsers = uniqueUsers.length;
		this.setState({
			numUniqueUsers,
		});
	};

	handleSearchChange = event => {
		this.setState(
			{
				searchTerm: event.target.value,
				searchLoading: true,
			},
			this.handleSearchMessages()
		);
	};

	handleSearchMessages = () => {
		const channelMessages = [...this.state.messages];
		const regex = new RegExp(this.state.searchTerm, 'ig');
		const searchResults = channelMessages.filter(message => {
			return (message.content && message.content.match(regex)) || message.user.name.match(regex);
		});
		this.setState({
			searchResults,
		});
		setTimeout(() => this.setState({ searchLoading: false }), 1000);
	};
	addUserStarsListener = (channelId, userId) => {
		this.state.usersRef
			.child(userId)
			.child('starred')
			.once('value')
			.then(data => {
				if (data.val() !== null) {
					const channelIds = Object.keys(data.val());
					const prevStarred = channelIds.includes(channelId);
					this.setState({ isStarred: prevStarred });
				}
			});
	};
	componentDidMount() {
		const { user, channel } = this.state;
		if (user && channel) {
			this.addListeners(channel.id);
			this.addUserStarsListener(channel.id, user.uid);
		}
	}
	render() {
		const {
			channel,
			user,
			messages,
			numUniqueUsers,
			searchTerm,
			searchResults,
			searchLoading,
			isStarred,
		} = this.state;
		const { isPrivateChannel } = this.props;
		return (
			<React.Fragment>
				<MessagesHeader
					channelName={(channel && channel.name) || ''}
					numUniqueUsers={numUniqueUsers}
					onSearchChange={this.handleSearchChange}
					searchLoading={searchLoading}
					isPrivateChannel={isPrivateChannel}
					isStarred={isStarred}
					handleStar={this.handleStar}
				/>
				<Segment>
					<Comment.Group className="messages">
						{searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
					</Comment.Group>
				</Segment>
				<MessageForm
					messagesRef={this.getMessagesRef()}
					currentChannel={channel}
					currentUser={user}
					isPrivateChannel={isPrivateChannel}
				/>
			</React.Fragment>
		);
	}
	displayMessages = messages => {
		return (
			messages.length > 0 &&
			messages.map(message => <Message key={message.timestamp} message={message} user={this.state.user} />)
		);
	};
}

export default Messages;
