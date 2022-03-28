import jsonpatch from 'fast-json-patch';
import {
  UseMutateFunction,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useUser } from './useUser';

// for when we need a server function
async function patchUserOnServer(
  newData: User | null,
  originalData: User | null
): Promise<User | null> {
  if (!newData || !originalData) return null;
  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: getJWTHeader(originalData),
    }
  );
  return data.user;
}

export function usePatchUser(): UseMutateFunction<
  User,
  unknown,
  User,
  unknown
> {
  const { user, updateUser } = useUser();
  const toast = useCustomToast();
  const queryClient = useQueryClient();

  const { mutate: patchUser } = useMutation(
    (newUserData: User) => patchUserOnServer(newUserData, user),
    {
      // onMutate returns the context that will be passed to onError
      onMutate: async (newData: User | null) => {
        // cancel any outgoing query for user data,
        // so old server data doesn't overwrite optimistic update
        queryClient.cancelQueries(queryKeys.user);

        // snapshot of the prev user value
        const prevUserData: User = queryClient.getQueryData(queryKeys.user);

        // optimistic update the cache with the new value
        updateUser(newData);

        // return the context
        return { prevUserData };
      },
      onError: (error, newData, context) => {
        // roll back cache to saved value
        if (context.prevUserData) {
          updateUser(context.prevUserData);

          toast({
            title: 'Update failed, restoring prev values',
            status: 'warning',
          });
        }
      },
      onSuccess: (userData: User | null) => {
        if (!user) {
          return;
        }
        // optimistic update works for updateUser
        // updateUser(userData);

        toast({
          title: 'You have reserved the appointment',
          status: 'success',
        });
      },
      onSettled: () => {
        // invalidate user data from the server
        queryClient.invalidateQueries([queryKeys.user]);
      },
    }
  );

  return patchUser;
}
