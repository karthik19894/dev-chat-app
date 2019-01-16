import * as actionTypes from '../actions/types';
import { combineReducers } from 'redux';

const initialUserState = {
	currentUser: null,
	isLoading: true,
};

const userReducer = (state = initialUserState, action) => {
	switch (action.type) {
		case actionTypes.SET_USER:
			return {
				currentUser: action.payload.currentUser,
				isLoading: false,
			};
		case actionTypes.CLEAR_USER:
			return {
				...initialUserState,
				isLoading: false,
			};
		default:
			return state;
	}
};

//Channels reducer
const initialChannelState = {
	currentChannel: null,
	isPrivateChannel: false,
	userPosts: null,
};
const channelsReducer = (state = initialChannelState, action) => {
	switch (action.type) {
		case actionTypes.SET_CURRENT_CHANNEL:
			return {
				...state,
				currentChannel: action.payload,
			};
		case actionTypes.SET_PRIVATE_CHANNEL:
			return {
				...state,
				isPrivateChannel: action.payload,
			};
		case actionTypes.SET_USER_POSTS:
			return {
				...state,
				userPosts: action.payload,
			};
		default:
			return {
				...state,
			};
	}
};

const initialColorsState = {
	primaryColor: '#4c3c4c',
	secondaryColor: '#eee',
};

const colorsReducer = (state = initialColorsState, action) => {
	switch (action.type) {
		case actionTypes.SET_COLORS:
			return {
				...state,
				primaryColor: action.payload.primaryColor,
				secondaryColor: action.payload.secondaryColor,
			};
		default:
			return {
				...state,
			};
	}
};

const rootReducer = combineReducers({
	user: userReducer,
	channels: channelsReducer,
	colors: colorsReducer,
});

export default rootReducer;
