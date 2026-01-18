import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { mockTeams } from '../lib/mockData';
import type { Team } from '../lib/types';

export const Teams = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamStats();
  }, []);

  const fetchTeamStats = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('team');

      if (error) throw error;

      if (profiles) {
        // Count members per team
        const counts: Record<string, number> = {};
        profiles.forEach((p: any) => {
          if (p.team) {
            counts[p.team] = (counts[p.team] || 0) + 1;
          }
        });

        // Update teams with real counts
        setTeams(prevTeams => prevTeams.map(t => {
          // Check for count by ID ('1', '2') or Name ('Logistics', etc) or lowercase
          const realCount = counts[t.id] || counts[t.name] || counts[t.name.toLowerCase()] || 0;
          return {
            ...t,
            memberCount: realCount
          };
        }));
      }
    } catch (error) {
      console.error('Error fetching team stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamClick = (teamId: string, teamName: string) => {
    if (teamName.toLowerCase() === 'logistics') {
      navigate('/teams/logistics');
    } else if (teamName.toLowerCase() === 'sponsoring') {
      navigate('/teams/sponsoring');
    } else {
      navigate(`/teams/${teamId}/report`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0 w-full">
      <header className="space-y-2 md:space-y-3">
        <h1 className="text-2xl md:text-4xl font-bold text-text">Teams</h1>
        <p className="text-sm md:text-base text-gray-500">Select a team to view details or file reports.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {teams.map((team) => (
          <div 
            key={team.id}
            onClick={() => handleTeamClick(team.id, team.name)}
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-5 md:p-6 rounded-2xl cursor-pointer group bg-white hover:bg-gradient-to-br hover:from-white hover:to-gray-50/50 hover:scale-105 transform"
          >
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div className="p-2 md:p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg text-primary group-hover:shadow-lg transition-all">
                <Users size={20} className="md:w-6 md:h-6" />
              </div>
              <span className="bg-gray-100 text-gray-600 px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap">
                {team.memberCount} Members
              </span>
            </div>

            <h3 className="text-lg md:text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">{team.name}</h3>
            <p className="text-xs md:text-sm text-gray-500 mb-6 md:mb-8 line-clamp-2 md:line-clamp-3 min-h-[2.5rem]">{team.description}</p>

            <div className="flex items-center text-primary font-medium text-xs md:text-sm gap-1 group-hover:gap-2 transition-all">
              View Dashboard <ChevronRight size={16} className="md:w-5 md:h-5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
