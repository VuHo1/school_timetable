import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/main.css';
import UserAvatar from '../UserAvatar';

function StaffLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    console.log('StaffLayout rendering');

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="staff-container">
            <aside className="staff-sidebar">
                <h2>Staff Menu</h2>
                <nav>
                    <Link to="/staff/schedule">View Schedule</Link>
                    <Link to="/staff/class">Quản lý lớp học</Link>
                    <Link to="/profile"><UserAvatar /></Link>
                    <button onClick={handleLogout}>Logout</button>
                </nav>
            </aside>
            <main className="staff-main">
                <Outlet />
            </main>
        </div>
    );
}

export default StaffLayout;