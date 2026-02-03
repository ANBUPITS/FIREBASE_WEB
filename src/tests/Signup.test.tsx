import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Signup, { validateName, validatePhone, validateEmail, validatePassword } from '../screens/Signup';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

// Mock Firebase
jest.mock('../firebase', () => ({
    auth: {},
    db: {}
}));

jest.mock('firebase/auth');
jest.mock('firebase/firestore');

// Mock react-toastify
jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn()
    }
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

describe('Validation Functions', () => {
    it('should validate name correctly', () => {
        expect(validateName('')).toBe('This field is required');
        expect(validateName('A')).toBe('Must be at least 2 characters');
        expect(validateName('John')).toBeNull();
    });

    it('should validate phone correctly', () => {
        expect(validatePhone('')).toBe('Phone number is required');
        expect(validatePhone('123')).toBe('Phone number must be exactly 10 digits');
        expect(validatePhone('12345678901')).toBe('Phone number must be exactly 10 digits');
        expect(validatePhone('1234567890')).toBeNull();
    });

    it('should validate email correctly', () => {
        expect(validateEmail('')).toBe('Email is required');
        expect(validateEmail('invalid')).toBe('Please enter a valid email address');
        expect(validateEmail('test@example.com')).toBeNull();
    });

    it('should validate password correctly', () => {
        expect(validatePassword('')).toBe('Password is required');
        expect(validatePassword('12345')).toBe('Password must be at least 6 characters');
        expect(validatePassword('password123')).toBeNull();
    });
});

describe('Signup Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render signup form', () => {
        render(
            <BrowserRouter>
                <Signup />
            </BrowserRouter>
        );

        expect(screen.getByText('Create Account')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('First name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Last name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Phone')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });

    it('should show validation errors on invalid submit', async () => {
        render(
            <BrowserRouter>
                <Signup />
            </BrowserRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(screen.getAllByText('This field is required').length).toBeGreaterThan(0);
            expect(screen.getByText('Phone number is required')).toBeInTheDocument();
            expect(screen.getByText('Email is required')).toBeInTheDocument();
            expect(screen.getByText('Password is required')).toBeInTheDocument();
        });

        expect(toast.error).toHaveBeenCalledWith('Please fix the errors before submitting');
    });

    it('should successfully create account with valid data', async () => {
        const mockUser = { uid: '123' };
        (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
            user: mockUser
        });
        (setDoc as jest.Mock).mockResolvedValue(undefined);

        render(
            <BrowserRouter>
                <Signup />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('First name'), {
            target: { value: 'John' }
        });
        fireEvent.change(screen.getByPlaceholderText('Last name'), {
            target: { value: 'Doe' }
        });
        fireEvent.change(screen.getByPlaceholderText('Phone'), {
            target: { value: '1234567890' }
        });
        fireEvent.change(screen.getByPlaceholderText('Email'), {
            target: { value: 'john@example.com' }
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
            target: { value: 'password123' }
        });
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
                {},
                'john@example.com',
                'password123'
            );
            expect(setDoc).toHaveBeenCalled();
            expect(toast.success).toHaveBeenCalledWith('Account created successfully!');
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('should handle email already in use error', async () => {
        (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({
            code: 'auth/email-already-in-use'
        });

        render(
            <BrowserRouter>
                <Signup />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('First name'), {
            target: { value: 'John' }
        });
        fireEvent.change(screen.getByPlaceholderText('Last name'), {
            target: { value: 'Doe' }
        });
        fireEvent.change(screen.getByPlaceholderText('Phone'), {
            target: { value: '1234567890' }
        });
        fireEvent.change(screen.getByPlaceholderText('Email'), {
            target: { value: 'existing@example.com' }
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
            target: { value: 'password123' }
        });
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Email already registered');
        });
    });

    it('should handle authentication errors', async () => {
        (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({
            code: 'auth/weak-password'
        });

        render(
            <BrowserRouter>
                <Signup />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('First name'), {
            target: { value: 'John' }
        });
        fireEvent.change(screen.getByPlaceholderText('Last name'), {
            target: { value: 'Doe' }
        });
        fireEvent.change(screen.getByPlaceholderText('Phone'), {
            target: { value: '1234567890' }
        });
        fireEvent.change(screen.getByPlaceholderText('Email'), {
            target: { value: 'john@example.com' }
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
            target: { value: '123' }
        });
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalled();
        });
    });
});