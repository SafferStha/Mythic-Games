const AUTH_STORAGE_KEY = 'mythic-games-user';

export const getStoredUser = () => {
	if (typeof window === 'undefined') {
		return null;
	}

	try {
		const rawUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
		return rawUser ? JSON.parse(rawUser) : null;
	} catch (error) {
		return null;
	}
};

export const setStoredUser = (user) => {
	const currentUser = getStoredUser() || {};
	const updatedUser = { ...currentUser, ...user };
	window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
	window.dispatchEvent(new Event('auth-changed'));
};

export const clearStoredUser = () => {
	window.localStorage.removeItem(AUTH_STORAGE_KEY);
	window.dispatchEvent(new Event('auth-changed'));
};