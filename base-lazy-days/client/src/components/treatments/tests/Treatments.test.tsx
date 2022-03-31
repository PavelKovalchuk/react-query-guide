import {  screen } from '@testing-library/react';

import {renderWithQueryClient} from "../../../test-utils"
import { Treatments } from '../Treatments';

test('renders response from query', async() => {
  renderWithQueryClient(<Treatments />);

  const treatmentsTitles = await screen.findAllByRole("heading", {name: /massage|facial|scrub/i})

  expect(treatmentsTitles).toHaveLength(3);
});
