import * as actionTypes from './types';

//User actions
export const setUser = user => {
	return {
		type: actionTypes.SET_USER,
		payload: {
			currentUser: user,
		},
	};
};

export const clearUser = user => {
	return {
		type: actionTypes.CLEAR_USER,
	};
};

// Channel actions
export const setCurrentChannel = channel => {
	return {
		type: actionTypes.SET_CURRENT_CHANNEL,
		payload: channel,
	};
};
