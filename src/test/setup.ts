import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// firebaseService initialises a real Firebase app at import time; tests never need it
vi.mock('../services/firebaseService', () => ({ auth: {}, db: {} }));

afterEach(() => {
    cleanup();
});
