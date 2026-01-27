import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Download, Check, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { mockEvents } from '../lib/mockData';
import { Button } from '../components/ui/Button';
import type { Event } from '../lib/types';

export const EventDossier = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEvent(id);
    }
  }, [id]);

  const fetchEvent = async (eventId: string) => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;

      if (data) {
        const dbEvent = data as any;
        setEvent({
          id: dbEvent.id,
          name: dbEvent.name,
          date: dbEvent.created_at,
          status: dbEvent.status as any || 'planned',
          description: 'No description available',
          logo: EVENT_LOGOS[dbEvent.name]
        });
      } else {
        // Fallback to mock if query succeeds but no data found (rare with single())
        const mock = mockEvents.find(e => e.id === eventId);
        if (mock) setEvent({ ...mock, logo: EVENT_LOGOS[mock.name] || mock.logo });
      }
    } catch (err) {
      console.error('Error fetching event for dossier:', err);
      // Fallback to mock on error
      const mock = mockEvents.find(e => e.id === eventId);
      if (mock) setEvent({ ...mock, logo: EVENT_LOGOS[mock.name] || mock.logo });
    } finally {
      setLoading(false);
    }
  };

  // Templates configuration
  const EVENT_LOGOS: Record<string, string> = {
    'AEC': '/AEC.png',
    'Polymaze': '/polymaze.png',
    'Charity': '/charity.png',
  };

  const EVENT_TEMPLATES: Record<string, string> = {
    'AEC': `Madame, Monsieur,
    Nous avons l’honneur de solliciter le sponsoring de votre entreprise pour l’Algerian Engineering Competition (AEC) 2026, un événement national organisé par le VISION & INNOVATION CLUB, prévu pour se tenir en mai 2026.

L’AEC fera son retour en rassemblant des talents en ingénierie, des étudiants, de jeunes diplômés, des chercheurs et des entrepreneurs. La compétition se déroulera dans six (06) wilayas et s’articulera autour de deux phases : des qualifications régionales, suivies d’une finale nationale mettant en lumière les projets les plus innovants.

Cette initiative vise à promouvoir l’innovation, l’expertise technique et l’esprit entrepreneurial à travers la conception de solutions répondant à des enjeux stratégiques, avec l’accompagnement de professionnels et d’experts du domaine.

Le sponsoring de votre entreprise constituerait un partenariat stratégique à forte valeur ajoutée, contribuant à renforcer la portée nationale de l’événement, sa visibilité médiatique, ainsi que son impact sur le développement de l’innovation et de l’entrepreneuriat chez les jeunes talents algériens.`,

    'GALA': `Madame, Monsieur,
     Nous avons l’honneur de solliciter le sponsoring de votre entreprise pour l’Engineers’ GALA 2026, un événement prestigieux organisé par le VISION & INNOVATION CLUB, prévu pour se tenir en novembre 2026.

Cette rencontre réunira les futurs leaders de l’industrie algérienne, des experts de renom, des chercheurs, des anciens diplômés ainsi que de jeunes lauréats, dans un cadre propice à l’échange de connaissances, au partage des meilleures pratiques et à l’établissement de relations professionnelles durables.

Elle constitue également une plateforme privilégiée permettant aux jeunes diplômés de se démarquer et d’explorer de nouvelles opportunités de carrière au sein d’un environnement professionnel stimulant.

Pour cette édition, un accent particulier sera mis sur les domaines de l’intelligence artificielle, de l’entrepreneuriat, ainsi que sur le networking, afin de proposer un événement ciblé et à forte valeur ajoutée pour l’ensemble des participants.

Le sponsoring de votre entreprise contribuerait significativement à renforcer l’impact et la visibilité de cet événement, tout en soutenant le développement des compétences, l’innovation et la collaboration au sein de la communauté des ingénieurs algériens.`,
 
    'Polymaze': `Madame, Monsieur,
    Nous avons l’honneur de solliciter le sponsoring de votre entreprise pour Polymaze 2026, une prestigieuse compétition de robotique organisée par le VISION & INNOVATION CLUB, prévue entre fin juin et juillet 2026.

Cet événement de deux jours encourage la créativité, la compétition et le travail en équipe en mettant les participants au défi de concevoir des robots autonomes capables de résoudre un labyrinthe dans un temps imparti, mobilisant ainsi leurs compétences en mécanique, électronique et automatisation.

En s’appuyant sur l’expérience des éditions précédentes et en améliorant continuellement les différents aspects de la compétition, Polymaze ambitionne de devenir un événement régional de référence, offrant aux passionnés de technologie une plateforme pour valoriser leurs talents, favoriser l’échange d’idées innovantes entre élèves et étudiants, et susciter l’intérêt du grand public pour la robotique.

Le sponsoring de votre entreprise contribuerait significativement à renforcer l’impact et la visibilité de cet événement, tout en soutenant la promotion de l’innovation technologique et du développement des compétences auprès de la jeunesse algérienne.`,
    
  };

  const getSponsorshipTemplate = (evt: Event) => {
    // Check if there is a specific template for this event name
    if (EVENT_TEMPLATES[evt.name]) {
      return EVENT_TEMPLATES[evt.name];
    }

    // Also check by ID if needed, though name is more readable
    if (EVENT_TEMPLATES[evt.id]) {
      return EVENT_TEMPLATES[evt.id as string];
    }

    // Generic fallback template
    return `Madame, Monsieur,

Dans le cadre de l’organisation de ${evt.name}, nous sollicitons votre soutien en tant que sponsor.

Notre événement vise à encourager l’innovation et à renforcer les liens entre les étudiants et le monde professionnel.

En devenant partenaire, votre entreprise bénéficiera d’une visibilité stratégique.

Nous restons à votre disposition pour toute information complémentaire.

Dans l’attente de votre retour, veuillez agréer, Madame, Monsieur, l’expression de nos salutations distinguées.`;
  };

  const handleCopyTemplate = () => {
    if (!event) return;
    const text = getSponsorshipTemplate(event);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      // Fallback for simple link download (cross-origin might fail to download and just open)
      const link = document.createElement('a');
      link.href = event.logo;
      link.target = '_blank';
      link.download = `${event.name}_logo`; // Hint
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/events')}
        className="flex items-center gap-2 text-gray-500 hover:text-text transition-colors"
      >
        <ArrowLeft size={18} /> Back to Events
      </button>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {/* Tools Section */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
                Sponsorship Request Letter
              </h3>
              <Button onClick={handleCopyTemplate} size="sm" title="Copy to clipboard" className="shadow-lg h-8 text-xs shrink-0">
                {copied ? <><Check size={14} className="mr-1" /> Copied</> : <><Copy size={14} className="mr-1" /> Copy Template</>}
              </Button>
            </div>

            <div className="relative group">
              <div className="bg-gray-50 border px-4 py-3 rounded-lg text-gray-600 text-sm font-medium h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                {getSponsorshipTemplate(event)}
              </div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">2</span>
              Event Assets
            </h3>
            <p className="text-sm text-gray-500">Download the official event logo for your documents.</p>

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
      </div>
    </div>
  );
};
