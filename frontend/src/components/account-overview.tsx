import type { User } from '@/lib/service/account';
import { AccountPicture } from './ui/account-picture';

export const AccountOverview = ({ user }: { user: User }) => {
    return (
        <div className="flex items-center gap-3">
            <div className="size-10">
                <AccountPicture name={user.name ?? ''} />
            </div>
            <div>
                <div className="text-sm font-semibold text-slate-900">
                    {user.name}
                </div>
                <div className="text-xs text-slate-500">{user.email}</div>
            </div>
        </div>
    );
};
