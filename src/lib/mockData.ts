import type { User, Event, Team, Company, Resource } from './types';

export const mockEvents: Event[] = [
    { id: '1', name: 'AEC', date: '2026-05-10', status: 'finished', description: 'Algerian Engineering Competition. A national competition bringing together top engineering talent from 6 wilayas.', logo: '/AEC.png' },
    { id: '2', name: 'GALA', date: '2026-04-20', status: 'ongoing', description: 'Annual premium networking event gathering partners, sponsors, and key club members.', logo: '/gala.svg' },
    { id: '3', name: 'Polymaze', date: '2026-06-15', status: 'finished', description: 'Highly-anticipated robotics competition designed around autonomous navigation and hardware ingenuity.', logo: '/polymaze.png' },
    { id: '4', name: 'Charity', date: '2026-12-25', status: 'planned', description: 'Sponsoring and coordination workspace for the yearly winter donation drive.', logo: '/charity.png' },
    { id: '5', name: 'STEPS', date: '2026-10-05', status: 'ongoing', description: 'Career path mentoring program and student startup bootcamp.', logo: '/STEPS LOGO-01.png' },
    { id: '6', name: 'MasterClass', date: '2026-09-12', status: 'ongoing', description: 'Specialized technology seminars and hands-on workshops with industry experts.', logo: '/masterclass04.png' },
];

export const mockTeams: Team[] = [
    { id: '1', name: 'Logistics', description: 'Handling venues, transport, accommodation, and equipment allocation.', memberCount: 12 },
    { id: '2', name: 'Sponsoring', description: 'Pitching, contract signing, and relationship management with corporate partners.', memberCount: 16 },
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
    { id: 'c3', name: 'InnovateInc', status: 'signed', eventId: '2' },
];
