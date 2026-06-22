import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PrimaryButton, {
  SecondaryButton,
  DangerButton,
  GhostButton,
  OutlineButton,
} from '../../components/ui/Button';

describe('PrimaryButton', () => {
  it('renders children text', () => {
    render(<PrimaryButton animate={false}>Click Me</PrimaryButton>);
    expect(screen.getByText('Click Me')).toBeDefined();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<PrimaryButton animate={false} onClick={onClick}>Click</PrimaryButton>);
    fireEvent.click(screen.getByText('Click'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when loading=true', () => {
    render(<PrimaryButton animate={false} loading>Save</PrimaryButton>);
    const btn = screen.getByRole('button');
    expect(btn.disabled).toBe(true);
  });

  it('is disabled when disabled=true', () => {
    render(<PrimaryButton animate={false} disabled>Submit</PrimaryButton>);
    expect(screen.getByRole('button').disabled).toBe(true);
  });

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(<PrimaryButton animate={false} disabled onClick={onClick}>Submit</PrimaryButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows loader icon when loading', () => {
    render(<PrimaryButton animate={false} loading>Save</PrimaryButton>);
    // Lucide Loader2 renders an SVG — check it exists
    const svg = document.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});

describe('Variant buttons', () => {
  it('SecondaryButton renders', () => {
    render(<SecondaryButton animate={false}>Secondary</SecondaryButton>);
    expect(screen.getByText('Secondary')).toBeDefined();
  });

  it('DangerButton renders', () => {
    render(<DangerButton animate={false}>Delete</DangerButton>);
    expect(screen.getByText('Delete')).toBeDefined();
  });

  it('GhostButton renders', () => {
    render(<GhostButton animate={false}>Ghost</GhostButton>);
    expect(screen.getByText('Ghost')).toBeDefined();
  });

  it('OutlineButton renders', () => {
    render(<OutlineButton animate={false}>Outline</OutlineButton>);
    expect(screen.getByText('Outline')).toBeDefined();
  });
});
