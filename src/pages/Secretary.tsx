import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
    Users,
    Building2,
    Target,
    Calendar,
    TrendingUp,
    Mail,
    Phone,
    Linkedin,
    Coffee,
    Share2,
    Search,
    Download,
    RefreshCw,
    FileText,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    Printer,
    BarChart3,
    Activity,
    ChevronDown,
    ChevronUp,
    Filter,
    X,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { advancedMatch } from '../utils/search';

/* ─────────────────────── Types ─────────────────────── */

interface MemberStat {
    id: string;
    full_name: string | null;
    email: string | null;
    team: 'logistics' | 'sponsoring' | 'both' | null;
    ranking: number | null;
    totalContacts: number;
    call: number;
    emailMethod: number;
    linkedin: number;
    outing: number;
    social_media: number;
    signed: number;
    pending: number;
    contacted: number;
    rejected: number;
}

interface GlobalStats {
    totalMembers: number;
    totalContacts: number;
    totalEvents: number;
    totalSigned: number;
    totalPending: number;
    totalRejected: number;
    totalContacted: number;
    callTotal: number;
    emailTotal: number;
    linkedinTotal: number;
    outingTotal: number;
    socialTotal: number;
    logisticsContacts: number;
}

type SortKey = 'totalContacts' | 'ranking' | 'signed' | 'full_name';
type SortDir = 'asc' | 'desc';

/* ─────────────────────── Component ─────────────────────── */

export const Secretary = () => {
    const [members, setMembers] = useState<MemberStat[]>([]);
    const [filtered, setFiltered] = useState<MemberStat[]>([]);
    const [globalStats, setGlobalStats] = useState<GlobalStats>({
        totalMembers: 0,
        totalContacts: 0,
        totalEvents: 0,
        totalSigned: 0,
        totalPending: 0,
        totalRejected: 0,
        totalContacted: 0,
        callTotal: 0,
        emailTotal: 0,
        linkedinTotal: 0,
        outingTotal: 0,
        socialTotal: 0,
        logisticsContacts: 0,
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTeam, setFilterTeam] = useState<string>('all');
    const [sortKey, setSortKey] = useState<SortKey>('totalContacts');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    // PV Modal
    const [isPVOpen, setIsPVOpen] = useState(false);
    const [pvTitle, setPvTitle] = useState(`PV — ${new Date().toLocaleDateString('fr-DZ', { year: 'numeric', month: 'long', day: 'numeric' })}`);
    const [pvContent, setPvContent] = useState('');

    // Details modal
    const [selectedMember, setSelectedMember] = useState<MemberStat | null>(null);
    const [isMemberDetailOpen, setIsMemberDetailOpen] = useState(false);

    useEffect(() => {
        fetchData();

        const channel = supabase
            .channel('secretary-live')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, () => fetchData(true))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => fetchData(true))
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    useEffect(() => {
        let result = [...members];

        if (searchTerm) {
            result = result.filter(m => advancedMatch(m, searchTerm));
        }

        if (filterTeam !== 'all') {
            result = result.filter(m => m.team === filterTeam);
        }

        result.sort((a, b) => {
            let va: any = a[sortKey as keyof MemberStat] ?? 0;
            let vb: any = b[sortKey as keyof MemberStat] ?? 0;
            if (sortKey === 'full_name') {
                va = (a.full_name || '').toLowerCase();
                vb = (b.full_name || '').toLowerCase();
            }
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

        setFiltered(result);
    }, [members, searchTerm, filterTeam, sortKey, sortDir]);

    const fetchData = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            // ── Global counts ──
            const [
                { count: memberCount },
                { count: companyCount },
                { count: eventCount },
                { count: signedCount },
                { count: pendingCount },
                { count: rejectedCount },
                { count: contactedCount },
                { count: logisticsCount },
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('companies').select('*', { count: 'exact', head: true }),
                supabase.from('events').select('*', { count: 'exact', head: true }),
                supabase.from('companies').select('*', { count: 'exact', head: true }).eq('status', 'signed'),
                supabase.from('companies').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('companies').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
                supabase.from('companies').select('*', { count: 'exact', head: true }).eq('status', 'contacted'),
                supabase.from('logistics').select('*', { count: 'exact', head: true }),
            ]);

            // ── Activities per method (global) ──
            const { data: allActivities } = await supabase
                .from('activities')
                .select('contact_method, user_id');

            const methodCounts = { call: 0, email: 0, linkedin: 0, outing: 0, social_media: 0 };
            const userMethodMap: Record<string, Record<string, number>> = {};

            (allActivities || []).forEach((a: any) => {
                const method = a.contact_method as string;
                if (method in methodCounts) methodCounts[method as keyof typeof methodCounts]++;
                if (a.user_id) {
                    if (!userMethodMap[a.user_id]) userMethodMap[a.user_id] = { call: 0, email: 0, linkedin: 0, outing: 0, social_media: 0 };
                    if (method) userMethodMap[a.user_id][method] = (userMethodMap[a.user_id][method] || 0) + 1;
                }
            });

            setGlobalStats({
                totalMembers: memberCount || 0,
                totalContacts: companyCount || 0,
                totalEvents: eventCount || 0,
                totalSigned: signedCount || 0,
                totalPending: pendingCount || 0,
                totalRejected: rejectedCount || 0,
                totalContacted: contactedCount || 0,
                callTotal: methodCounts.call,
                emailTotal: methodCounts.email,
                linkedinTotal: methodCounts.linkedin,
                outingTotal: methodCounts.outing,
                socialTotal: methodCounts.social_media,
                logisticsContacts: logisticsCount || 0,
            });

            // ── Profiles ──
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, full_name, email, team, ranking');

            // ── Companies per user ──
            const { data: companiesData } = await supabase
                .from('companies')
                .select('assigned_user_id, status');

            const userCompanyMap: Record<string, { total: number; signed: number; pending: number; contacted: number; rejected: number }> = {};
            (companiesData || []).forEach((c: any) => {
                const uid = c.assigned_user_id;
                if (!uid) return;
                if (!userCompanyMap[uid]) userCompanyMap[uid] = { total: 0, signed: 0, pending: 0, contacted: 0, rejected: 0 };
                userCompanyMap[uid].total++;
                if (c.status) userCompanyMap[uid][c.status as keyof typeof userCompanyMap[string]] = (userCompanyMap[uid][c.status as keyof typeof userCompanyMap[string]] || 0) + 1;
            });

            // ── Build member stats ──
            const built: MemberStat[] = (profilesData || []).map((p: any) => {
                const methods = userMethodMap[p.id] || {};
                const companies = userCompanyMap[p.id] || { total: 0, signed: 0, pending: 0, contacted: 0, rejected: 0 };
                const totalContacts = (methods.call || 0) + (methods.email || 0) + (methods.linkedin || 0) + (methods.outing || 0) + (methods.social_media || 0);
                return {
                    id: p.id,
                    full_name: p.full_name,
                    email: p.email,
                    team: p.team,
                    ranking: p.ranking || 0,
                    totalContacts,
                    call: methods.call || 0,
                    emailMethod: methods.email || 0,
                    linkedin: methods.linkedin || 0,
                    outing: methods.outing || 0,
                    social_media: methods.social_media || 0,
                    signed: companies.signed,
                    pending: companies.pending,
                    contacted: companies.contacted,
                    rejected: companies.rejected,
                };
            });

            setMembers(built);
        } catch (err) {
            console.error('Secretary dashboard error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    const handleExportCSV = () => {
        const rows = [
            ['Name', 'Email', 'Team', 'Total Contacts', 'Call', 'Email', 'LinkedIn', 'Outing', 'Social Media', 'Signed', 'Pending', 'Contacted', 'Rejected', 'Ranking'],
            ...filtered.map(m => [
                m.full_name || '', m.email || '', m.team || 'N/A',
                m.totalContacts, m.call, m.emailMethod, m.linkedin, m.outing, m.social_media,
                m.signed, m.pending, m.contacted, m.rejected, m.ranking || 0
            ])
        ];
        const csv = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
        const link = document.createElement('a');
        link.href = encodeURI(csv);
        link.download = `secretary_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintPV = () => {
        const win = window.open('', '_blank');
        if (!win) return;
        // Prepare summary and top performers HTML
        const summaryHtml = `
            <div style="background:#f9fafb;border-radius:16px;padding:20px 24px;margin-bottom:24px;border:1px solid #f3f4f6;">
                <div style="font-size:10px;font-weight:900;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">Auto-generated Summary</div>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:10px;">
                    <div><div style='font-size:16px;font-weight:900;color:#1a1a1a;'>${globalStats.totalContacts}</div><div style='font-size:9px;font-weight:900;color:#9ca3af;text-transform:uppercase;'>Total Companies</div></div>
                    <div><div style='font-size:16px;font-weight:900;color:#1a1a1a;'>${globalStats.totalSigned}</div><div style='font-size:9px;font-weight:900;color:#9ca3af;text-transform:uppercase;'>Signed</div></div>
                    <div><div style='font-size:16px;font-weight:900;color:#1a1a1a;'>${globalStats.totalMembers}</div><div style='font-size:9px;font-weight:900;color:#9ca3af;text-transform:uppercase;'>Members</div></div>
                    <div><div style='font-size:16px;font-weight:900;color:#1a1a1a;'>${convRate}%</div><div style='font-size:9px;font-weight:900;color:#9ca3af;text-transform:uppercase;'>Conv. Rate</div></div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;border-top:1px solid #e5e7eb;padding-top:10px;">
                    <div><div style='font-size:14px;font-weight:900;color:#1a1a1a;'>${globalStats.callTotal}</div><div style='font-size:9px;font-weight:900;color:#9ca3af;text-transform:uppercase;'>Calls</div></div>
                    <div><div style='font-size:14px;font-weight:900;color:#1a1a1a;'>${globalStats.emailTotal}</div><div style='font-size:9px;font-weight:900;color:#9ca3af;text-transform:uppercase;'>Emails</div></div>
                    <div><div style='font-size:14px;font-weight:900;color:#1a1a1a;'>${globalStats.linkedinTotal}</div><div style='font-size:9px;font-weight:900;color:#9ca3af;text-transform:uppercase;'>LinkedIn</div></div>
                    <div><div style='font-size:14px;font-weight:900;color:#1a1a1a;'>${globalStats.outingTotal}</div><div style='font-size:9px;font-weight:900;color:#9ca3af;text-transform:uppercase;'>Outings</div></div>
                    <div><div style='font-size:14px;font-weight:900;color:#1a1a1a;'>${globalStats.socialTotal}</div><div style='font-size:9px;font-weight:900;color:#9ca3af;text-transform:uppercase;'>Social</div></div>
                </div>
            </div>
        `;
        const topPerformers = [...members]
            .sort((a, b) => (b.totalContacts - a.totalContacts))
            .slice(0, 5)
            .map((m, i) => `
                <li style="display:flex;justify-content:space-between;align-items:center;font-size:14px;margin-bottom:6px;">
                    <span style="font-weight:900;color:#1a1a1a;"><span style='color:#9ca3af;margin-right:8px;'>${i + 1}.</span>${m.full_name || 'N/A'}</span>
                    <span style="font-weight:900;color:#2563eb;">${m.totalContacts} contacts</span>
                </li>
            `).join('');
        const topHtml = `
            <div style="background:#f9fafb;border-radius:16px;padding:20px 24px;margin-bottom:24px;border:1px solid #f3f4f6;">
                <div style="font-size:10px;font-weight:900;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">Top 5 Performers</div>
                <ol style="margin:0;padding-left:18px;">${topPerformers}</ol>
            </div>
        `;
        win.document.write(`
            <html><head><title>${pvTitle}</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1a1a1a; }
                h1 { font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; border-bottom: 3px solid #000; padding-bottom: 12px; }
                pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; line-height: 1.8; }
                .meta { font-size: 12px; color: #666; margin-bottom: 24px; }
            </style></head>
            <body>
                <h1>${pvTitle}</h1>
                <p class="meta">Date: ${new Date().toLocaleDateString('fr-DZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} &nbsp;|&nbsp; FLER &mdash; Secrétariat</p>
                ${summaryHtml}
                ${topHtml}
                <pre>${pvContent || '(vide)'}</pre>
            </body></html>`);
        win.document.close();
        win.print();
    };

    const SortIcon = ({ k }: { k: SortKey }) => (
        sortKey === k
            ? sortDir === 'desc' ? <ChevronDown size={12} className="text-primary" /> : <ChevronUp size={12} className="text-primary" />
            : <ChevronDown size={12} className="text-gray-300" />
    );

    const convRate = globalStats.totalContacts > 0
        ? Math.round((globalStats.totalSigned / globalStats.totalContacts) * 100) : 0;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
                <p className="text-gray-500 font-medium animate-pulse">Loading Secretary Hub...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">

            {/* ── Header ── */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <FileText size={28} />
                        </div>
                        <h1 className="text-4xl font-black text-text tracking-tight uppercase">Secretary Hub</h1>
                    </div>
                    <p className="text-gray-500 font-medium ml-1">
                        Progress tracking, member analytics & PV generation.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                        <span className="font-semibold">{refreshing ? 'Refreshing…' : 'Sync'}</span>
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm active:scale-95 text-gray-700"
                    >
                        <Download size={18} />
                        <span className="font-semibold">Export CSV</span>
                    </button>
                    <button
                        onClick={() => setIsPVOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95"
                    >
                        <FileText size={18} />
                        <span className="font-semibold">Write PV</span>
                    </button>
                </div>
            </div>

            {/* ── Global Stats Grid ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard icon={<Users className="text-blue-600" />} label="Members" value={globalStats.totalMembers} color="blue" />
                <StatCard icon={<Building2 className="text-purple-600" />} label="Companies" value={globalStats.totalContacts} color="purple" />
                <StatCard icon={<Calendar className="text-indigo-600" />} label="Events" value={globalStats.totalEvents} color="indigo" />
                <StatCard icon={<CheckCircle2 className="text-emerald-600" />} label="Signed" value={globalStats.totalSigned} color="emerald" />
                <StatCard icon={<Clock className="text-orange-600" />} label="Pending" value={globalStats.totalPending} color="orange" />
                <StatCard icon={<TrendingUp className="text-rose-600" />} label="Conv. Rate" value={`${convRate}%`} color="rose" />
            </div>

            {/* ── Method Breakdown ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact methods distribution */}
                <Card className="p-6 border-none shadow-xl">
                    <h3 className="text-sm font-black text-text uppercase tracking-widest mb-5 flex items-center gap-2">
                        <BarChart3 size={16} className="text-primary" /> Contact Method Breakdown
                    </h3>
                    <div className="space-y-4">
                        <MethodBar icon={<Phone size={14} />} label="Call" count={globalStats.callTotal} total={globalStats.totalContacts} color="bg-emerald-500" iconColor="text-emerald-600" />
                        <MethodBar icon={<Mail size={14} />} label="Email" count={globalStats.emailTotal} total={globalStats.totalContacts} color="bg-blue-500" iconColor="text-blue-600" />
                        <MethodBar icon={<Linkedin size={14} />} label="LinkedIn" count={globalStats.linkedinTotal} total={globalStats.totalContacts} color="bg-sky-500" iconColor="text-sky-600" />
                        <MethodBar icon={<Coffee size={14} />} label="Outing" count={globalStats.outingTotal} total={globalStats.totalContacts} color="bg-amber-500" iconColor="text-amber-600" />
                        <MethodBar icon={<Share2 size={14} />} label="Social Media" count={globalStats.socialTotal} total={globalStats.totalContacts} color="bg-pink-500" iconColor="text-pink-600" />
                    </div>
                </Card>

                {/* Pipeline status */}
                <Card className="p-6 border-none shadow-xl">
                    <h3 className="text-sm font-black text-text uppercase tracking-widest mb-5 flex items-center gap-2">
                        <Target size={16} className="text-primary" /> Pipeline Status
                    </h3>
                    <div className="space-y-4">
                        <StatusBar icon={<AlertCircle size={14} />} label="Contacted" count={globalStats.totalContacted} total={globalStats.totalContacts} color="bg-blue-400" iconColor="text-blue-500" />
                        <StatusBar icon={<Clock size={14} />} label="Pending" count={globalStats.totalPending} total={globalStats.totalContacts} color="bg-orange-400" iconColor="text-orange-500" />
                        <StatusBar icon={<CheckCircle2 size={14} />} label="Signed" count={globalStats.totalSigned} total={globalStats.totalContacts} color="bg-emerald-400" iconColor="text-emerald-500" />
                        <StatusBar icon={<XCircle size={14} />} label="Rejected" count={globalStats.totalRejected} total={globalStats.totalContacts} color="bg-red-400" iconColor="text-red-500" />
                        <StatusBar icon={<Activity size={14} />} label="Logistics Items" count={globalStats.logisticsContacts} total={globalStats.logisticsContacts + globalStats.totalContacts} color="bg-purple-400" iconColor="text-purple-500" />
                    </div>
                </Card>
            </div>

            {/* ── Member Table ── */}
            <Card className="overflow-hidden border-none shadow-2xl bg-white/70 backdrop-blur-xl ring-1 ring-black/5">
                {/* Table Header Controls */}
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <Users size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-text uppercase">Member Progress</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{filtered.length} members shown</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search member by name, email..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-9 pr-8 py-2 bg-gray-100/50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 w-full sm:w-60 text-sm font-semibold"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Clear search"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <select
                                value={filterTeam}
                                onChange={e => setFilterTeam(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-gray-100/50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-sm font-semibold cursor-pointer"
                            >
                                <option value="all">All Teams</option>
                                <option value="sponsoring">Sponsoring</option>
                                <option value="logistics">Logistics</option>
                                <option value="both">Both</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* ── Mobile card list (< md) ── */}
                <div className="block md:hidden divide-y divide-gray-100 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {filtered.length > 0 ? filtered.map((member) => (
                        <div
                            key={member.id}
                            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => { setSelectedMember(member); setIsMemberDetailOpen(true); }}
                        >
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-text text-sm truncate">{member.full_name || 'Anonymous'}</p>
                                    <p className="text-[11px] text-gray-400 truncate">{member.email}</p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <Badge variant="default" className={
                                        member.team === 'sponsoring' ? 'bg-blue-500/10 text-blue-600 border-none text-[9px] font-black' :
                                        member.team === 'logistics' ? 'bg-purple-500/10 text-purple-600 border-none text-[9px] font-black' :
                                        member.team === 'both' ? 'bg-emerald-500/10 text-emerald-600 border-none text-[9px] font-black' :
                                        'bg-gray-500/10 text-gray-400 border-none text-[9px] font-black'
                                    }>{member.team?.toUpperCase() || '—'}</Badge>
                                    {member.email && (
                                        <a
                                            href={`mailto:${member.email}?subject=FLER — Update`}
                                            onClick={e => e.stopPropagation()}
                                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600"
                                        ><Mail size={14} /></a>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-black text-primary bg-primary/5 px-2 py-0.5 rounded-lg">{member.totalContacts} total</span>
                                {member.call > 0 && <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">📞 {member.call}</span>}
                                {member.emailMethod > 0 && <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg">✉️ {member.emailMethod}</span>}
                                {member.linkedin > 0 && <span className="text-xs font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg">in {member.linkedin}</span>}
                                {member.outing > 0 && <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg">☕ {member.outing}</span>}
                                {member.social_media > 0 && <span className="text-xs font-black text-pink-700 bg-pink-50 px-2 py-0.5 rounded-lg">📱 {member.social_media}</span>}
                                {member.signed > 0 && <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">✔ {member.signed} signed</span>}
                            </div>
                        </div>
                    )) : (
                        <p className="text-center py-12 text-gray-400 font-black uppercase tracking-widest text-xs">No members found</p>
                    )}
                </div>

                {/* ── Desktop table (≥ md) ── */}
                <div className="hidden md:block">
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-white/90 backdrop-blur-md z-20">
                                <tr className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-gray-50">
                                    <th className="px-6 py-4">
                                        <button onClick={() => handleSort('full_name')} className="flex items-center gap-1 hover:text-primary transition-colors">
                                            Member <SortIcon k="full_name" />
                                        </button>
                                    </th>
                                    <th className="px-4 py-4 text-center">Team</th>
                                    <th className="px-4 py-4 text-center">
                                        <button onClick={() => handleSort('totalContacts')} className="flex items-center gap-1 mx-auto hover:text-primary transition-colors">
                                            Total <SortIcon k="totalContacts" />
                                        </button>
                                    </th>
                                    <th className="px-3 py-4 text-center text-emerald-500">Call</th>
                                    <th className="px-3 py-4 text-center text-blue-500">Email</th>
                                    <th className="px-3 py-4 text-center text-sky-500">LinkedIn</th>
                                    <th className="px-3 py-4 text-center text-amber-500">Outing</th>
                                    <th className="px-3 py-4 text-center text-pink-500">Social</th>
                                    <th className="px-4 py-4 text-center">
                                        <button onClick={() => handleSort('signed')} className="flex items-center gap-1 mx-auto hover:text-primary transition-colors">
                                            Signed <SortIcon k="signed" />
                                        </button>
                                    </th>
                                    <th className="px-4 py-4 text-center">
                                        <button onClick={() => handleSort('ranking')} className="flex items-center gap-1 mx-auto hover:text-primary transition-colors">
                                            Score <SortIcon k="ranking" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.length > 0 ? filtered.map((member) => (
                                    <tr
                                        key={member.id}
                                        className="hover:bg-gray-50/80 transition-all duration-200 group cursor-pointer"
                                        onClick={() => { setSelectedMember(member); setIsMemberDetailOpen(true); }}
                                    >
                                        {/* Member info */}
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-black text-text text-sm leading-tight">{member.full_name || 'Anonymous'}</p>
                                                <p className="text-[11px] text-gray-400 font-medium mt-0.5 truncate max-w-[200px]">{member.email}</p>
                                            </div>
                                        </td>

                                        {/* Team badge */}
                                        <td className="px-4 py-4 text-center">
                                            <Badge variant="default" className={
                                                member.team === 'sponsoring' ? 'bg-blue-500/10 text-blue-600 border-none px-2 font-black text-[9px]' :
                                                member.team === 'logistics' ? 'bg-purple-500/10 text-purple-600 border-none px-2 font-black text-[9px]' :
                                                member.team === 'both' ? 'bg-emerald-500/10 text-emerald-600 border-none px-2 font-black text-[9px]' :
                                                'bg-gray-500/10 text-gray-400 border-none px-2 font-black text-[9px]'
                                            }>
                                                {member.team?.toUpperCase() || '—'}
                                            </Badge>
                                        </td>

                                        {/* Total contacts with mini bar */}
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-base font-black text-primary">{member.totalContacts}</span>
                                                <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full transition-all"
                                                        style={{ width: `${Math.min((member.totalContacts / Math.max(...members.map(m => m.totalContacts), 1)) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        {/* Method counts */}
                                        <td className="px-3 py-4 text-center">
                                            <MethodPill value={member.call} color="emerald" />
                                        </td>
                                        <td className="px-3 py-4 text-center">
                                            <MethodPill value={member.emailMethod} color="blue" />
                                        </td>
                                        <td className="px-3 py-4 text-center">
                                            <MethodPill value={member.linkedin} color="sky" />
                                        </td>
                                        <td className="px-3 py-4 text-center">
                                            <MethodPill value={member.outing} color="amber" />
                                        </td>
                                        <td className="px-3 py-4 text-center">
                                            <MethodPill value={member.social_media} color="pink" />
                                        </td>

                                        {/* Signed */}
                                        <td className="px-4 py-4 text-center">
                                            <span className={`text-sm font-black ${member.signed > 0 ? 'text-emerald-600' : 'text-gray-300'}`}>
                                                {member.signed}
                                            </span>
                                        </td>

                                        {/* Ranking */}
                                        <td className="px-4 py-4 text-center">
                                            <span className="text-sm font-black text-text">{member.ranking || 0}</span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-2">
                                                {member.email && (
                                                    <a
                                                        href={`mailto:${member.email}?subject=FLER — Update`}
                                                        title={`Send email to ${member.full_name}`}
                                                        className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all duration-200"
                                                    >
                                                        <Mail size={16} />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => { setSelectedMember(member); setIsMemberDetailOpen(true); }}
                                                    title="View details"
                                                    className="p-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 hover:scale-110 transition-all duration-200"
                                                >
                                                    <BarChart3 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={11} className="px-6 py-16 text-center text-gray-400 font-black uppercase tracking-widest text-xs">
                                            No members found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Table footer */}
                <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                        {filtered.length} of {members.length} members
                    </span>
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                        Click a row to view detailed breakdown
                    </span>
                </div>
            </Card>

            {/* ── PV Modal ── */}
            <Modal isOpen={isPVOpen} onClose={() => setIsPVOpen(false)} title="WRITE PV — PROCÈS-VERBAL" size="lg">
                <div className="p-4 space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">PV Title</label>
                        <input
                            type="text"
                            value={pvTitle}
                            onChange={e => setPvTitle(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Auto-generated stats summary */}
                    <div className="bg-gray-50 rounded-2xl p-5 space-y-3 border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Auto-generated Summary</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <SummaryBlock label="Total Companies" value={globalStats.totalContacts} />
                            <SummaryBlock label="Signed" value={globalStats.totalSigned} />
                            <SummaryBlock label="Members" value={globalStats.totalMembers} />
                            <SummaryBlock label="Conv. Rate" value={`${convRate}%`} />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-gray-200">
                            <SummaryBlock label="Calls" value={globalStats.callTotal} />
                            <SummaryBlock label="Emails" value={globalStats.emailTotal} />
                            <SummaryBlock label="LinkedIn" value={globalStats.linkedinTotal} />
                            <SummaryBlock label="Outings" value={globalStats.outingTotal} />
                            <SummaryBlock label="Social" value={globalStats.socialTotal} />
                        </div>
                    </div>

                    {/* Top performers auto-list */}
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Top 5 Performers</p>
                        <ol className="space-y-2">
                            {[...members]
                                .sort((a, b) => (b.totalContacts - a.totalContacts))
                                .slice(0, 5)
                                .map((m, i) => (
                                    <li key={m.id} className="flex items-center justify-between text-sm">
                                        <span className="font-black text-text">
                                            <span className="text-gray-400 mr-2">{i + 1}.</span>{m.full_name || 'N/A'}
                                        </span>
                                        <span className="font-black text-primary">{m.totalContacts} contacts</span>
                                    </li>
                                ))}
                        </ol>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Meeting Notes & Decisions</label>
                        <textarea
                            value={pvContent}
                            onChange={e => setPvContent(e.target.value)}
                            rows={8}
                            placeholder="Write decisions, discussions, action items, attendance, etc…"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                        <button
                            onClick={() => setIsPVOpen(false)}
                            className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                        >
                            Close
                        </button>
                        <button
                            onClick={handlePrintPV}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all"
                        >
                            <Printer size={18} />
                            Print / Export PDF
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── Member Detail Modal ── */}
            <Modal
                isOpen={isMemberDetailOpen}
                onClose={() => setIsMemberDetailOpen(false)}
                title={`${selectedMember?.full_name?.toUpperCase() || 'MEMBER'} — DETAIL`}
                size="md"
            >
                {selectedMember && (
                    <div className="p-4 space-y-5">
                        {/* Info */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-black text-text text-lg">{selectedMember.full_name}</p>
                                <p className="text-sm text-gray-400">{selectedMember.email}</p>
                            </div>
                            <Badge variant="default" className={
                                selectedMember.team === 'sponsoring' ? 'bg-blue-500/10 text-blue-600 border-none font-black' :
                                selectedMember.team === 'logistics' ? 'bg-purple-500/10 text-purple-600 border-none font-black' :
                                'bg-emerald-500/10 text-emerald-600 border-none font-black'
                            }>
                                {selectedMember.team?.toUpperCase() || 'N/A'}
                            </Badge>
                        </div>

                        {/* KPIs */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-primary/5 rounded-2xl p-4 text-center">
                                <p className="text-2xl font-black text-primary">{selectedMember.totalContacts}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Total</p>
                            </div>
                            <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                                <p className="text-2xl font-black text-emerald-600">{selectedMember.signed}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Signed</p>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-4 text-center">
                                <p className="text-2xl font-black text-text">{selectedMember.ranking || 0}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Score</p>
                            </div>
                        </div>

                        {/* Method breakdown */}
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Contact Breakdown</p>
                            <div className="space-y-3">
                                <DetailBar icon={<Phone size={14} />} label="Call" value={selectedMember.call} total={selectedMember.totalContacts} color="bg-emerald-500" iconColor="text-emerald-600" />
                                <DetailBar icon={<Mail size={14} />} label="Email" value={selectedMember.emailMethod} total={selectedMember.totalContacts} color="bg-blue-500" iconColor="text-blue-600" />
                                <DetailBar icon={<Linkedin size={14} />} label="LinkedIn" value={selectedMember.linkedin} total={selectedMember.totalContacts} color="bg-sky-500" iconColor="text-sky-600" />
                                <DetailBar icon={<Coffee size={14} />} label="Outing" value={selectedMember.outing} total={selectedMember.totalContacts} color="bg-amber-500" iconColor="text-amber-600" />
                                <DetailBar icon={<Share2 size={14} />} label="Social Media" value={selectedMember.social_media} total={selectedMember.totalContacts} color="bg-pink-500" iconColor="text-pink-600" />
                            </div>
                        </div>

                        {/* Pipeline */}
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Pipeline Status</p>
                            <div className="grid grid-cols-4 gap-2">
                                <PipelinePill label="Contacted" count={selectedMember.contacted} color="blue" />
                                <PipelinePill label="Pending" count={selectedMember.pending} color="orange" />
                                <PipelinePill label="Signed" count={selectedMember.signed} color="emerald" />
                                <PipelinePill label="Rejected" count={selectedMember.rejected} color="red" />
                            </div>
                        </div>

                        {/* Email action */}
                        {selectedMember.email && (
                            <a
                                href={`mailto:${selectedMember.email}?subject=FLER — Suivi Contacts`}
                                className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-2xl font-black text-sm hover:bg-primary/90 transition-all"
                            >
                                <Mail size={16} /> Send Email to {selectedMember.full_name?.split(' ')[0]}
                            </a>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

/* ─────────────────────── Sub-components ─────────────────────── */

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) => {
    const colors: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        orange: 'bg-orange-50 text-orange-600',
        rose: 'bg-rose-50 text-rose-600',
    };
    return (
        <Card className="p-5 border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
                {icon}
            </div>
            <p className="text-2xl font-black text-text">{value}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{label}</p>
        </Card>
    );
};

const MethodBar = ({ icon, label, count, total, color, iconColor }: any) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 ${iconColor} text-sm font-black`}>
                    {icon} {label}
                </div>
                <span className="text-sm font-black text-text">{count} <span className="text-gray-400 font-medium text-xs">({pct}%)</span></span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className={`${color} h-full rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

const StatusBar = ({ icon, label, count, total, color, iconColor }: any) => (
    <MethodBar icon={icon} label={label} count={count} total={total} color={color} iconColor={iconColor} />
);

const MethodPill = ({ value, color }: { value: number; color: string }) => {
    if (value === 0) return <span className="text-xs text-gray-200 font-bold">—</span>;
    const colors: Record<string, string> = {
        emerald: 'bg-emerald-50 text-emerald-700',
        blue: 'bg-blue-50 text-blue-700',
        sky: 'bg-sky-50 text-sky-700',
        amber: 'bg-amber-50 text-amber-700',
        pink: 'bg-pink-50 text-pink-700',
    };
    return (
        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-black ${colors[color]}`}>{value}</span>
    );
};

const DetailBar = ({ icon, label, value, total, color, iconColor }: any) => {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
                <span className={`flex items-center gap-1.5 font-bold ${iconColor}`}>{icon}{label}</span>
                <span className="font-black text-text">{value} <span className="text-gray-400 text-xs font-medium">({pct}%)</span></span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className={`${color} h-full rounded-full`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

const PipelinePill = ({ label, count, color }: { label: string; count: number; color: string }) => {
    const colors: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-700',
        orange: 'bg-orange-50 text-orange-700',
        emerald: 'bg-emerald-50 text-emerald-700',
        red: 'bg-red-50 text-red-700',
    };
    return (
        <div className={`${colors[color]} rounded-xl p-3 text-center`}>
            <p className="text-xl font-black">{count}</p>
            <p className="text-[9px] font-black uppercase tracking-widest mt-0.5 opacity-70">{label}</p>
        </div>
    );
};

const SummaryBlock = ({ label, value }: { label: string; value: string | number }) => (
    <div className="bg-white rounded-xl p-3 text-center shadow-sm">
        <p className="text-lg font-black text-text">{value}</p>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{label}</p>
    </div>
);


