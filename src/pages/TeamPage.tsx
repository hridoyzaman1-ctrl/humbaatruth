import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { getTeamMembers } from '@/lib/teamService';
import { TeamMember } from '@/types/team';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Linkedin, Twitter } from 'lucide-react';

const TeamPage = () => {
    const [members, setMembers] = useState<TeamMember[]>([]);

    useEffect(() => {
        setMembers(getTeamMembers().sort((a, b) => a.order - b.order));
    }, []);

    return (
        <Layout>
            <div className="bg-muted/30 py-16 sm:py-24">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4 text-foreground">Our Team</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Meet the dedicated journalists, editors, and creators behind TruthLens who are committed to delivering unbiased, high-quality news.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {members.map((member) => (
                        <Card key={member.id} className="overflow-hidden border-border group hover:shadow-lg transition-all duration-300">
                            <div className="aspect-[4/3] overflow-hidden">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <CardContent className="p-6 text-center">
                                <h3 className="font-display text-xl font-bold mb-1">{member.name}</h3>
                                <p className="text-primary font-medium text-sm mb-4 uppercase tracking-wider">{member.role}</p>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                    {member.bio}
                                </p>
                                <div className="flex justify-center gap-4">
                                    {member.email && (
                                        <a href={`mailto:${member.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                                            <Mail className="h-4 w-4" />
                                            <span className="sr-only">Email</span>
                                        </a>
                                    )}
                                    {member.twitter && (
                                        <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                            <Twitter className="h-4 w-4" />
                                            <span className="sr-only">Twitter</span>
                                        </a>
                                    )}
                                    {member.linkedin && (
                                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                            <Linkedin className="h-4 w-4" />
                                            <span className="sr-only">LinkedIn</span>
                                        </a>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default TeamPage;
