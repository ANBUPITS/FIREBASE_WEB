import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Signin, { validateEmail, validatePassword } from '../screens/Signin';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'react-toastify';

// Mock Firebase
jest.mock('../firebase', () => ({
    auth: {}
}));

jest.mock('firebase/auth');

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

describe('Signin Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render signin form', () => {
        render(
            <BrowserRouter>
                <Signin />
            </BrowserRouter>
        );

        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });

    it('should show validation errors on invalid submit', async () => {
        render(
            <BrowserRouter>
                <Signin />
            </BrowserRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(screen.getByText('Email is required')).toBeInTheDocument();
            expect(screen.getByText('Password is required')).toBeInTheDocument();
        });
    });

    it('should successfully sign in with valid credentials', async () => {
        (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
            user: { uid: '123', email: 'test@example.com' }
        });

        render(
            <BrowserRouter>
                <Signin />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('Email'), { 
            target: { value: 'test@example.com' } 
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), { 
            target: { value: 'password123' } 
        });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Signed in successfully...');
            expect(mockNavigate).toHaveBeenCalledWith('/Chat');
        });
    });

    it('should handle authentication errors', async () => {
        (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
            code: 'auth/invalid-credential'
        });

        render(
            <BrowserRouter>
                <Signin />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('Email'), { 
            target: { value: 'test@example.com' } 
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), { 
            target: { value: 'wrongpassword' } 
        });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalled();
        });
    });
});