import React, { Component } from 'react';
import { Segment, Comment } from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import firebase from '../../firebase';
import Message from './Message';
import { connect } from 'react-redux';
import { setUserPosts } from '../../actions';
import Typing from './Typing';

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
		typingRef: firebase.database().ref('typing'),
		typingUsers: [],
		connectedRef: firebase.database().ref('info/connected'),
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
		this.addTypingListener(channelId);
	};
	addTypingListener = channelId => {
		let typingUsers = [];
		this.state.typingRef.child(channelId).on('child_added', snap => {
			if (snap.key !== this.state.user.uid) {
				typingUsers.concat({
					id: snap.key,
					name: snap.val(),
				});

				this.setState({
					typingUsers,
				});
			}
		});

		this.state.typingRef.child(channelId).on('child_removed', snap => {
			const indexOfRemovedUser = this.state.typingUsers.findIndex(user => user.id === snap.key);
			if (indexOfRemovedUser !== -1) {
				const updatedTypingUsers = this.state.typingUsers.filter(user => {
					return user.id !== snap.key;
				});
				this.setState({
					typingUsers: updatedTypingUsers,
				});
			}
		});

		this.state.connectedRef.on('value', snap => {
			if (snap.val() === true) {
				this.state.typingRef
					.child(channelId)
					.child(this.state.user.uid)
					.onDisconnect()
					.remove(err => {
						if (err !== null) {
							console.error(err);
						}
					});
			}
		});
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
			this.countUserPosts(loadedMessages);
		});
	};

	countUserPosts = messages => {
		let userPosts = messages.reduce((acc, message) => {
			if (message.user.name in acc) {
				acc[message.user.name].count += 1;
			} else {
				acc[message.user.name] = {
					avatar: message.user.avatar,
					count: 1,
				};
			}
			return acc;
		}, {});
		this.props.setUserPosts(userPosts);
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
	componentDidUpdate() {
		if (this.messagesEndRef) {
			this.scrollToBottom();
		}
	}
	scrollToBottom = () => {
		this.messagesEndRef.scrollIntoView({ behavior: 'smooth' });
	};
	displayTyping = typingUsers => {
		if (typingUsers.length > 0) {
			return typingUsers.map(user => (
				<div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.2em' }} key={user.id}>
					<span className="user__typing">{user.name} is typing</span>
					<Typing />
				</div>
			));
		} else {
			return '';
		}
	};
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
			typingUsers,
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
						{this.displayTyping(typingUsers)}
						<div ref={node => (this.messagesEndRef = node)} />
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

export default connect(
	null,
	{ setUserPosts }
)(Messages);
