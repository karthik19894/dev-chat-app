import React, { Component } from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import firebase from '../../firebase';

class Login extends Component {
	state = {
		email: '',
		password: '',
		errors: [],
		loading: false,
		usersRef: firebase.database().ref('users'),
	};
	handleChange = event => {
		this.setState({
			[event.target.name]: event.target.value,
		});
	};

	handleSubmit = event => {
		event.preventDefault();
		if (this.isFormValid(this.state)) {
			this.setState({ loading: true });
			firebase
				.auth()
				.signInWithEmailAndPassword(this.state.email, this.state.password)
				.then(signedInUser => {
					console.log(signedInUser);
				})
				.catch(err => {
					console.error(err);
					this.setState({
						errors: this.state.errors.concat(err),
						loading: false,
					});
				});
		}
	};

	isFormValid = ({ email, password }) => email && password;

	displayErrors = errors => errors.map((error, i) => <p key={i}>{error.message}</p>);

	handleInputError = (errors, inputName) => {
		return errors.some(error => error.message.toLowerCase().includes(inputName)) ? 'error' : '';
	};

	render() {
		const { email, password, errors, loading } = this.state;
		return (
			<Grid textAlign="center" verticalAlign="middle" className="app">
				<Grid.Column style={{ maxWidth: 450 }}>
					<Header as="h1" icon color="violet" textAlign="center">
						<Icon name="code branch" color="violet" />
						Login to Disprz Chat
					</Header>
					<Form size="large" onSubmit={this.handleSubmit}>
						<Segment stacked>
							<Form.Input
								fluid
								className={this.handleInputError(errors, 'email')}
								name="email"
								placeholder="Email Address"
								icon="mail"
								iconPosition="left"
								onChange={this.handleChange}
								type="email"
								value={email}
							/>
							<Form.Input
								fluid
								className={this.handleInputError(errors, 'password')}
								name="password"
								placeholder="Password"
								icon="lock"
								iconPosition="left"
								onChange={this.handleChange}
								type="password"
								value={password}
							/>
							<Button
								disabled={loading}
								className={loading ? 'loading' : ''}
								color="violet"
								fluid
								size="large"
							>
								Login
							</Button>
						</Segment>
					</Form>

					{this.state.errors.length > 0 && (
						<Message error>
							<h3>Error</h3>
							{this.displayErrors(errors)}
						</Message>
					)}
				</Grid.Column>
			</Grid>
		);
	}
}

export default Login;
