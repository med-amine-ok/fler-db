import { Mail, Shield, User, Award, TrendingUp, Building, MapPin, Phone, FileText, Calendar as CalendarIcon } from 'lucide-react';
import { mockUser, mockTeams } from '../lib/mockData';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const Profile = () => {

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Profile Section */}
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-6">
         <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-blue-400 p-1.5 shadow-xl shrink-0">
            <div className="w-full h-full border-2 border-white/20 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-inner">
               {mockUser.name.charAt(0)}
            </div>
         </div>
         
         <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-text">{mockUser.name}</h1>
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-gray-500 mt-2">
               <span className="flex items-center gap-1.5 text-sm font-medium bg-gray-100 px-3 py-1 rounded-full"><Mail size={14} /> {mockUser.email}</span>
               <span className="flex items-center gap-1.5 text-sm font-medium bg-gray-100 px-3 py-1 rounded-full"><Shield size={14} /> {mockUser.role}</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Left Column: Info */}
         <div className="space-y-6">
            <Card className="p-6">
               <h3 className="font-bold text-lg mb-4">Personal Info</h3>
               <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                     <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><User size={16}/></div>
                     <div>
                        <p className="text-xs text-gray-400">Team</p>
                        <p className="font-medium text-text">{mockTeams.find((t: any) => t.id === mockUser.teamId)?.name}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                     <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><Phone size={16}/></div>
                     <div>
                        <p className="text-xs text-gray-400">Phone</p>
                        <p className="font-medium text-text">+1 (555) 000-0000</p>
                     </div>
                  </div>
                   <div className="flex items-center gap-3 text-sm text-gray-600">
                     <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><MapPin size={16}/></div>
                     <div>
                        <p className="text-xs text-gray-400">Location</p>
                        <p className="font-medium text-text">San Francisco, CA</p>
                     </div>
                  </div>
               </div>
            </Card>

            <Card className="p-6">
               <h3 className="font-bold text-lg mb-4">Skills</h3>
               <div className="flex flex-wrap gap-2">
                  {['Negotiation', 'Logistics', 'Event Planning', 'Public Speaking'].map(s => (
                    <Badge variant="outline" key={s}>{s}</Badge>
                  ))}
               </div>
            </Card>
         </div>

         {/* Right Column: Stats & Activity */}
         <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               <Card className="p-6 bg-primary text-white border-none shadow-xl shadow-primary/20">
                  <div className="flex justify-between items-start opacity-80">
                     <p className="text-sm font-medium">Global Ranking</p>
                     <Award size={20} />
                  </div>
                  <p className="text-4xl font-extrabold mt-4">#{mockUser.ranking}</p>
                  <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
                     <div className="bg-white h-full w-[80%] rounded-full"></div>
                  </div>
               </Card>
                <Card className="p-6">
                  <div className="flex justify-between items-start text-gray-400">
                     <p className="text-sm font-medium">Companies Signed</p>
                     <Building size={20} />
                  </div>
                  <p className="text-3xl font-bold mt-4 text-text">{mockUser.companyCount}</p>
                  <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1"><TrendingUp size={12} /> +2 this month</p>
               </Card>
                <Card className="p-6">
                  <div className="flex justify-between items-start text-gray-400">
                     <p className="text-sm font-medium">Events Attended</p>
                     <CalendarIcon size={20} />
                  </div>
                  <p className="text-3xl font-bold mt-4 text-text">{mockUser.eventCount}</p>
               </Card>
            </div>

            <Card className="p-6">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">Recent Activity</h3>
                  <Button variant="ghost" size="sm">View All</Button>
               </div>
               
               <div className="space-y-6">
                  {[1,2,3].map((i) => (
                    <div key={i} className="flex gap-4 items-start">
                       <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                          <FileText size={16} className="text-gray-400" />
                       </div>
                       <div>
                          <p className="text-sm font-medium text-text">Updated contact report for <span className="text-primary font-bold">TechCorp</span></p>
                          <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
};
