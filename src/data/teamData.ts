import { TeamMember } from '@/types/team';

export const initialTeamMembers: TeamMember[] = [
    {
        id: '1',
        name: 'Eleanor Sterling',
        role: 'Editor-in-Chief',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60',
        bio: 'Eleanor brings over 20 years of journalism experience, having led newsrooms in London and New York. She believes in the power of truth to effect change.',
        email: 'eleanor@truthlens.com',
        twitter: '#',
        linkedin: '#',
        order: 1
    },
    {
        id: '2',
        name: 'Marcus Chen',
        role: 'Senior Political Correspondent',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60',
        bio: 'Marcus covers national and international politics with a focus on policy analysis and diplomatic relations.',
        twitter: '#',
        order: 2
    },
    {
        id: '3',
        name: 'Sarah Jenkins',
        role: 'Tech & Future Editor',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=60',
        bio: 'A former software engineer turned journalist, Sarah breaks down complex technological advancements for the general public.',
        linkedin: '#',
        order: 3
    },
    {
        id: '4',
        name: 'David Okafor',
        role: 'Investigative Journalist',
        image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=60',
        bio: 'Award-winning investigative reporter dedicated to uncovering corruption and bringing hidden stories to light.',
        order: 4
    }
];
