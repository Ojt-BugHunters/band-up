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
import {
    CheckCircle,
    Clock,
    Droplet,
    Droplets,
    FileText,
    Loader2,
    User,
    UserSearch,
} from 'lucide-react';

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
                    <StatsIcon className="bg-indigo-50 text-indigo-600">
                        <FileText />
                    </StatsIcon>
                    <StatsValue>150</StatsValue>
                    <StatsLabel>Total Tests</StatsLabel>
                    <StatsDescription>
                        Tổng số lượng test trong hệ thống
                    </StatsDescription>
                </Stats>

                <Stats>
                    <StatsIcon className="bg-green-50 text-green-600">
                        <CheckCircle />
                    </StatsIcon>
                    <StatsValue>92</StatsValue>
                    <StatsLabel>Completed Tests</StatsLabel>
                    <StatsDescription>Số test đã hoàn thành</StatsDescription>
                </Stats>

                <Stats>
                    <StatsIcon className="bg-rose-50 text-rose-600">
                        <Clock />
                    </StatsIcon>
                    <StatsValue>48</StatsValue>
                    <StatsLabel>Pending Tests</StatsLabel>
                    <StatsDescription>Số test chưa thực hiện</StatsDescription>
                </Stats>

                <Stats>
                    <StatsIcon className="bg-yellow-50 text-yellow-600">
                        <Loader2 />
                    </StatsIcon>
                    <StatsValue>10</StatsValue>
                    <StatsLabel>In-progress Tests</StatsLabel>
                    <StatsDescription>
                        Số test đang được làm dở
                    </StatsDescription>
                </Stats>
            </StatsGrid>
        </div>
    );
}
