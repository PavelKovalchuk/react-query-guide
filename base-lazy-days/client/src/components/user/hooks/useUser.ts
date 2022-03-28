import axios, { AxiosResponse } from 'axios';
import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from '../../../user-storage';

interface AxiosResponseWithCancel extends AxiosResponse {
  cancel: () => void;
}

// query function
async function getUser(user: User | null): Promise<AxiosResponseWithCancel> {
  if (!user) return null;

  const source = axios.CancelToken.source();

  const axiosResponse: AxiosResponseWithCancel = await axiosInstance.get(
    `/user/${user.id}`,
    {
      headers: getJWTHeader(user),
      cancelToken: source.token,
    }
  );

  axiosResponse.cancel = () => {
    source.cancel();
  };

  return axiosResponse;
}

interface UseUser {
  user: User | null;
  updateUser: (user: User) => void;
  clearUser: () => void;
}

export function useUser(): UseUser {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const queryClient = useQueryClient();

  useQuery(queryKeys.user, () => getUser(user), {
    enabled: !!user,
    onSuccess: (axiosResponse) => setUser(axiosResponse?.data?.user),
  });

  // meant to be called from useAuth
  function updateUser(newUser: User): void {
    setUser(newUser);

    // update user in local storage
    setStoredUser(newUser);

    queryClient.setQueryData(queryKeys.user, newUser);
  }

  // meant to be called from useAuth
  function clearUser() {
    // reset user to null in query cache
    setUser(null);
    clearStoredUser();

    // reset user in the react query cache
    queryClient.setQueryData(queryKeys.user, null);

    // remove user appointments in react query cache
    queryClient.removeQueries([queryKeys.appointments, queryKeys.user]);
  }

  return { user, updateUser, clearUser };
}
