import { vi } from 'vitest';

// Minimal in-memory stand-in for the firebase/firestore calls wishlistService makes
type Data = Record<string, unknown>;

const createFakeFirestore = () => {
    const collections = new Map<string, Map<string, Data>>();
    let nextId = 0;

    const docsIn = (path: string) => {
        if (!collections.has(path)) collections.set(path, new Map());
        return collections.get(path)!;
    };

    const snapshot = (path: string, filter: (data: Data) => boolean = () => true) => ({
        docs: [...docsIn(path).entries()]
            .filter(([, data]) => filter(data))
            .map(([id, data]) => ({ id, data: () => data })),
    });

    class Timestamp {
        constructor(private readonly date: Date) {}
        toDate() {
            return this.date;
        }
    }

    const module = {
        Timestamp,
        collection: vi.fn((_db: unknown, ...segments: string[]) => ({ kind: 'collection', path: segments.join('/') })),
        doc: vi.fn((_db: unknown, ...segments: string[]) => ({
            kind: 'doc',
            path: segments.slice(0, -1).join('/'),
            id: segments[segments.length - 1],
        })),
        where: vi.fn((field: string, _op: '==', value: unknown) => ({ field, value })),
        query: vi.fn((ref: { path: string }, ...clauses: { field: string; value: unknown }[]) => ({
            kind: 'query',
            path: ref.path,
            clauses,
        })),
        getDocs: vi.fn(async (ref: { path: string; clauses?: { field: string; value: unknown }[] }) =>
            snapshot(ref.path, (data) => (ref.clauses ?? []).every(({ field, value }) => data[field] === value))
        ),
        addDoc: vi.fn(async (ref: { path: string }, data: Data) => {
            const id = `doc-${++nextId}`;
            docsIn(ref.path).set(id, data);
            return { id };
        }),
        deleteDoc: vi.fn(async (ref: { path: string; id: string }) => {
            docsIn(ref.path).delete(ref.id);
        }),
    };

    return {
        module,
        seed: (path: string, id: string, data: Data) => docsIn(path).set(id, data),
        read: (path: string) => [...docsIn(path).values()],
        reset: () => {
            collections.clear();
            nextId = 0;
            Object.values(module).forEach((fn) => {
                if (vi.isMockFunction(fn)) fn.mockClear();
            });
        },
    };
};

export const fakeFirestore = createFakeFirestore();
