import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
	const location = useLocation();
	const currentUser = window.localStorage.getItem('mythic-games-user');

	if (!currentUser) {
		return <Navigate to="/login" replace state={{ from: location.pathname }} />;
	}

	return children;
};

export default ProtectedRoute;