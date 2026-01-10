import { useEffect, useState } from 'react';
import { getUserRankings } from '../lib/ranking';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface UserRanking {
  id: string;
  full_name: string | null;
  email: string | null;
  team: string | null;
  total_points: number;
  total_activities: number;
  call_count: number;
  email_count: number;
  linkedin_count: number;
  outing_count: number;
  rank: number;
}

export function RankingLeaderboard() {
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const data = await getUserRankings();
      setRankings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rankings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">Loading rankings...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200">
        <div className="text-center text-red-600">Error: {error}</div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">User Rankings</h2>
        <p className="text-gray-600 text-sm">
          Leaderboard based on contact activities • Points: Call: 6 | Email: 3 | LinkedIn: 4 | Outing: 10
        </p>
      </div>

      <div className="grid gap-4">
        {rankings.length === 0 ? (
          <Card className="p-6">
            <div className="text-center text-gray-500">No rankings available yet</div>
          </Card>
        ) : (
          rankings.map((user) => (
            <Card key={user.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-blue-600 min-w-12">#{user.rank}</div>
                  <div>
                    <h3 className="font-semibold text-lg">{user.full_name || 'Unknown User'}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">{user.total_points}</div>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {user.team && (
                  <Badge variant={user.team === 'logistics' ? 'default' : 'success'}>
                    {user.team}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-4 gap-3 text-center pt-3 border-t">
                <div>
                  <div className="text-sm font-semibold text-gray-900">{user.call_count}</div>
                  <div className="text-xs text-gray-500">Calls (6pts)</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{user.email_count}</div>
                  <div className="text-xs text-gray-500">Emails (3pts)</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{user.linkedin_count}</div>
                  <div className="text-xs text-gray-500">LinkedIn (4pts)</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{user.outing_count}</div>
                  <div className="text-xs text-gray-500">Outings (10pts)</div>
                </div>
              </div>

              <div className="text-xs text-gray-400 mt-2">
                Total activities: {user.total_activities}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
