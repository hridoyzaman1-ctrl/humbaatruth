export interface TeamMember {
    id: string;
    name: string;
    role: string;
    image: string;
    bio: string;
    email?: string;
    twitter?: string;
    linkedin?: string;
    order: number;
}
