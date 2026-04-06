import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LocationSearch } from './LocationSearch';

describe('LocationSearch', () => {
  it('renders the search input and button', () => {
    render(<LocationSearch onSearch={vi.fn()} />);
    expect(screen.getByRole('textbox', { name: /location/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search weather/i })).toBeInTheDocument();
  });

  it('disables the search button when input is empty', () => {
    render(<LocationSearch onSearch={vi.fn()} />);
    expect(screen.getByRole('button', { name: /search weather/i })).toBeDisabled();
  });

  it('enables the search button when input has a value', async () => {
    render(<LocationSearch onSearch={vi.fn()} />);
    const input = screen.getByRole('textbox', { name: /location/i });
    await userEvent.type(input, 'Columbia');
    expect(screen.getByRole('button', { name: /search weather/i })).not.toBeDisabled();
  });

  it('calls onSearch with trimmed location and selected units on submit', async () => {
    const onSearch = vi.fn();
    render(<LocationSearch onSearch={onSearch} />);

    const input = screen.getByRole('textbox', { name: /location/i });
    await userEvent.type(input, '  London  ');

    fireEvent.submit(screen.getByRole('search'));

    expect(onSearch).toHaveBeenCalledWith('London', 'imperial');
  });

  it('does not call onSearch when input is whitespace only', async () => {
    const onSearch = vi.fn();
    render(<LocationSearch onSearch={onSearch} />);

    const input = screen.getByRole('textbox', { name: /location/i });
    await userEvent.type(input, '   ');
    fireEvent.submit(screen.getByRole('search'));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('toggles to metric when °C is selected', async () => {
    const onSearch = vi.fn();
    render(<LocationSearch onSearch={onSearch} />);

    await userEvent.click(screen.getByLabelText('°C'));
    const input = screen.getByRole('textbox', { name: /location/i });
    await userEvent.type(input, 'Paris');
    fireEvent.submit(screen.getByRole('search'));

    expect(onSearch).toHaveBeenCalledWith('Paris', 'metric');
  });

  it('disables input and button while loading', () => {
    render(<LocationSearch onSearch={vi.fn()} isLoading={true} />);
    expect(screen.getByRole('textbox', { name: /location/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /search weather/i })).toBeDisabled();
  });
});
