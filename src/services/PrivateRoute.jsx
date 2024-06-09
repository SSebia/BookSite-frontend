import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/services/AuthContext.jsx';

function PrivateRoute({ children, roles }) {
    const { isLoading, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && (!user || !roles.includes(user.rol[0]))) {
            navigate('/login');
        }
    }, [isLoading, user, roles, navigate]);

    if (isLoading) {
        return null;
    }

    return children;
}

export default PrivateRoute;