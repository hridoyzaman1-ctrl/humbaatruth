import { TeamMember } from '@/types/team';
import { initialTeamMembers } from '@/data/teamData';

const STORAGE_KEY = 'truthlens_team_members';

export const getTeamMembers = (): TeamMember[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return initialTeamMembers;
    try {
        return JSON.parse(data);
    } catch (error) {
        console.error('Error parsing team members', error);
        return initialTeamMembers;
    }
};

export const saveTeamMembers = (members: TeamMember[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    window.dispatchEvent(new Event('teamMembersUpdated'));
};

export const addTeamMember = (member: Omit<TeamMember, 'id'>) => {
    const members = getTeamMembers();
    const newMember = { ...member, id: Date.now().toString() };
    saveTeamMembers([...members, newMember]);
    return newMember;
};

export const updateTeamMember = (member: TeamMember) => {
    const members = getTeamMembers();
    const updated = members.map(m => m.id === member.id ? member : m);
    saveTeamMembers(updated);
};

export const deleteTeamMember = (id: string) => {
    const members = getTeamMembers();
    const filtered = members.filter(m => m.id !== id);
    saveTeamMembers(filtered);
};
