/**
 * Mock for @react-native-firebase/firestore
 * Jest uses this automatically (root __mocks__ next to node_modules), so the
 * native Firebase module is never loaded in tests.
 *
 * Default behaviour: every query snapshot is empty, every write succeeds.
 */

type DocumentData = Record<string, unknown>;

class MockTimestamp {
  constructor(private readonly date: Date) {}

  static fromDate(date: Date): MockTimestamp {
    return new MockTimestamp(date);
  }

  toDate(): Date {
    return this.date;
  }
}

const emptySnapshot = {
  docs: [],
  empty: true,
  size: 0,
  forEach: (_callback: (doc: unknown) => void) => {},
};

interface MockQuery {
  where: jest.Mock<MockQuery>;
  orderBy: jest.Mock<MockQuery>;
  onSnapshot: jest.Mock;
}

const createQuery = (): MockQuery => ({
  where: jest.fn(() => createQuery()),
  orderBy: jest.fn(() => createQuery()),
  onSnapshot: jest.fn(
    (onNext: (snapshot: typeof emptySnapshot) => void, _onError?: (error: Error) => void) => {
      onNext(emptySnapshot);
      return jest.fn(); // unsubscribe
    },
  ),
});

const createDoc = (id: string) => ({
  id,
  update: jest.fn((_data: DocumentData) => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve()),
});

const createCollection = () => ({
  ...createQuery(),
  add: jest.fn((_data: DocumentData) => Promise.resolve(createDoc('mock-doc-id'))),
  doc: jest.fn((id: string) => createDoc(id)),
});

const mockDb = {
  collection: jest.fn((_name: string) => createCollection()),
};

const firestore = Object.assign(
  jest.fn(() => mockDb),
  { Timestamp: MockTimestamp },
);

export default firestore;
