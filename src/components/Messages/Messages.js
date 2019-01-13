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
	};
	addListeners = channelId => {
		this.addMessageListener(channelId);
	};
	addMessageListener = channelId => {
		let loadedMessages = [];
		this.state.messagesRef.child(channelId).on('child_added', snap => {
			loadedMessages.push(snap.val());
			this.setState({
				messages: loadedMessages,
				messagesLoading: false,
			});
			this.countUniqueUsers(loadedMessages);
		});
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
	componentDidMount() {
		const { user, channel } = this.state;
		if (user && channel) {
			this.addListeners(channel.id);
		}
	}
	render() {
		const { messagesRef, channel, user, messages, numUniqueUsers } = this.state;
		return (
			<React.Fragment>
				<MessagesHeader channelName={(channel && channel.name) || ''} numUniqueUsers={numUniqueUsers} />
				<Segment>
					<Comment.Group className="messages">{this.displayMessages(messages)}</Comment.Group>
				</Segment>
				<MessageForm messagesRef={messagesRef} currentChannel={channel} currentUser={user} />
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
