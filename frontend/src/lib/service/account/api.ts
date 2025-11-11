// import { deserialize, fetchWrapper } from '@/lib/api';
// import { useQuery } from '@tanstack/react-query';
// import { AccountRoomMember } from './type';
//
// export const useGetRoomById = (userId: string) => {
//     return useQuery({
//         queryKey: ['room-member'],
//         queryFn: async () => {
//             const response = await fetchWrapper(`/profile/${userId}/avt-info`);
//             return await deserialize<AccountRoomMember>(response);
//         },
//     });
// };
