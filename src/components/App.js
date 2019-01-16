import React from 'react';
import './App.css';
import { Grid } from 'semantic-ui-react';
import ColorPanel from './ColorPanel/ColorPanel';
import MetaPanel from './MetaPanel/MetaPanel';
import SidePanel from './SidePanel/SidePanel';
import Messages from './Messages/Messages';
import { connect } from 'react-redux';

const App = ({ currentUser, currentChannel, isPrivateChannel, userPosts, primaryColor, secondaryColor }) => {
	return (
		<Grid columns="equal" className="app" style={{ background: secondaryColor }}>
			<ColorPanel key={currentUser && currentUser.name} currentUser={currentUser} />
			<SidePanel key={currentUser && currentUser.uid} currentUser={currentUser} primaryColor={primaryColor} />
			<Grid.Column style={{ marginLeft: 320 }}>
				<Messages
					key={currentChannel && currentChannel.id}
					currentChannel={currentChannel}
					currentUser={currentUser}
					isPrivateChannel={isPrivateChannel}
				/>
			</Grid.Column>
			<Grid.Column width="4">
				<MetaPanel currentChannel={currentChannel} isPrivateChannel={isPrivateChannel} userPosts={userPosts} />
			</Grid.Column>
		</Grid>
	);
};

const mapStateToProps = state => ({
	currentUser: state.user.currentUser,
	currentChannel: state.channels.currentChannel,
	isPrivateChannel: state.channels.isPrivateChannel,
	userPosts: state.channels.userPosts,
	primaryColor: state.colors.primaryColor,
	secondaryColor: state.colors.secondaryColor,
});
export default connect(mapStateToProps)(App);
