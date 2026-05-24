import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Smart MailBox application title', () => {
  render(<App />);

  const titleElement = screen.getByText(/Smart MailBox Application/i);
  expect(titleElement).toBeInTheDocument();
});