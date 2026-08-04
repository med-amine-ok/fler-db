import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Copy, Download, Check, Loader2, Calendar, Target, 
  Plus, ClipboardCheck, AlertCircle, ArrowUpRight, Filter, Hotel, Home, Coffee, Gift, Truck, CircleDot
} from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import type { Event, Company, Resource } from '../lib/types';

export const EventDossier = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'sponsoring' | 'logistics'  | 'documents' | 'stats'>('overview');
  
  // Copy state
  const [copied, setCopied] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Event specific data
  const [companies, setCompanies] = useState<Company[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [logisticsTypeFilter, setLogisticsTypeFilter] = useState<string>('all');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchEventData(id);
    }
  }, [id]);

  const fetchEventData = async (eventId: string) => {
    setLoading(true);
    try {
      // 1. Fetch Event
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      let currentEvent: Event;

      if (eventData) {
        currentEvent = {
          id: (eventData as any).id,
          name: (eventData as any).name,
          date: (eventData as any).created_at,
          status: (eventData as any).status as any || 'planned',
          description: (eventData as any).description || 'No description available.',
          logo: EVENT_LOGOS[(eventData as any).name]
        };
      } else {
        throw new Error('Event not found');
      }
      setEvent(currentEvent);

      // 2. Fetch Companies assigned to this event
      const { data: companiesData } = await supabase
        .from('companies')
        .select('*, profiles(full_name)')
        .eq('event_id', parseInt(eventId));

      if (companiesData && companiesData.length > 0) {
        setCompanies((companiesData as any[]).map(c => ({
          id: c.id,
          name: c.name,
          status: c.status,
          eventId: eventId,
          assignedTo: c.profiles?.full_name || 'Unassigned',
          contactMethod: c.contact_method,
          notes: c.notes,
          createdAt: c.created_at
        })));
      } else {
        setCompanies([]);
      }

      // 3. Fetch Logistics
      const { data: logisticsData } = await supabase
        .from('logistics')
        .select('*, profiles(full_name)');

      if (logisticsData && logisticsData.length > 0) {
        setResources((logisticsData as any[]).map((l: any) => ({
          id: l.id,
          name: l.name,
          type: l.type as any,
          status: l.status,
          assignedTo: l.profiles?.full_name || 'Unassigned',
          notes: l.notes,
          createdAt: l.created_at
        })));
      } else {
        setResources([]);
      }

      // 4. Fetch Team profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, role, team');

      if (profilesData && profilesData.length > 0) {
        setTeamMembers(profilesData.slice(0, 5));
      } else {
        setTeamMembers([]);
      }

    } catch (err) {
      console.error('Error fetching event details:', err);
      setEvent(null);
      setCompanies([]);
      setResources([]);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const EVENT_LOGOS: Record<string, string> = {
    'AEC': '/AEC.png',
    'Polymaze': '/polymaze.png',
    'Charity': '/charity.png',
    'GALA': '/gala.svg',
    'STEPS': '/STEPS LOGO-01.png',
    'MasterClass': '/masterclass04.png',
  };

 const EVENT_COVER_GRADIENTS: Record<string, string> = {
  'AEC': 'from-slate-100 to-blue-100',
  'GALA': 'from-slate-900 to-black',
  'Polymaze': 'from-orange-50 to-amber-100',
  'Charity': 'from-rose-50 to-pink-100',
  'STEPS': 'from-gray-100 to-slate-200',
  'MasterClass': 'from-teal-900 to-slate-900',
};

  const EVENT_TEMPLATES: Record<string, string> = {
    'AEC': `Madame, Monsieur,
Nous avons l’honneur de solliciter le sponsoring de votre entreprise pour l’Algerian Engineering Competition (AEC) 2026, un événement national organisé par le VISION & INNOVATION CLUB, prévu pour se tenir en mai 2026.

L’AEC fera son retour en rassemblant des talents en ingénierie, des étudiants, de jeunes diplômés, des chercheurs et des entrepreneurs. La compétition se déroulera dans six (06) wilayas et s’articulera autour de deux phases : des qualifications régionales, suivies d’une finale nationale mettant en lumière les projets les plus innovants.

Le sponsoring de votre entreprise constituerait un partenariat stratégique à forte valeur ajoutée, contribuant à renforcer la portée nationale de l’événement, sa visibilité médiatique, ainsi que son impact sur le développement de l’innovation et de l’entrepreneuriat chez les jeunes talents algériens.`,

    'Polymaze': `Madame, Monsieur,
Nous avons l’honneur de solliciter le sponsoring de votre entreprise pour Polymaze 2026, une prestigieuse compétition de robotique organisée par le VISION & INNOVATION CLUB, prévue entre fin juin et juillet 2026.

Cet événement de deux jours encourage la créativité, la compétition et le travail en équipe en mettant les participants au défi de concevoir des robots autonomes capables de résoudre un labyrinthe, mobilisant ainsi leurs compétences en mécanique, électronique et automatisation.

Le sponsoring de votre entreprise contribuerait significativement à renforcer l’impact et la visibilité de cet événement, tout en soutenant la promotion de l’innovation technologique auprès de la jeunesse algérienne.`,

    'GALA': `rahi fl drive`,

    'STEPS': `mzl`,

    'MasterClass': `mzl`,

    'Charity': `Madame, Monsieur,
Nous avons l’honneur de solliciter le sponsoring de votre entreprise pour notre événement Charity 2026, l'action sociale et humanitaire phare organisée par le VISION & INNOVATION CLUB.

Chaque année, cette initiative mobilise nos membres et partenaires pour collecter des dons et venir en aide aux familles défavorisées durant la saison hivernale, incarnant ainsi les valeurs de solidarité et d'engagement citoyen du club.

Le parrainage de votre entreprise apportera un soutien matériel et financier précieux à ces familles, tout en valorisant votre engagement sociétal (RSE).`,
  };

  const EMAIL_TEMPLATES: Record<string, string> = {
    'AEC': `Bonjour Monsieur,

J’espère que vous allez bien.

Je suis .... étudiante à l’École Nationale Polytechnique d’Alger et chargée des relations extérieures au sein du Vision and Innovation Club.
L’un de nos événements majeurs est l’Algerian Engineering Competition (AEC). AEC est une compétition nationale d’ingénierie organisée simultanément dans plusieurs wilayas du pays. Elle réunit étudiants, jeunes diplômés et passionnés de technologie autour de problématiques réelles proposées par des entreprises. 

Nous souhaitons établir une collaboration avec vous concernant cet événement. N'hésitez pas à nous contacter pour toute information complémentaire.

Cordialement,`,

    'Polymaze': `Bonjour Monsieur,

J’espère que vous allez bien.

Je suis .... étudiante à l’École Nationale Polytechnique d’Alger et chargée des relations extérieures au sein du Vision and Innovation Club.
L’un de nos événements majeurs est Polymaze, une compétition de robotique de référence qui encourage la créativité et le travail d'équipe pour la conception de robots autonomes.

Nous souhaitons établir une collaboration avec vous concernant cet événement.

Cordialement,`,

    'GALA': `Objet:Offre de partenariat - Engineer's Gala 2026
Madame/Monsieur
Je me permets de vous contacter en tant qu'étudiant à l'École National polytechnique
représentant du département des relations extérieures du vision & innovation club (Vic).
.
Nous vous invitons à devenir partenaire de notre 9ème édition de l'Engineers' Gala, qui se
tiendra en octobre 2026. Cet événement rassemblera de nombreux participants, incluant
des étudiants, des ingénieurs diplômés et des professionnels , pour une série de
conférences et de tables rondes visant à encourager le réseautage et les opportunités de
carrière.

Nous serions ravis de vous compter parmi nos partenaires pour cette édition et pensons que
cet événement est une occasion privilégiée pour votre entreprise de rencontrer les talents de
demain et d'augmenter votre visibilité.
Si notre proposition vous intéresse, nous serions heureux de vous transmettre notre
dossier de sponsoring détaillé.
vous remerciant par avance pour l'attention portée à notre demande, je reste à disposition
pour tout complément d'information.

Cordialement,`,

    'STEPS': `mzl`,

    'MasterClass': `mzl`,

    'Charity': `Bonjour Monsieur,

J’espère que vous allez bien.

Je suis .... étudiante à l’École Nationale Polytechnique d’Alger et chargée des relations extérieures au sein du Vision and Innovation Club.
L’un de nos événements de fin d'année les plus importants est Charity, notre initiative caritative annuelle d'aide aux plus démunis.

Nous souhaitons établir une collaboration de solidarité avec vous pour soutenir cette cause.

Cordialement,`,
  };

  const getSponsorshipTemplate = (evt: Event) => {
    return EVENT_TEMPLATES[evt.name] || `Madame, Monsieur,\n\nDans le cadre de l’organisation de ${evt.name}, nous sollicitons votre soutien en tant que sponsor.\n\nNotre événement vise à encourager l’innovation et à renforcer les liens entre les étudiants et le monde professionnel.\n\nNous restons à votre disposition pour toute information complémentaire.`;
  };

  const getEmailTemplate = (evt: Event) => {
    return EMAIL_TEMPLATES[evt.name] || `Bonjour Monsieur,\n\nJ'espère que vous allez bien.\n\nJe suis .... chargée des relations extérieures au sein du Vision and Innovation Club. L'un de nos événements majeurs est ${evt.name}.\n\nNous souhaitons établir une collaboration avec vous concernant cet événement.\n\nCordialement,`;
  };

  const handleCopyTemplate = () => {
    if (!event) return;
    navigator.clipboard.writeText(getSponsorshipTemplate(event));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyEmail = () => {
    if (!event) return;
    navigator.clipboard.writeText(getEmailTemplate(event));
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleDownloadLogo = async () => {
    if (!event?.logo) return;
    try {
      const response = await fetch(event.logo);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${event.name.replace(/\s+/g, '_')}_logo.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      window.open(event.logo, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-bold">Event not found</h2>
        <Button onClick={() => navigate('/events')} className="mt-4">Back to Events</Button>
      </div>
    );
  }

  const gradient = EVENT_COVER_GRADIENTS[event.name] || 'from-gray-700 to-gray-500';

  // Stats calculation
  const totalSponsors = companies.length;
  const signedSponsors = companies.filter(c => c.status === 'signed').length;
  const fundsRaised = signedSponsors * 150000; // estimated 150k DA per contract
  const logisticsBooked = resources.filter(r => r.status === 'booked').length;
  const logisticsPercent = resources.length ? Math.round((logisticsBooked / resources.length) * 100) : 0;
  const completionRate = totalSponsors ? Math.round((signedSponsors / totalSponsors) * 100) : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 px-4 md:px-0">
      {/* Back navigation */}
      <button
        onClick={() => navigate('/events')}
        className="flex items-center gap-2 text-gray-500 hover:text-text transition-colors font-medium text-sm"
      >
        <ArrowLeft size={16} /> Back to Event Workspaces
      </button>

      {/* Cover Header */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${gradient} text-white shadow-xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6`}>
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
        <div className="relative z-10 flex gap-4 items-center">
          <div className="h-16 w-16 bg-white rounded-2xl p-2 flex items-center justify-center shadow-lg">
            {event.logo ? (
              <img src={event.logo} alt={event.name} className="w-full h-full object-contain" />
            ) : (
              <Calendar size={28} className="text-gray-400" />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">{event.name}</h1>
              <Badge className="bg-white/20 text-white border-0">{event.status}</Badge>
            </div>
            <p className="text-white/80 text-sm flex items-center gap-1.5">
              <Calendar size={14} /> Scheduled: {event.date.split('T')[0]}
            </p>
          </div>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/10 text-xs md:text-sm font-semibold flex items-center gap-4">
          <div>
            <span className="block text-white/60 text-[10px] uppercase font-bold">Funds Raised</span>
            <span className="text-white font-extrabold text-base">{fundsRaised.toLocaleString()} DA</span>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div>
            <span className="block text-white/60 text-[10px] uppercase font-bold">Sponsor Success</span>
            <span className="text-white font-extrabold text-base">{signedSponsors} / {totalSponsors}</span>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-gray-200 flex gap-2 md:gap-4 overflow-x-auto pb-px scrollbar-none">
        {(['overview', 'sponsoring', 'logistics', 'documents', 'stats'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3.5 px-3 md:px-4 text-sm font-bold border-b-2 transition-all capitalize whitespace-nowrap ${
              activeTab === tab
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-gray-400 hover:text-text'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="mt-6">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 border-0 shadow-lg rounded-2xl bg-white space-y-4">
                <h3 className="font-bold text-lg text-text">Workspace Description</h3>
                <p className="text-gray-500 leading-relaxed text-sm md:text-base">
                  {event.description || 'Welcome to the unified workspace panel. Here you can keep track of all operational progress for this event, coordinate task management, contact corporate sponsors, assign logistics items, and view live report diagnostics.'}
                </p>
              </Card>

              {/* Quick Tasks status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-5 border-0 shadow-lg rounded-2xl bg-white flex items-center gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                    <Target size={20} />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 font-semibold uppercase">Sponsorship pipeline</span>
                    <span className="font-extrabold text-text text-base">{signedSponsors} Signed Contracts</span>
                  </div>
                </Card>
                <Card className="p-5 border-0 shadow-lg rounded-2xl bg-white flex items-center gap-4">
                  <div className="p-3 bg-secondary/10 text-secondary rounded-xl shrink-0">
                    <ClipboardCheck size={20} />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 font-semibold uppercase">Logistics status</span>
                    <span className="font-extrabold text-text text-base">{logisticsPercent}% items booked</span>
                  </div>
                </Card>
              </div>
            </div>

            {/* Right details sidebar */}
            <div className="space-y-6">
              <Card className="p-5 border-0 shadow-lg rounded-2xl bg-white space-y-4">
                <h3 className="font-bold text-base text-text">Workspace Details</h3>
                <div className="space-y-3 text-xs md:text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-400 font-semibold">Event Name</span>
                    <span className="font-bold text-text">{event.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-400 font-semibold">Scheduled Date</span>
                    <span className="font-bold text-text">{event.date.split('T')[0]}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-400 font-semibold">Event Status</span>
                    <Badge variant={event.status === 'ongoing' ? 'default' : 'success'}>{event.status}</Badge>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400 font-semibold">Team Size</span>
                    <span className="font-bold text-primary">{teamMembers.length} active</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: SPONSORSHIP */}
        {activeTab === 'sponsoring' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="font-bold text-lg text-text">Sponsorship Pipeline</h3>
                <p className="text-xs text-gray-400">List of partners and companies currently targetted for this event.</p>
              </div>
              <Button size="sm" onClick={() => navigate('/teams/sponsoring/1/add')}>
                <Plus size={14} className="mr-1" /> Add Partner Contract
              </Button>
            </div>

            {/* Visual Funnel */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(['contacted', 'pending', 'signed', 'rejected'] as const).map(stage => {
                const count = companies.filter(c => c.status === stage).length;
                return (
                  <Card key={stage} className="p-4 border-0 shadow-md rounded-2xl bg-white text-center space-y-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase">{stage}</span>
                    <h4 className="text-2xl font-black text-text">{count}</h4>
                  </Card>
                );
              })}
            </div>

            <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 font-bold border-b border-gray-100">
                      <th className="p-4 pl-6">Company</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Contact Method</th>
                      <th className="p-4">Assigned Manager</th>
                      
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {companies.length > 0 ? (
                      companies.map((company) => (
                        <tr key={company.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 pl-6 font-bold text-text">{company.name}</td>
                          <td className="p-4">
                            <Badge variant={
                              company.status === 'signed' ? 'success' :
                              company.status === 'contacted' ? 'default' :
                              company.status === 'pending' ? 'outline' : 'error'
                            } className="capitalize">
                              {company.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-gray-500 capitalize">{company.contactMethod || 'Email'}</td>
                          <td className="p-4 text-gray-500">{company.assignedTo}</td>
                         
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400">No sponsorship leads assigned.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: LOGISTICS */}
        {activeTab === 'logistics' && (() => {
          const getResourceIcon = (type?: string) => {
            switch (type?.toLowerCase()) {
              case 'hotel': return <Hotel size={16} className="text-blue-500 shrink-0" />;
              case 'salle': return <Home size={16} className="text-purple-500 shrink-0" />;
              case 'food': return <Coffee size={16} className="text-amber-500 shrink-0" />;
              case 'goodies':
              case 'goodie': return <Gift size={16} className="text-pink-500 shrink-0" />;
              case 'passage': return <Truck size={16} className="text-emerald-500 shrink-0" />;
              default: return <CircleDot size={16} className="text-gray-500 shrink-0" />;
            }
          };

          const filteredResources = resources.filter((res) => {
            if (logisticsTypeFilter === 'all') return true;
            if (logisticsTypeFilter === 'goodie' || logisticsTypeFilter === 'goodies') {
              return res.type === 'goodie' || res.type === 'goodies';
            }
            return res.type?.toLowerCase() === logisticsTypeFilter.toLowerCase();
          });

          return (
            <div className="space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-bold text-lg text-text">Resource & Logistics Log</h3>
                  <p className="text-xs text-gray-400">Materials, venues, and accommodation bookings requested for this event.</p>
                </div>
                <Button size="sm" onClick={() => navigate('/teams/logistics/add')}>
                  <Plus size={14} className="mr-1" /> Add Logistics Request
                </Button>
              </div>

              {/* Type Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs font-semibold text-gray-400 shrink-0 flex items-center gap-1">
                  <Filter size={12} /> Type:
                </span>
                {[
                  { id: 'all', label: 'All Types' },
                  { id: 'hotel', label: 'Hotel' },
                  { id: 'salle', label: 'Salle' },
                  { id: 'food', label: 'Food' },
                  { id: 'goodie', label: 'Goodies' },
                  { id: 'passage', label: 'Passage' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setLogisticsTypeFilter(t.id)}
                    className={clsx(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize whitespace-nowrap",
                      logisticsTypeFilter === t.id
                        ? "bg-primary text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.length > 0 ? (
                  filteredResources.map((res) => (
                    <Card key={res.id} className="p-5 border-0 shadow-lg rounded-2xl bg-white space-y-4">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {getResourceIcon(res.type)}
                          <h4 className="font-bold text-text truncate">{res.name}</h4>
                        </div>
                        <Badge variant={res.status === 'booked' ? 'success' : 'default'} className="uppercase shrink-0">
                          {res.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-xs md:text-sm">
                        <div className="flex justify-between py-0.5 border-b border-gray-50">
                          <span className="text-gray-400">Resource Type</span>
                          <span className="font-semibold text-text capitalize">{res.type}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-gray-400">Allocated To</span>
                          <span className="font-semibold text-text">{res.assignedTo || 'Unassigned'}</span>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-gray-400">
                    <AlertCircle size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm">
                      {resources.length === 0
                        ? "No logistics resources currently allocated."
                        : `No ${logisticsTypeFilter === 'all' ? '' : logisticsTypeFilter} logistics resources found.`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

    

        {/* TAB 5: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="space-y-6 max-w-4xl">
            <div className="glass-card p-6 space-y-4 bg-white">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
                  Sponsorship Request Letter
                </h3>
                <Button onClick={handleCopyTemplate} size="sm" title="Copy to clipboard" className="shadow-lg h-8 text-xs shrink-0">
                  {copied ? <><Check size={14} className="mr-1" /> Copied</> : <><Copy size={14} className="mr-1" /> Copy Letter</>}
                </Button>
              </div>
              <div className="bg-white border px-4 py-3 rounded-lg text-gray-600 text-sm font-medium h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                {getSponsorshipTemplate(event)}
              </div>
            </div>

            <div className="glass-card p-6 space-y-4 bg-white">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">2</span>
                  Email Outreach Template
                </h3>
                <Button onClick={handleCopyEmail} size="sm" title="Copy to clipboard" className="shadow-lg h-8 text-xs shrink-0">
                  {copiedEmail ? <><Check size={14} className="mr-1" /> Copied</> : <><Copy size={14} className="mr-1" /> Copy Email</>}
                </Button>
              </div>
              <div className="bg-white border px-4 py-3 rounded-lg text-gray-600 text-sm font-medium h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner border-green-50">
                {getEmailTemplate(event)}
              </div>
            </div>

            <div className="glass-card p-6 space-y-4 bg-white">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">3</span>
                Official Logo Brand Asset
              </h3>
              <p className="text-sm text-gray-500">Download the official event logo asset for flyers, proposals, and banners.</p>
              <Button
                onClick={handleDownloadLogo}
                className="w-full justify-center gap-2"
                disabled={!event.logo}
              >
                <Download size={18} />
                {event.logo ? 'Download Logo' : 'No Logo Available'}
              </Button>
            </div>
          </div>
        )}

        {/* TAB 5: STATISTICS */}
        {activeTab === 'stats' && (() => {
          // Real calculations from database state
          const totalCompanies = companies.length || 1;
          const contactedCompanies = companies.filter(c => c.status === 'contacted').length;
          const pendingCompanies = companies.filter(c => c.status === 'pending').length;
          const signedCompanies = companies.filter(c => c.status === 'signed').length;
          const rejectedCompanies = companies.filter(c => c.status === 'rejected').length;

          const contactedPct = Math.round((contactedCompanies / totalCompanies) * 100);
          const pendingPct = Math.round((pendingCompanies / totalCompanies) * 100);
          const signedPct = Math.round((signedCompanies / totalCompanies) * 100);
          const rejectedPct = Math.round((rejectedCompanies / totalCompanies) * 100);

          const totalResources = resources.length || 1;
          const bookedResources = resources.filter(r => r.status === 'booked').length;
          const logisticsPct = Math.round((bookedResources / totalResources) * 100);

          // Calculate weekly signed contracts dynamically from DB timestamps
          const weekBuckets = [0, 0, 0, 0]; // W1, W2, W3, W4
          const signedList = companies.filter(c => c.status === 'signed');
          
          if (signedList.length > 0) {
            const sortedDates = signedList
              .map(c => c.createdAt ? new Date(c.createdAt).getTime() : Date.now())
              .sort((a, b) => a - b);
            const firstDate = sortedDates[0];
            const lastDate = sortedDates[sortedDates.length - 1];
            const timeSpan = Math.max(lastDate - firstDate, 1000 * 60 * 60 * 24 * 28); // at least 28 days

            signedList.forEach(c => {
              const t = c.createdAt ? new Date(c.createdAt).getTime() : Date.now();
              const ratio = (t - firstDate) / timeSpan;
              const idx = Math.min(3, Math.floor(ratio * 4));
              weekBuckets[idx] += 1;
            });
          }

          const maxWeekly = Math.max(...weekBuckets, 1);
          // Generate SVG points: viewBox 0 0 400 100
          const xPos = [20, 140, 260, 380];
          const yPos = weekBuckets.map(val => Math.round(85 - (val / maxWeekly) * 65));
          const pathD = `M ${xPos[0]},${yPos[0]} C ${xPos[0]+40},${yPos[0]} ${xPos[1]-40},${yPos[1]} ${xPos[1]},${yPos[1]} C ${xPos[1]+40},${yPos[1]} ${xPos[2]-40},${yPos[2]} ${xPos[2]},${yPos[2]} C ${xPos[2]+40},${yPos[2]} ${xPos[3]-40},${yPos[3]} ${xPos[3]},${yPos[3]}`;

          return (
            <div className="space-y-6">
              {/* Stat Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 border-0 shadow-md bg-white rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Outreach</span>
                  <p className="text-xl md:text-2xl font-black text-text">{companies.length}</p>
                  <span className="text-[11px] text-gray-500 font-medium">Sponsors Targeted</span>
                </Card>
                <Card className="p-4 border-0 shadow-md bg-white rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Signed Deals</span>
                  <p className="text-xl md:text-2xl font-black text-emerald-600">{signedCompanies}</p>
                  <span className="text-[11px] text-emerald-500 font-bold">{signedPct}% Conversion</span>
                </Card>
                <Card className="p-4 border-0 shadow-md bg-white rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Active Pipeline</span>
                  <p className="text-xl md:text-2xl font-black text-blue-600">{pendingCompanies + contactedCompanies}</p>
                  <span className="text-[11px] text-blue-500 font-bold">{pendingPct + contactedPct}% In-Progress</span>
                </Card>
                <Card className="p-4 border-0 shadow-md bg-white rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Logistics Booked</span>
                  <p className="text-xl md:text-2xl font-black text-purple-600">{bookedResources} / {resources.length}</p>
                  <span className="text-[11px] text-purple-500 font-bold">{logisticsPct}% Secured</span>
                </Card>
              </div>

              {/* Main Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weekly Contract Signings (Real DB dynamic chart) */}
                <Card className="p-6 border-0 shadow-lg rounded-2xl bg-white space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <h3 className="font-bold text-lg text-text">Weekly Contract Signings</h3>
                      <Badge variant="success" className="text-[10px] font-bold uppercase">{signedCompanies} Signed Total</Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Calculated from actual database record dates.</p>
                  </div>
                  
                  <div className="w-full h-40 pt-4 relative">
                    <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#127dbb" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#127dbb" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d={`${pathD} L 380,95 L 20,95 Z`}
                        fill="url(#chartGradient)"
                      />
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#127dbb"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      {xPos.map((x, i) => (
                        <g key={i}>
                          <circle cx={x} cy={yPos[i]} r="5" fill="#127dbb" />
                          <circle cx={x} cy={yPos[i]} r="2.5" fill="#ffffff" />
                        </g>
                      ))}
                    </svg>
                  </div>

                  <div className="grid grid-cols-4 text-center text-[10px] font-bold text-gray-500 border-t border-gray-100 pt-3">
                    {weekBuckets.map((val, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <span className="block text-gray-400 uppercase">Week {idx + 1}</span>
                        <span className="block text-xs font-black text-text">{val} {val === 1 ? 'deal' : 'deals'}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Real DB Operational Distribution */}
                <Card className="p-6 border-0 shadow-lg rounded-2xl bg-white space-y-5">
                  <div>
                    <h3 className="font-bold text-lg text-text">Operational Distribution</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Real-time status metrics from current database tables.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Signed */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-gray-600">Sponsorship Signed ({signedCompanies}/{companies.length})</span>
                        <span className="text-emerald-600 font-bold">{signedPct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${signedPct}%` }}></div>
                      </div>
                    </div>

                    {/* Pending & Contacted */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-gray-600">In-Progress Pipeline ({pendingCompanies + contactedCompanies}/{companies.length})</span>
                        <span className="text-primary font-bold">{pendingPct + contactedPct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${pendingPct + contactedPct}%` }}></div>
                      </div>
                    </div>

                    {/* Logistics Procurement */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-gray-600">Logistics Procurement ({bookedResources}/{resources.length})</span>
                        <span className="text-purple-600 font-bold">{logisticsPct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${logisticsPct}%` }}></div>
                      </div>
                    </div>

                    {/* Rejected / Closed */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-gray-600">Closed / Declined Leads ({rejectedCompanies}/{companies.length})</span>
                        <span className="text-gray-400 font-bold">{rejectedPct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-gray-300 h-2.5 rounded-full transition-all duration-500" style={{ width: `${rejectedPct}%` }}></div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
};
