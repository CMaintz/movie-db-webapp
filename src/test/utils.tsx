import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Media } from '../types';

export const createTestQueryClient = () =>
    new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

export const renderWithProviders = (
    ui: React.ReactElement,
    { route = '/', path }: { route?: string; path?: string } = {}
) => {
    const queryClient = createTestQueryClient();
    return {
        queryClient,
        ...render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={[route]}>
                    {path ? (
                        <Routes>
                            <Route path={path} element={ui} />
                            <Route path="*" element={<div>other route</div>} />
                        </Routes>
                    ) : (
                        ui
                    )}
                </MemoryRouter>
            </QueryClientProvider>
        ),
    };
};

export const makeMedia = (overrides: Partial<Media> = {}): Media => ({
    id: 1,
    title: 'Test Title',
    poster_path: '/poster.jpg',
    backdrop_path: '/backdrop.jpg',
    vote_average: 8,
    vote_count: 100,
    popularity: 10,
    overview: 'Overview',
    genres: [],
    media_type: 'movie',
    ...overrides,
});
