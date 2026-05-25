import { Navigate, useLocation } from 'react-router-dom';
import { getStoredUser } from '../utils/auth';

const normalizeRoles = (roles) =>
	roles
		? (Array.isArray(roles) ? roles : [roles]).map((role) => String(role).toLowerCase())
		: null;

const ProtectedRoute = ({ children, allowedRoles }) => {
	const location = useLocation();
	const currentUser = getStoredUser();
	const normalizedAllowedRoles = normalizeRoles(allowedRoles);

	if (!currentUser) {
		return <Navigate to="/login" replace state={{ from: location.pathname }} />;
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