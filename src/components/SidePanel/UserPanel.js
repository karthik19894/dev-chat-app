import React, { Component } from 'react';
import { Grid, Header, Icon, Dropdown, Image, Modal, Input, Button } from 'semantic-ui-react';
import firebase from '../../firebase';
import AvatarEditor from 'react-avatar-editor';

class UserPanel extends Component {
	state = {
		modal: false,
		previewImage: '',
		croppedImage: '',
		blob: '',
		storageRef: firebase.storage().ref(),
		userRef: firebase.auth().currentUser,
		usersRef: firebase.database().ref('users'),
		metadata: {
			contentType: 'image/jpeg',
		},
		uploadedCroppedImage: '',
	};

	openModal = () => {
		this.setState({
			modal: true,
		});
	};

	closeModal = () => {
		this.setState({
			modal: false,
		});
	};
	dropdownOptions = () => {
		return [
			{
				key: 'user',
				text: (
					<span>
						Signed in as <strong>{this.props.currentUser.displayName}</strong>
					</span>
				),
				disabled: true,
			},
			{
				key: 'avatar',
				text: <span onClick={this.openModal}>Change Avatar</span>,
			},
			{
				key: 'signout',
				text: <span onClick={this.handleSignout}>Sign Out</span>,
			},
		];
	};

	handleChange = event => {
		const file = event.target.files[0];
		const reader = new FileReader();

		if (file) {
			reader.readAsDataURL(file);
			reader.onload = () =>
				this.setState({
					previewImage: reader.result,
				});
		}
	};

	handleCropImage = () => {
		if (this.avatarEditor) {
			this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
				let imageUrl = URL.createObjectURL(blob);
				this.setState({
					croppedImage: imageUrl,
					blob,
				});
			});
		}
	};

	uploadCroppedImage = () => {
		const { storageRef, userRef, blob, metadata } = this.state;
		storageRef
			.child(`avatars/user-${userRef.uid}`)
			.put(blob, metadata)
			.then(snap => {
				snap.ref.getDownloadURL().then(downloadUrl => {
					this.setState({ uploadedCroppedImage: downloadUrl }, () => this.changeAvatar());
				});
			});
	};

	changeAvatar = () => {
		this.state.userRef
			.updateProfile({
				photoURL: this.state.uploadedCroppedImage,
			})
			.then(() => {
				console.log('Photo Url Updated');
				this.closeModal();
			})
			.catch(err => console.error(err));

		this.state.usersRef
			.child(this.props.currentUser.uid)
			.update({ avatar: this.state.uploadedCroppedImage })
			.then(() => console.log('User avatar updated'))
			.catch(err => console.error(err));
	};

	handleSignout = () => {
		firebase
			.auth()
			.signOut()
			.then(() => console.log('user signed out'));
	};
	render() {
		const { currentUser, primaryColor } = this.props;
		const { modal, previewImage, croppedImage } = this.state;
		return (
			<Grid style={{ background: primaryColor }}>
				<Grid.Column>
					<Grid.Row style={{ padding: '1.2rem', margin: 0 }}>
						<Header inverted floated="left" as="h2">
							<Icon name="code" />
							<Header.Content as="h6">Disprz Chat</Header.Content>
						</Header>
					</Grid.Row>
					<Header style={{ padding: '1em 2em' }} as="h4" inverted>
						<Dropdown
							trigger={
								<span>
									<Image src={currentUser.photoURL} spaced="right" avatar />
									{currentUser.displayName}
								</span>
							}
							options={this.dropdownOptions()}
						/>
					</Header>
					{/* Change User avatar modal */}
					<Modal basic open={modal} onClose={this.closeModal}>
						<Modal.Header>Change Avatar</Modal.Header>
						<Modal.Content>
							<Input
								fluid
								type="file"
								label="New Avatar"
								name="previewImage"
								onChange={this.handleChange}
							/>
							<Grid centered stackable columns={2}>
								<Grid.Row centered>
									<Grid.Column className="ui center aligned grid">
										{previewImage && (
											<AvatarEditor
												ref={node => (this.avatarEditor = node)}
												image={previewImage}
												width={120}
												height={120}
												border={50}
												scale={1.2}
											/>
										)}
									</Grid.Column>
									<Grid.Column>
										{croppedImage && (
											<Image
												style={{ margin: '3.5em auto' }}
												width={100}
												height={100}
												src={croppedImage}
											/>
										)}
									</Grid.Column>
								</Grid.Row>
							</Grid>
						</Modal.Content>
						<Modal.Actions>
							<Button color="green" inverted onClick={this.uploadCroppedImage}>
								<Icon name="save" /> Change Avatar
							</Button>
							<Button color="green" inverted onClick={this.handleCropImage}>
								<Icon name="image" /> Preview Image
							</Button>
							<Button color="red" inverted onClick={this.closeModal}>
								<Icon name="remove" /> Cancel
							</Button>
						</Modal.Actions>
					</Modal>
				</Grid.Column>
			</Grid>
		);
	}
}

export default UserPanel;
