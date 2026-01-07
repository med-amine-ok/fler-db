export type User = {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
    teamId?: string;
    contactCount: number;
    companyCount: number;
    eventCount: number;
    ranking: number;
};

export type Event = {
    id: string;
    name: string;
    date: string;
    status: 'ongoing' | 'ongoing' | 'ongoing';
    description?: string;
    logo?: string;
};

export type Team = {
    id: string;
    name: string;
    description: string;
    memberCount: number;
};

export type Company = {
    id: string;
    name: string;
    status: 'contacted' | 'negotiating' | 'signed' | 'rejected';
    eventId: string;
    assignedTo?: string;
};

export type Resource = {
    id: string;
    name: string;
    type: 'hotel' | 'goodie' | 'food';
    eventId: string;
    status: 'available' | 'booked';
};
