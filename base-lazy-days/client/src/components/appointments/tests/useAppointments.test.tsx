import { act, renderHook } from '@testing-library/react-hooks';

import { createQueryClientWrapper } from '../../../test-utils';
import { useAppointments } from '../hooks/useAppointments';

test('filter appointments by availability', async () => {
  const { result, waitFor } = renderHook(useAppointments, {
    wrapper: createQueryClientWrapper(),
  });

  // wait for the appointments to populate
  await waitFor(() => result.current.appointments !== {});

  const filteredAppointmentsLength = Object.keys(result.current.appointments)
    .length;

  // set to show all to true
  act(() => result.current.setShowAll(true));

  // wait for the appointment to show more
  await waitFor(
    () =>
      Object.keys(result.current.appointments).length >
      filteredAppointmentsLength
  );
});
