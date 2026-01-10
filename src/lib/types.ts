export type User = {
    id: string;
    email: string; // from auth.users or profiles
    name: string; // profiles.full_name
    role: 'admin' | 'user'; // defaulting to user for now?
    teamId?: string; // profiles.team
    // Computed/Mock stats
    contactCount: number;
    companyCount: number;
    eventCount: number;
    ranking: number;
};

export type Event = {
    id: string | number;
    name: string;
    date: string; // Not in DB, need to mock/default
    status: 'planned' | 'ongoing' | 'finished' | 'upcoming' | 'completed'; // Merging UI and DB values
    description?: string; // Not in DB
    logo?: string; // Not in DB
};

export type Team = {
    id: string;
    name: string;
    description: string;
    memberCount: number;
};

export type Company = {
    id: string | number;
    name: string;
    status: 'contacted' | 'pending' | 'signed' | 'rejected' ;
    eventId?: string; // Optional for mock data compatibility
    assignedTo?: string; // profiles.full_name
    contactMethod?: 'call' | 'email' | 'linkedin' | 'outing';
    notes?: string;
};

export type Resource = {
    id: string | number;
    name: string;
    type: 'hotel' | 'salle' | 'food' | 'goodies' | 'goodie'; // 'goodie' in UI, 'goodies' in DB
    status: string; // DB is text
    eventId?: string; // Opt for mock
    contactMethod?: 'call' | 'email' | 'linkedin' | 'outing';
    assignedTo?: string;
    notes?: string;
};
