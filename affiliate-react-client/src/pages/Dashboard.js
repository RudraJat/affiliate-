import { Link } from 'react-router-dom';

function Dashboard() {
    return (
        <div className="container text-center">
            <h1>User Dashboard Page</h1>
            <Link to="/logout">Logout</Link>
        </div>
    );
}

export default Dashboard;