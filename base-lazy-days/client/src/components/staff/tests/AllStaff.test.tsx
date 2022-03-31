import {  screen } from '@testing-library/react';
import { rest } from 'msw';

import { server } from '../../../mocks/server';
import { defaultQueryClientOptions } from '../../../react-query/queryClient';
import {renderWithQueryClient} from "../../../test-utils"
import { AllStaff } from '../AllStaff';

test('renders response from query', async() => {
  renderWithQueryClient(<AllStaff />);

  const staffNames = await screen.findAllByRole("heading", {name: /sandra|dyvja|michael|mateo/i})

  expect(staffNames).toHaveLength(3);
});

test('handles query error', async () => {
  // (re)set handler to return a 500 error for staff
   server.resetHandlers(
     rest.get('http://localhost:3030/staff', (req, res, ctx) => {
       return res(ctx.status(500));
     }),
   );

   renderWithQueryClient(<AllStaff />);

   // check for the toasts
   const alert = await screen.findByRole("alert");
   expect(alert).toHaveTextContent("Request failed with status code 500");
});
