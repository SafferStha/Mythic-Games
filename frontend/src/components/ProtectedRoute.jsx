import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';
import { clearStoredUser, getStoredUser } from '../utils/auth';

const normalizeRoles = (roles) =>
	roles
		? (Array.isArray(roles) ? roles : [roles]).map((role) => String(role).toLowerCase())
		: null;

const ProtectedRoute = ({ children, allowedRoles }) => {
	const location = useLocation();
	const currentUser = getStoredUser();
	const [statusCheck, setStatusCheck] = useState('checking');
	const normalizedAllowedRoles = normalizeRoles(allowedRoles);

	useEffect(() => {
		let isMounted = true;

		const checkUserStatus = async () => {
			if (!currentUser) {
				setStatusCheck('done');
				return;
			}

			const currentRole = String(currentUser.role || 'user').toLowerCase();
			if (currentRole !== 'user') {
				setStatusCheck('done');
				return;
			}

			const userId = currentUser.uid ?? currentUser.user_id;
			if (!userId) {
				clearStoredUser();
				setStatusCheck('blocked');
				return;
			}

			try {
				const response = await fetch(`${API_BASE_URL}/api/users/${userId}`);
				const payload = await response.json();

				if (!response.ok || payload?.data?.status !== 'active') {
					window.alert('Your account has been banned by admin.');
					clearStoredUser();
					if (isMounted) setStatusCheck('blocked');
					return;
				}

				if (isMounted) setStatusCheck('done');
			} catch (error) {
				if (isMounted) setStatusCheck('done');
			}
		};

		checkUserStatus();

		return () => {
			isMounted = false;
		};
	}, [currentUser?.uid, currentUser?.user_id, currentUser?.role]);

	if (!currentUser) {
		return <Navigate to="/login" replace state={{ from: location.pathname }} />;
	}

	if (statusCheck === 'checking') {
		return null;
	}

	if (statusCheck === 'blocked') {
		return <Navigate to="/login" replace />;
	}

	if (normalizedAllowedRoles) {
		const currentRole = String(currentUser.role || 'user').toLowerCase();

		if (!normalizedAllowedRoles.includes(currentRole)) {
			return <Navigate to={currentRole === 'admin' ? '/manage-games' : '/account'} replace />;
		}
	}

	return children;
};

export default ProtectedRoute;
