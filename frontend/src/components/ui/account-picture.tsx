import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export interface AccountPictureProps {
    name: string;
}

export const AccountPicture = ({ name }: AccountPictureProps) => {
    return (
        <Avatar className="size-full rounded-lg">
            <AvatarFallback className="rounded bg-rose-400/20 font-medium text-rose-500">
                {name?.[0] ?? '?'}
            </AvatarFallback>
        </Avatar>
    );
};
