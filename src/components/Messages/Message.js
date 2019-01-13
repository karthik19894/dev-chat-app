import React from 'react';
import { Comment, Image } from 'semantic-ui-react';
import moment from 'moment';

const isOwnMessage = (message, user) => {
	return message.user.id === user.uid ? 'message__self' : '';
};

const timeFromNow = timestamp => {
	return moment(timestamp).fromNow();
};
const isImage = message => {
	return message.hasOwnProperty('image');
};
const Message = ({ message, user }) => {
	return (
		<Comment>
			<Comment.Avatar src={message.user.avatar} />
			<Comment.Content className={isOwnMessage(message, user)}>
				<Comment.Author as="a">{message.user.name}</Comment.Author>
				<Comment.Metadata>{timeFromNow(message.timestamp)}</Comment.Metadata>
				{isImage(message) ? (
					<a href={message.image} target="_blank">
						<Image src={message.image} className="message__image" />
					</a>
				) : (
					<Comment.Text>{message.content}</Comment.Text>
				)}
			</Comment.Content>
		</Comment>
	);
};

export default Message;