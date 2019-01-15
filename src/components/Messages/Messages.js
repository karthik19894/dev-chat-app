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
	componentDidMount() {
		const { user, channel } = this.state;
		if (user && channel) {
			this.addListeners(channel.id);
		}
	}
	render() {
		const {
			messagesRef,
			channel,
			user,
			messages,
			numUniqueUsers,
			searchTerm,
			searchResults,
			searchLoading,
		} = this.state;
		return (
			<React.Fragment>
				<MessagesHeader
					channelName={(channel && channel.name) || ''}
					numUniqueUsers={numUniqueUsers}
					onSearchChange={this.handleSearchChange}
					searchLoading={searchLoading}
				/>
				<Segment>
					<Comment.Group className="messages">
						{searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
					</Comment.Group>
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
