import React, { Component } from 'react';
import { Header, Segment, Input, Icon } from 'semantic-ui-react';

class MessagesHeader extends Component {
	render() {
		const {
			channelName,
			numUniqueUsers,
			onSearchChange,
			searchLoading,
			isPrivateChannel,
			isStarred,
			handleStar,
		} = this.props;
		const symbol = isPrivateChannel ? '@' : '#';

		return (
			<Segment clearing>
				{/* Channel Title */}
				<Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
					<span>
						{symbol + channelName}{' '}
						{!isPrivateChannel && (
							<Icon
								onClick={handleStar}
								name={isStarred ? 'star' : 'star outline'}
								color={isStarred ? 'yellow' : 'black'}
							/>
						)}
					</span>
					{!isPrivateChannel && (
						<Header.Subheader>{`${numUniqueUsers} user${numUniqueUsers > 1 ? 's' : ''}`}</Header.Subheader>
					)}
				</Header>
				{/* Channel Search Input */}
				<Header floated="right">
					<Input
						size="mini"
						icon="search"
						name="searchTerm"
						placeholder="Search Messages"
						onChange={onSearchChange}
						loading={searchLoading}
					/>
				</Header>
			</Segment>
		);
	}
}

export default MessagesHeader;
