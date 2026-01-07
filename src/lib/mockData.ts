import type { User, Event, Team, Company, Resource } from './types';

export const mockEvents: Event[] = [
    { id: '1', name: 'AEC', date: '2024-06-15', status: 'ongoing', description: 'Algeria Engineering Competition.', logo: 'https://cdn-icons-png.flaticon.com/512/3067/3067258.png' },
    { id: '2', name: 'GALA', date: '2024-04-20', status: 'ongoing', description: 'Our premium event.', logo: 'https://cdn-icons-png.flaticon.com/512/1256/1256650.png' },
    { id: '3', name: 'Polymaze', date: '2024-03-10', status: 'ongoing', description: 'Robotics competition.', logo: 'https://cdn-icons-png.flaticon.com/512/9902/9902263.png' },
    { id: '4', name: 'Charity', date: '2024-12-25', status: 'ongoing', description: 'Charity project.', logo: 'https://cdn-icons-png.flaticon.com/512/2904/2904843.png' },
];

export const mockTeams: Team[] = [
    { id: '1', name: 'Logistics', description: 'Handling venues, transport, and equipment.', memberCount: 5 },
    { id: '2', name: 'Sponsoring', description: 'Managing corporate partnerships.', memberCount: 8 },
];

export const mockResources: Resource[] = [
    { id: 'r1', name: 'Grand Hotel', type: 'hotel', eventId: '1', status: 'booked' },
    { id: 'r2', name: 'Tech Goodies Pack', type: 'goodie', eventId: '1', status: 'available' },
    { id: 'r3', name: 'Catering Service A', type: 'food', eventId: '2', status: 'booked' },
];

export const mockUser: User = {
    id: 'u1',
    email: 'medamineoulkhaoua@gmail.com',
    name: 'Med Amine OULDKHAOUA',
    role: 'user',
    teamId: '2',
    contactCount: 15,
    companyCount: 5,
    eventCount: 3,
    ranking: 4,
};

export const mockCompanies: Company[] = [
    { id: 'c1', name: 'TechCorp', status: 'contacted', eventId: '1', assignedTo: 'u1' },
    { id: 'c2', name: 'BuildSoft', status: 'negotiating', eventId: '1' },
    { id: 'c3', name: 'InnovateInc', status: 'signed', eventId: '2' },
];
