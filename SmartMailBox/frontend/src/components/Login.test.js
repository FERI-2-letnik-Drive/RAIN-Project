import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { UserContext } from '../userContext';
import Login from './Login';

function renderLogin() {
  const mockUserContext = {
    user: null,
    setUserContext: jest.fn()
  };

  return render(
    <BrowserRouter>
      <UserContext.Provider value={mockUserContext}>
        <Login />
      </UserContext.Provider>
    </BrowserRouter>
  );
}

test('allows user to type username and password', async () => {
  renderLogin();

  const usernameInput = screen.getByPlaceholderText(/username/i);
  const passwordInput = screen.getByPlaceholderText(/password/i);

  await userEvent.type(usernameInput, 'marcel');
  await userEvent.type(passwordInput, 'password123');

  expect(usernameInput).toHaveValue('marcel');
  expect(passwordInput).toHaveValue('password123');
});