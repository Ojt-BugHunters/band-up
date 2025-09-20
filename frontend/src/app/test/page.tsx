import {
    Hero,
    HeroDescription,
    HeroKeyword,
    HeroTitle,
} from '@/components/hero';
import {
    Stats,
    StatsDescription,
    StatsGrid,
    StatsIcon,
    StatsLabel,
    StatsValue,
} from '@/components/stats';
import { Droplet, Droplets, User, UserSearch } from 'lucide-react';

export default function TestListPage() {
    return (
        <div className="flex-1 space-y-6 p-6">
            <Hero>
                <HeroTitle>
                    Practice Test
                    <HeroKeyword color="blue">Storage</HeroKeyword>
                </HeroTitle>
                <HeroDescription>
                    Practicing the newest test in the IELTS world
                </HeroDescription>
            </Hero>

            <StatsGrid>
                <Stats>
                    <StatsIcon className="bg-rose-50 text-rose-600">
                        <Droplets />
                    </StatsIcon>
                    <StatsValue>100</StatsValue>
                    <StatsLabel>Blood Requests</StatsLabel>
                    <StatsDescription>Number of blood request</StatsDescription>
                </Stats>
                <Stats>
                    <StatsIcon className="bg-rose-50 text-rose-600">
                        <Droplet />
                    </StatsIcon>
                    <StatsValue>199</StatsValue>
                    <StatsLabel>Urgent Requests</StatsLabel>
                    <StatsDescription>
                        Number of urgent blood request
                    </StatsDescription>
                </Stats>
                <Stats>
                    <StatsIcon className="bg-blue-50 text-blue-600">
                        <User />
                    </StatsIcon>
                    <StatsValue>299</StatsValue>
                    <StatsLabel>Donors Needed</StatsLabel>
                    <StatsDescription>
                        Number of donors need across all request
                    </StatsDescription>
                </Stats>
                <Stats>
                    <StatsIcon className="bg-emerald-50 text-emerald-600">
                        <UserSearch />
                    </StatsIcon>
                    <StatsValue>88</StatsValue>
                    <StatsLabel>Recommended Requests</StatsLabel>
                    <StatsDescription>
                        Number of recommended request for you
                    </StatsDescription>
                </Stats>
            </StatsGrid>
        </div>
    );
}
