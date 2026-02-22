import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
    Users,
    Target,
    Database as DbIcon,
    Activity,
    TrendingUp,
    ShieldCheck,
    Search,
    Download,
    Mail,
    Zap,
    RefreshCw,
    Trophy,
    History,
    Lock,
    ArrowUpRight,
    PieChart
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

interface Stats {
    totalUsers: number;
    totalActivities: number;
    totalEvents: number;
    totalEntries: number;
    activeToday: number;
    signedDeals: number;
}

interface UserProfile {
    id: string;
    full_name: string | null;
    email: string | null;
    phone_number: string | null;
    team: 'logistics' | 'sponsoring' | 'both' | null;
    created_at: string;
    ranking: number | null;
    activities_count?: number;
}

interface ActivityItem {
    id: number;
    user_id: string;
    source: string;
    contact_method: string;
    created_at: string;
    user_name?: string;
}

export const SuperAdmin = () => {
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalActivities: 0,
        totalEvents: 0,
        totalEntries: 0,
        activeToday: 0,
        signedDeals: 0
    });
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [, setRecentActivities] = useState<ActivityItem[]>([]);
    const [allActivities, setAllActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTeam, setFilterTeam] = useState<string>('all');

    // Modals state
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            // Fetch Stats
            const [
                { count: userCount },
                { count: activityCount },
                { count: eventCount },
                { count: companyCount },
                { count: logisticsCount },
                { data: todayActivities },
                { count: signedCount }
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('activities').select('*', { count: 'exact', head: true }),
                supabase.from('events').select('*', { count: 'exact', head: true }),
                supabase.from('companies').select('*', { count: 'exact', head: true }),
                supabase.from('logistics').select('*', { count: 'exact', head: true }),
                supabase.from('activities').select('*').gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
                supabase.from('companies').select('*', { count: 'exact', head: true }).eq('status', 'signed')
            ]);

            setStats({
                totalUsers: userCount || 0,
                totalActivities: activityCount || 0,
                totalEvents: eventCount || 0,
                totalEntries: (companyCount || 0) + (logisticsCount || 0),
                activeToday: todayActivities?.length || 0,
                signedDeals: signedCount || 0
            });

            // Fetch Users with ranking
            const { data: profilesData } = await supabase
                .from('profiles')
                .select(`
          *,
          activities:activities(count)
        `)
                .order('ranking', { ascending: false });

            if (profilesData) {
                const formattedUsers = profilesData.map((u: any) => ({
                    ...u,
                    activities_count: u.activities?.[0]?.count || 0,
                    ranking: u.ranking || 0
                }));

                // Final robustness sort
                formattedUsers.sort((a, b) => (b.ranking || 0) - (a.ranking || 0));
                setUsers(formattedUsers);
            }

            // Fetch Recent System Activity
            const { data: activitiesData } = await supabase
                .from('activities')
                .select(`
          *,
          profiles:user_id(full_name)
        `)
                .order('created_at', { ascending: false })
                .limit(50);

            if (activitiesData) {
                const formatted = activitiesData.map((a: any) => ({
                    ...a,
                    user_name: a.profiles?.full_name || 'System'
                }));
                setRecentActivities(formatted.slice(0, 10));
                setAllActivities(formatted);
            }

        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleExportData = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Name,Email,Team,Ranking,Activities,Joined\n"
            + users.map(u => `${u.full_name},${u.email},${u.team || 'Unassigned'},${u.ranking || 0},${u.activities_count},${new Date(u.created_at).toLocaleDateString()}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `fler_admin_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleEmailAll = () => {
        const emails = users.map(u => u.email).filter(Boolean).join(',');
        window.location.href = `mailto:${emails}?subject=Update from FLer Admin&body=Hello team,`;
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesTeam = filterTeam === 'all' || user.team === filterTeam;

        return matchesSearch && matchesTeam;
    });

    const sponsoringCount = users.filter(u => u.team === 'sponsoring').length;
    const logisticsCount = users.filter(u => u.team === 'logistics').length;
    const bothCount = users.filter(u => u.team === 'both').length;
    const unassignedCount = users.length - sponsoringCount - logisticsCount - bothCount;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
                <p className="text-gray-500 font-medium animate-pulse">Synchronizing Control Center...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <ShieldCheck size={28} />
                        </div>
                        <h1 className="text-4xl font-black text-text tracking-tight uppercase">Control Center</h1>
                    </div>
                    <p className="text-gray-500 font-medium ml-1">Universal infrastructure monitoring and system analytics.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                        <span className="font-semibold">{refreshing ? 'Refreshing...' : 'Live Sync'}</span>
                    </button>
                    <button
                        onClick={handleExportData}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm active:scale-95 text-gray-700"
                    >
                        <Download size={18} />
                        <span className="font-semibold">Export DB</span>
                    </button>
                    <button
                        onClick={handleEmailAll}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95"
                    >
                        <Mail size={18} />
                        <span className="font-semibold">Broadcast</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Users className="text-blue-600" />}
                    label="Team Team"
                    value={stats.totalUsers}
                    trend="Active Personnel"
                    color="blue"
                />
                <StatCard
                    icon={<Zap className="text-purple-600" />}
                    label="Pulse Actions"
                    value={stats.totalActivities}
                    trend={`${stats.activeToday} today`}
                    color="purple"
                />
                <StatCard
                    icon={<DbIcon className="text-emerald-600" />}
                    label="Records"
                    value={stats.totalEntries}
                    trend="Matrix synced"
                    color="emerald"
                />
                <StatCard
                    icon={<Target className="text-orange-600" />}
                    label="Conversion"
                    value={stats.signedDeals}
                    trend="Signed contracts"
                    color="orange"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                {/* Leaderboard Section - 8 cols */}
                <Card className="xl:col-span-8 overflow-hidden border-none shadow-2xl bg-white/70 backdrop-blur-xl ring-1 ring-black/5">
                    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                <Trophy size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-text uppercase">Leaderboard</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Performers Matrix</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Filter Team..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-gray-100/50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 w-full sm:w-56 transition-all text-sm font-semibold"
                                />
                            </div>
                            <select
                                value={filterTeam}
                                onChange={(e) => setFilterTeam(e.target.value)}
                                className="px-4 py-2 bg-gray-100/50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-sm font-semibold cursor-pointer"
                            >
                                <option value="all">Global</option>
                                <option value="sponsoring">Sponsoring</option>
                                <option value="logistics">Logistics</option>
                                <option value="both">Both Teams</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-hidden">
                        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white/90 backdrop-blur-md z-20">
                                    <tr className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-gray-50">
                                        <th className="px-6 py-4">Rank & Identity</th>
                                        <th className="px-8 py-4 text-center">Team</th>
                                        <th className="px-8 py-4 text-center">Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredUsers.length > 0 ? filteredUsers.map((user, index) => (
                                        <tr key={user.id} className="hover:bg-gray-50/80 transition-all duration-300 group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${index === 0 ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-200' :
                                                        index === 1 ? 'bg-gray-300 text-white shadow-lg shadow-gray-200' :
                                                            index === 2 ? 'bg-orange-400 text-white shadow-lg shadow-orange-200' :
                                                                'bg-gray-100 text-gray-400'
                                                        }`}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-text text-sm leading-tight">{user.full_name || 'Anonymous'}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold mt-0.5 flex items-center gap-1">
                                                            <Mail size={10} /> {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <Badge
                                                    variant="default"
                                                    className={
                                                        user.team === 'sponsoring'
                                                            ? 'bg-blue-500/10 text-blue-600 border-none px-3 font-black text-[9px]'
                                                            : user.team === 'logistics'
                                                                ? 'bg-purple-500/10 text-purple-600 border-none px-3 font-black text-[9px]'
                                                                : user.team === 'both'
                                                                    ? 'bg-emerald-500/10 text-emerald-600 border-none px-3 font-black text-[9px]'
                                                                    : 'bg-gray-500/10 text-gray-400 border-none px-3 font-black text-[9px]'
                                                    }
                                                >
                                                    {user.team?.toUpperCase() || 'EXTERNAL'}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-lg font-black text-primary">{user.ranking || 0}</span>
                                                    <span className="text-[8px] text-primary/60 font-black uppercase tracking-widest">Points</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                                                No operators found in current matrix
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Card>

                {/* Intelligence Panels - 4 cols */}
                <div className="xl:col-span-4 space-y-8">


                    {/* Infrastructure Distribution */}
                    <Card className="p-6 border-none shadow-xl bg-white space-y-6">
                        <h3 className="text-lg font-black text-text flex items-center gap-2 uppercase tracking-tight">
                            <PieChart className="text-blue-600" size={18} />
                            Sector Allocation
                        </h3>
                        <div className="space-y-4">
                            <TeamBar label="Sponsoring" count={sponsoringCount} total={users.length} color="bg-blue-500" />
                            <TeamBar label="Logistics" count={logisticsCount} total={users.length} color="bg-purple-500" />
                            <TeamBar label="Both Teams" count={bothCount} total={users.length} color="bg-emerald-500" />
                            <TeamBar label="Unassigned" count={unassignedCount} total={users.length} color="bg-gray-400" />
                        </div>
                    </Card>

                    {/* Quick Command Area */}
                    <Card className="p-6 border-none shadow-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <History size={100} />
                        </div>
                        <h3 className="text-lg font-black mb-6 flex items-center gap-2 uppercase tracking-tight relative z-10">
                            <TrendingUp size={20} />
                            Quick Ops
                        </h3>
                        <div className="grid grid-cols-1 gap-3 relative z-10">
                            <button
                                onClick={() => setIsAuditModalOpen(true)}
                                className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group/btn"
                            >
                                <div className="flex items-center gap-3">
                                    <History className="text-primary group-hover/btn:scale-110 transition-transform" size={18} />
                                    <span className="text-xs font-black uppercase tracking-widest text-white/80">Audit Log</span>
                                </div>
                                <ArrowUpRight size={14} className="text-white/20" />
                            </button>
                            <button
                                onClick={() => setIsPermissionsModalOpen(true)}
                                className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group/btn"
                            >
                                <div className="flex items-center gap-3">
                                    <Lock className="text-orange-400 group-hover/btn:scale-110 transition-transform" size={18} />
                                    <span className="text-xs font-black uppercase tracking-widest text-white/80">Permissions</span>
                                </div>
                                <ArrowUpRight size={14} className="text-white/20" />
                            </button>
                            <button
                                onClick={() => fetchData(true)}
                                className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group/btn"
                            >
                                <div className="flex items-center gap-3">
                                    <RefreshCw className="text-emerald-400 group-hover/btn:scale-110 transition-transform" size={18} />
                                    <span className="text-xs font-black uppercase tracking-widest text-white/80">Pulse Sync</span>
                                </div>
                                <ArrowUpRight size={14} className="text-white/20" />
                            </button>
                        </div>
                    </Card>
                </div>

            </div>

            {/* Audit Log Modal */}
            <Modal
                isOpen={isAuditModalOpen}
                onClose={() => setIsAuditModalOpen(false)}
                title="SYSTEM EVENT LOG"
                size="lg"
            >
                <div className="space-y-4 max-h-[60vh] overflow-y-auto px-4 py-2 custom-scrollbar">
                    {allActivities.length > 0 ? allActivities.map((a) => (
                        <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${a.contact_method === 'call' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    <Activity size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-text uppercase italic">{a.user_name}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">
                                        Team: {a.contact_method} | Source: {a.source}
                                    </p>
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-gray-400">
                                {new Date(a.created_at).toLocaleString()}
                            </p>
                        </div>
                    )) : (
                        <p className="text-center text-gray-400 py-12 uppercase font-black text-xs tracking-widest">Zero events logged</p>
                    )}
                </div>
            </Modal>

            {/* Permissions Modal */}
            <Modal
                isOpen={isPermissionsModalOpen}
                onClose={() => setIsPermissionsModalOpen(false)}
                title="ACCESS CONTROL TeamS"
                size="md"
            >
                <div className="p-6 space-y-6 text-center">
                    <div className="mx-auto w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center animate-pulse">
                        <Lock size={40} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-text uppercase">Security Architecture</h3>
                        <p className="text-sm text-gray-500 mt-2 font-medium">
                            System access is currently governed by email-whitelist Teams defined in <code className="bg-gray-100 px-2 py-0.5 rounded text-primary">constants.ts</code>.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Authorized</p>
                            <p className="text-2xl font-black text-primary">{stats.totalUsers}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Super Admin</p>
                            <p className="text-2xl font-black text-emerald-600">Active</p>
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-400 italic">Global permissions are strictly inherited from the identity layer.</p>
                </div>
            </Modal>

        </div>
    );
};

const StatCard = ({ icon, label, value, trend, color }: any) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-500/5 bg-blue-50 text-blue-600 ring-blue-500/10',
        purple: 'bg-purple-500/5 bg-purple-50 text-purple-600 ring-purple-500/10',
        emerald: 'bg-emerald-500/5 bg-emerald-50 text-emerald-600 ring-emerald-500/10',
        orange: 'bg-orange-500/5 bg-orange-50 text-orange-600 ring-orange-500/10',
    };

    return (
        <Card className="p-7 border-none shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative ring-1 ring-black/5 hover:-translate-y-1">
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-1000 ${colorClasses[color].split(' ')[0]}`}></div>
            <div className="flex items-center gap-5 relative z-10 font-black">
                <div className={`p-4 rounded-2xl transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-lg ${colorClasses[color].split(' ').slice(1, 4).join(' ')}`}>
                    {React.cloneElement(icon, { size: 28 })}
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">{label}</p>
                    <h3 className="text-3xl font-black text-text mt-0.5 tracking-tight">{value}</h3>
                </div>
            </div>
            <div className="mt-6 flex items-center justify-between relative z-10 px-1">
                <span className="text-[11px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">{trend}</span>
                <div className="flex items-center gap-1 text-emerald-500">
                    <ArrowUpRight size={16} />
                </div>
            </div>
        </Card>
    );
};

const TeamBar = ({ label, count, total, color }: any) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">{label} Team</span>
                <span className="text-xs font-black text-text">{count} ({Math.round(percentage)}%)</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                    className={`${color} h-full rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};
