import React, { Component } from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel } from '../../actions';
import firebase from '../../firebase';

class Starred extends Component {
	state = {
		starredChannels: [],
		user: this.props.currentUser,
		usersRef: firebase.database().ref('users'),
	};

	componentDidMount() {
		if (this.state.user) {
			this.addListeners(this.state.user.uid);
		}
	}
	addListeners = userId => {
		this.state.usersRef
			.child(userId)
			.child('starred')
			.on('child_added', snap => {
				const starredChannel = { id: snap.key, ...snap.val() };
				this.setState({
					starredChannels: [...this.state.starredChannels, starredChannel],
				});
			});

		this.state.usersRef
			.child(userId)
			.child('starred')
			.on('child_removed', snap => {
				const channelToRemove = { id: snap.key, ...snap.val() };
				const filterdChannels = this.state.starredChannels.filter(channel => channel.id !== channelToRemove.id);
				this.setState({
					starredChannels: filterdChannels,
				});
			});
	};
	setCurrentChannel = channel => {
		this.props.setCurrentChannel(channel);
		this.props.setPrivateChannel(false);
	};
	displayChannels = starredChannels => {
		return (
			starredChannels.length > 0 &&
			starredChannels.map(channel => {
				return (
					<Menu.Item
						key={channel.id}
						onClick={this.setCurrentChannel.bind(null, channel)}
						name={channel.name}
						style={{ opacity: 0.7 }}
						active={this.props.channel && this.props.channel.id === channel.id}
					>
						# {channel.name}
					</Menu.Item>
				);
			})
		);
	};
	render() {
		const { starredChannels } = this.state;
		return (
			<Menu.Menu className="menu">
				<Menu.Item>
					<span>
						<Icon name="star" /> FAVORITES
					</span>{' '}
					({starredChannels.length})
				</Menu.Item>
				{this.state.starredChannels.length > 0 && this.displayChannels(starredChannels)}
			</Menu.Menu>
		);
	}
}
const mapStateToProps = state => ({
	channel: state.channels.currentChannel,
});
export default connect(
	mapStateToProps,
	{ setCurrentChannel, setPrivateChannel }
)(Starred);
