import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';
import { mockTeams } from '../lib/mockData';

export const Teams = () => {
  const navigate = useNavigate();

  const handleTeamClick = (teamId: string, teamName: string) => {
    if (teamName.toLowerCase() === 'logistics') {
      navigate('/teams/logistics');
    } else if (teamName.toLowerCase() === 'sponsoring') {
      navigate('/teams/sponsoring');
    } else {
      navigate(`/teams/${teamId}/report`);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-text">Teams</h1>
        <p className="text-gray-500 mt-1">Select a team to view details or file reports.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTeams.map((team) => (
          <div 
            key={team.id}
            onClick={() => handleTeamClick(team.id, team.name)}
            className="glass-card p-6 cursor-pointer group hover:border-primary/50 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-100 rounded-lg text-gray-600 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                <Users size={24} />
              </div>
              <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">
                {team.memberCount} Members
              </span>
            </div>

            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{team.name}</h3>
            <p className="text-sm text-gray-500 mb-6 h-10">{team.description}</p>

            <div className="flex items-center text-primary font-medium text-sm gap-1 group-hover:gap-2 transition-all">
              View Dashboard <ChevronRight size={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
