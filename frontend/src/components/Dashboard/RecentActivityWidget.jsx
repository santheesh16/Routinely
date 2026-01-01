import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const RecentActivityWidget = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentActivity = async () => {
            try {
                // Fetch recent entries from all trackers
                const [budgets, gymSessions, dsaProblems, germanSessions] = await Promise.all([
                    api.get('/budget').catch(() => ({ data: [] })),
                    api.get('/gym').catch(() => ({ data: [] })),
                    api.get('/dsa').catch(() => ({ data: [] })),
                    api.get('/german').catch(() => ({ data: [] })),
                ]);

                const allActivities = [
                    ...budgets.data.slice(0, 3).map((item) => ({
                        type: 'budget',
                        title: `${item.type === 'income' ? 'Income' : 'Expense'}: $${item.amount.toFixed(2)}`,
                        subtitle: item.category,
                        date: item.date,
                        link: '/budget',
                        icon: <MoneyIcon className="w-5 h-5" />,
                    })),
                    ...gymSessions.data.slice(0, 3).map((item) => ({
                        type: 'gym',
                        title: `${item.workoutType} workout`,
                        subtitle: `${item.duration} minutes`,
                        date: item.date,
                        link: '/gym',
                        icon: <BoltIcon className="w-5 h-5" />,
                    })),
                    ...dsaProblems.data.slice(0, 3).map((item) => ({
                        type: 'dsa',
                        title: item.problemName,
                        subtitle: `${item.platform} - ${item.difficulty}`,
                        date: item.date,
                        link: '/dsa',
                        icon: <CodeIcon className="w-5 h-5" />,
                    })),
                    ...germanSessions.data.slice(0, 3).map((item) => ({
                        type: 'german',
                        title: `${item.timeSpent} minutes studied`,
                        subtitle: `${item.lessonsCompleted} lessons`,
                        date: item.date,
                        link: '/german',
                        icon: <GlobeIcon className="w-5 h-5" />,
                    })),
                ]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5);

                setActivities(allActivities);
            } catch (error) {
                console.error('Error fetching recent activity:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentActivity();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
                <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
                <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="space-y-3">
                {activities.map((activity, index) => (
                    <Link
                        key={index}
                        to={activity.link}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <div className="flex items-center">{activity.icon}</div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                                {activity.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {activity.subtitle} • {new Date(activity.date).toLocaleDateString()}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RecentActivityWidget;
