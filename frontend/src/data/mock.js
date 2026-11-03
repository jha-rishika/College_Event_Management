// Mock datasets for CEMS. "Today" is fixed so the demo behaves the same on any day.
export const TODAY = '2026-11-03';
export const COLLEGE = 'Northfield Institute of Technology';

export const ROLES = {
  student: { label: 'Student', userId: 'u1' },
  organizer: { label: 'Organizer', userId: 'u2' },
  faculty: { label: 'Faculty Coordinator', userId: 'u3' },
  admin: { label: 'System Admin', userId: 'u4' },
  sponsor: { label: 'Sponsor', userId: 'u5' },
};

export const CATEGORIES = ['Tech', 'Cultural', 'Sports', 'Business', 'Arts', 'Career', 'Social'];

export const venues = [
  { id: 'v1', name: 'Main Auditorium', capacity: 500, building: 'Admin Block', amenities: ['Stage', 'AV', 'AC'] },
  { id: 'v2', name: 'Open Air Theatre', capacity: 800, building: 'Central Lawn', amenities: ['Stage', 'Sound'] },
  { id: 'v3', name: 'Innovation Lab', capacity: 40, building: 'Engineering Block', amenities: ['Workbenches', 'Projector'] },
  { id: 'v4', name: 'Seminar Hall A', capacity: 100, building: 'Management Block', amenities: ['AV', 'AC'] },
  { id: 'v5', name: 'Sports Complex', capacity: 600, building: 'South Campus', amenities: ['Floodlights', 'Pavilion'] },
  { id: 'v6', name: 'Library Conference Room', capacity: 60, building: 'Library', amenities: ['Projector', 'AC'] },
];

export const users = [
  { id: 'u1', name: 'Aarav Mehta', email: 'aarav.mehta@northfield.edu', role: 'student', dept: 'Computer Science', year: '3rd Year', active: true, last: '2 min ago' },
  { id: 'u2', name: 'Priya Nair', email: 'priya.nair@northfield.edu', role: 'organizer', dept: 'Computer Science', year: '4th Year', active: true, last: '14 min ago' },
  { id: 'u3', name: 'Dr. Meera Iyer', email: 'meera.iyer@northfield.edu', role: 'faculty', dept: 'Student Affairs', year: '-', active: true, last: '1 hr ago' },
  { id: 'u4', name: 'Karan Malhotra', email: 'karan.m@northfield.edu', role: 'admin', dept: 'IT Services', year: '-', active: true, last: 'Just now' },
  { id: 'u5', name: 'Rohan Kapoor', email: 'rohan.kapoor@nexora.io', role: 'sponsor', dept: 'Nexora Systems', year: '-', active: true, last: '3 hrs ago' },
  { id: 'u6', name: 'Sana Qureshi', email: 'sana.q@northfield.edu', role: 'student', dept: 'Electronics', year: '2nd Year', active: true, last: '1 day ago' },
  { id: 'u7', name: 'Dev Patel', email: 'dev.patel@northfield.edu', role: 'organizer', dept: 'Management', year: '3rd Year', active: true, last: '5 hrs ago' },
  { id: 'u8', name: 'Ishita Rao', email: 'ishita.rao@northfield.edu', role: 'student', dept: 'Mechanical', year: '1st Year', active: true, last: '2 days ago' },
  { id: 'u9', name: 'Vikram Singh', email: 'vikram.singh@northfield.edu', role: 'student', dept: 'Civil', year: '4th Year', active: false, last: '3 weeks ago' },
  { id: 'u10', name: 'Prof. Anand Rao', email: 'anand.rao@northfield.edu', role: 'faculty', dept: 'Computer Science', year: '-', active: true, last: '2 days ago' },
  { id: 'u11', name: 'Neha Gupta', email: 'neha.gupta@northfield.edu', role: 'student', dept: 'Computer Science', year: '3rd Year', active: true, last: '6 hrs ago' },
  { id: 'u12', name: 'Tanvi Desai', email: 'tanvi.d@northfield.edu', role: 'organizer', dept: 'Arts & Humanities', year: '2nd Year', active: true, last: '1 day ago' },
  { id: 'u13', name: 'Rahul Verma', email: 'rahul.v@northfield.edu', role: 'student', dept: 'Electronics', year: '3rd Year', active: true, last: '4 hrs ago' },
  { id: 'u14', name: 'Ananya Krishnan', email: 'ananya.k@northfield.edu', role: 'student', dept: 'Management', year: '2nd Year', active: true, last: '30 min ago' },
  { id: 'u15', name: 'Meridian Bank', email: 'csr@meridianbank.com', role: 'sponsor', dept: 'Meridian Bank', year: '-', active: true, last: '5 days ago' },
  { id: 'u16', name: 'Farhan Ali', email: 'farhan.ali@northfield.edu', role: 'student', dept: 'Mechanical', year: '4th Year', active: true, last: '2 hrs ago' },
];

const b = (items, status = 'approved') => ({ items, status, note: '' });

export const events = [
  {
    id: 'e1', title: 'CodeSprint 24-Hour Hackathon', club: 'Coding Club', category: 'Tech', date: '2026-11-08',
    start: '10:00', end: '18:00', venueId: 'v1', capacity: 120, baseCount: 96, waitBase: 0, fee: 0,
    organizerId: 'u2', status: 'approved', announced: true, sponsors: ['Nexora Systems'],
    description: 'Teams of up to four build a working product from a surprise problem statement. Mentors from industry, cloud credits for finalists and a demo round judged by faculty and sponsors.',
    budget: b([{ label: 'Prizes', amount: 40000 }, { label: 'Food & refreshments', amount: 22000 }, { label: 'Swag & printing', amount: 9000 }, { label: 'Cloud credits (sponsor-funded)', amount: 0 }]),
  },
  {
    id: 'e2', title: 'Robotics Hands-on Workshop', club: 'Robotics Society', category: 'Tech', date: '2026-11-08',
    start: '14:00', end: '17:00', venueId: 'v3', capacity: 30, baseCount: 30, waitBase: 3, fee: 150,
    organizerId: 'u2', status: 'approved', announced: false, sponsors: [],
    description: 'Build and program a line-following bot in three hours. All kits are provided and you take yours home. Basic Arduino knowledge helps but is not required.',
    budget: b([{ label: 'Robot kits (30)', amount: 18000 }, { label: 'Consumables', amount: 3500 }, { label: 'Trainer honorarium', amount: 6000 }]),
  },
  {
    id: 'e3', title: 'Rhythm Night: Inter-Department Music Fest', club: 'Cultural Committee', category: 'Cultural', date: '2026-11-12',
    start: '18:00', end: '21:30', venueId: 'v2', capacity: 400, baseCount: 312, waitBase: 0, fee: 100,
    organizerId: 'u12', status: 'approved', announced: true, sponsors: ['Meridian Bank'],
    description: 'Twelve department bands, one open-air stage. Voting by audience wristband decides the trophy. Food stalls open from 5 PM.',
    budget: b([{ label: 'Sound & lights', amount: 55000 }, { label: 'Stage & décor', amount: 30000 }, { label: 'Trophies', amount: 6000 }]),
  },
  {
    id: 'e4', title: 'Startup Pitch Day', club: 'E-Cell', category: 'Business', date: '2026-11-14',
    start: '11:00', end: '15:00', venueId: 'v4', capacity: 80, baseCount: 41, waitBase: 0, fee: 0,
    organizerId: 'u7', status: 'approved', announced: false, sponsors: [],
    description: 'Ten student teams pitch to a panel of founders and angel investors. Audience Q&A and a networking lunch follow.',
    budget: b([{ label: 'Lunch', amount: 16000 }, { label: 'Panel travel', amount: 9000 }]),
  },
  {
    id: 'e5', title: 'Inter-College Football Cup', club: 'Sports Council', category: 'Sports', date: '2026-11-15',
    start: '08:00', end: '13:00', venueId: 'v5', capacity: 200, baseCount: 144, waitBase: 0, fee: 0,
    organizerId: 'u7', status: 'approved', announced: true, sponsors: [],
    description: 'Eight colleges, knockout format, semi-finals and final on the same morning. Spectator passes are free but limited.',
    budget: b([{ label: 'Referees', amount: 12000 }, { label: 'Medical cover', amount: 8000 }, { label: 'Trophies & medals', amount: 14000 }]),
  },
  {
    id: 'e6', title: 'Photography Walk & Editing Masterclass', club: 'Lens Club', category: 'Arts', date: '2026-11-16',
    start: '07:00', end: '11:00', venueId: 'v6', capacity: 50, baseCount: 18, waitBase: 0, fee: 200,
    organizerId: 'u12', status: 'approved', announced: false, sponsors: [],
    description: 'A sunrise walk across the old campus followed by a live Lightroom editing session. Bring a camera or phone.',
    budget: b([{ label: 'Guest photographer', amount: 10000 }, { label: 'Printing', amount: 3000 }]),
  },
  {
    id: 'e7', title: 'Placement Prep: Resume Clinic', club: 'Career Cell', category: 'Career', date: '2026-11-18',
    start: '15:00', end: '17:00', venueId: 'v6', capacity: 50, baseCount: 22, waitBase: 0, fee: 0,
    organizerId: 'u7', status: 'approved', announced: false, sponsors: [],
    description: 'One-to-one resume reviews with HR leads from partner companies. Bring a printed copy.',
    budget: b([{ label: 'Refreshments', amount: 4000 }]),
  },
  {
    id: 'e8', title: 'Green Campus Tree Plantation Drive', club: 'Eco Club', category: 'Social', date: '2026-11-20',
    start: '09:00', end: '12:00', venueId: 'v2', capacity: 150, baseCount: 63, waitBase: 0, fee: 0,
    organizerId: 'u12', status: 'approved', announced: false, sponsors: [],
    description: 'Plant 300 saplings along the north boundary. Gloves, tools and breakfast provided. Counts toward NSS volunteering hours.',
    budget: b([{ label: 'Saplings', amount: 9000 }, { label: 'Tools & gloves', amount: 3500 }]),
  },
  // Awaiting faculty review
  {
    id: 'e9', title: 'DevOps Bootcamp Weekend', club: 'Coding Club', category: 'Tech', date: '2026-11-22',
    start: '09:30', end: '16:30', venueId: 'v3', capacity: 40, baseCount: 0, waitBase: 0, fee: 250,
    organizerId: 'u2', status: 'pending', announced: false, sponsors: [],
    description: 'Hands-on CI/CD, containers and monitoring with a live deployment exercise. Cloud sandbox accounts provided.',
    budget: b([{ label: 'Cloud sandbox accounts', amount: 14000 }, { label: 'Trainer fee', amount: 12000 }, { label: 'Lunch', amount: 8000 }], 'submitted'),
  },
  {
    id: 'e10', title: 'Parliament Edition: Inter-College Debate', club: 'Literary Society', category: 'Cultural', date: '2026-11-21',
    start: '10:00', end: '16:00', venueId: 'v4', capacity: 100, baseCount: 0, waitBase: 0, fee: 0,
    organizerId: 'u12', status: 'pending', announced: false, sponsors: [],
    description: 'Formal parliamentary debate with twelve visiting teams. Adjudicators from the university debating circuit.',
    budget: b([{ label: 'Adjudicator honorarium', amount: 9000 }, { label: 'Certificates', amount: 2500 }, { label: 'Lunch', amount: 6500 }], 'submitted'),
  },
  {
    id: 'e11', title: 'Alumni Meet 2026', club: 'Alumni Cell', category: 'Social', date: '2026-11-28',
    start: '17:00', end: '21:00', venueId: 'v1', capacity: 300, baseCount: 0, waitBase: 0, fee: 500,
    organizerId: 'u7', status: 'pending', announced: false, sponsors: [],
    description: 'Annual alumni homecoming with a felicitation ceremony, batch reunions and a gala dinner.',
    budget: b([{ label: 'Catering (300 pax)', amount: 120000 }, { label: 'Décor & stage', amount: 35000 }, { label: 'Memento', amount: 15000 }], 'submitted'),
  },
  // Past events (for feedback)
  {
    id: 'p1', title: 'Hack the Campus 2026', club: 'Coding Club', category: 'Tech', date: '2026-10-25',
    start: '09:00', end: '18:00', venueId: 'v1', capacity: 150, baseCount: 138, waitBase: 0, fee: 0,
    organizerId: 'u2', status: 'approved', announced: true, sponsors: ['Nexora Systems'], rating: { avg: 4.6, count: 58 },
    description: 'Campus-wide hackathon. Thank you to everyone who attended.',
    budget: b([{ label: 'Prizes', amount: 35000 }, { label: 'Food', amount: 20000 }]),
  },
  {
    id: 'p2', title: 'Quiz League Finals', club: 'Literary Society', category: 'Cultural', date: '2026-10-28',
    start: '16:00', end: '19:00', venueId: 'v4', capacity: 100, baseCount: 84, waitBase: 0, fee: 0,
    organizerId: 'u12', status: 'approved', announced: true, sponsors: [], rating: { avg: 4.3, count: 41 },
    description: 'The grand finale of the inter-department quiz league.',
    budget: b([{ label: 'Prizes', amount: 8000 }]),
  },
];

// Seed registrations for the demo student (u1)
export const registrations = [
  { id: 'r1', eventId: 'e3', userId: 'u1', status: 'confirmed', ticket: 'CEMS-E3-A1X9', at: 1 },
  { id: 'r2', eventId: 'p1', userId: 'u1', status: 'confirmed', ticket: 'CEMS-P1-7QK2', at: 2 },
  { id: 'r3', eventId: 'p2', userId: 'u1', status: 'confirmed', ticket: 'CEMS-P2-M4D8', at: 3 },
];
export const feedback = [{ eventId: 'p2', userId: 'u1', rating: 4, tags: ['Well organised'], comment: 'Good questions, ran a bit over time.' }];

// Venue approval requests handled by admin. Approved events already have an approved booking.
export const venueRequests = [
  ...events
    .filter((e) => e.status === 'approved' && !e.id.startsWith('p'))
    .map((e) => ({ id: 'vr-' + e.id, eventId: e.id, venueId: e.venueId, status: 'approved', requestedBy: e.organizerId })),
  ...events
    .filter((e) => e.status === 'pending')
    .map((e) => ({ id: 'vr-' + e.id, eventId: e.id, venueId: e.venueId, status: 'pending', requestedBy: e.organizerId })),
];

export const tiers = [
  {
    id: 'platinum', name: 'Platinum', price: 500000, accent: '#930031',
    perks: ['Title sponsor naming on event', 'Logo on all posters, passes and stage', 'Dedicated 20 sqm stall', '10-minute keynote slot', 'Lead list of opted-in attendees', 'Post-event ROI report'],
    reach: 1.0,
  },
  {
    id: 'gold', name: 'Gold', price: 250000, accent: '#ffa500',
    perks: ['Co-sponsor naming', 'Logo on posters and digital passes', '10 sqm stall', 'Announcement slot on stage', 'Post-event ROI report'],
    reach: 0.6,
  },
  {
    id: 'silver', name: 'Silver', price: 100000, accent: '#5d5160',
    perks: ['Logo on posters and website', 'Standee at venue', 'Social media mention'],
    reach: 0.3,
  },
];

export const sponsorships = [
  { id: 's1', eventId: 'p1', tier: 'silver', amount: 100000, status: 'completed', impressions: 18400, scans: 612, leads: 143 },
  { id: 's2', eventId: 'e1', tier: 'gold', amount: 250000, status: 'active', impressions: 9200, scans: 301, leads: 74 },
];

export const activity = [
  { t: '2 min ago', text: 'Aarav Mehta registered for Rhythm Night' },
  { t: '9 min ago', text: 'Venue request submitted for DevOps Bootcamp Weekend' },
  { t: '26 min ago', text: 'Meridian Bank media kit approved' },
  { t: '1 hr ago', text: 'Email gateway latency above threshold' },
  { t: '2 hrs ago', text: 'Dr. Meera Iyer approved Photography Walk budget' },
  { t: '5 hrs ago', text: 'Nightly backup completed (4.2 GB)' },
];

export const registrationsPerDay = [
  { d: 'Mon', n: 62 }, { d: 'Tue', n: 88 }, { d: 'Wed', n: 74 }, { d: 'Thu', n: 131 },
  { d: 'Fri', n: 117 }, { d: 'Sat', n: 54 }, { d: 'Sun', n: 96 },
];
