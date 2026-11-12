/// <reference types="node" />
/**
 * Firestore security rules tests (run with `npm run test:rules`).
 *
 * These run the real firestore.rules in the Firestore emulator, so they test
 * what actually protects user data, independently of the app code.
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

const ALICE = 'alice';
const BOB = 'bob';

let env: RulesTestEnvironment;

const at = (hour: number, minute = 0) => Timestamp.fromDate(new Date(2026, 10, 12, hour, minute));

/** A document exactly as the app writes it (see eventsApi.createEvent). */
const validEvent = (userId: string) => ({
  userId,
  title: 'Standup',
  startDate: at(9),
  endDate: at(10),
  color: '#4A90E2',
  description: null,
});

/** Copy of `data` without `key`. */
const without = (data: Record<string, unknown>, key: string) =>
  Object.fromEntries(Object.entries(data).filter(([k]) => k !== key));

/** Firestore client acting as `uid`, or signed out. */
const db = (uid?: string) =>
  (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore();

/** Write test data directly, bypassing the rules. */
const seed = (id: string, data: Record<string, unknown>) =>
  env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'events', id), data);
  });

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-calendar-app',
    firestore: { rules: readFileSync(resolve(__dirname, '../firestore.rules'), 'utf8') },
  });
});

afterAll(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
});

describe('reading events', () => {
  beforeEach(async () => {
    await seed('alice-event', validEvent(ALICE));
  });

  it('lets the owner read their event', async () => {
    await assertSucceeds(getDoc(doc(db(ALICE), 'events', 'alice-event')));
  });

  it("blocks reading someone else's event", async () => {
    await assertFails(getDoc(doc(db(BOB), 'events', 'alice-event')));
  });

  it('blocks signed-out reads', async () => {
    await assertFails(getDoc(doc(db(), 'events', 'alice-event')));
  });

  it("allows the app's query: own events filtered by userId", async () => {
    const own = query(collection(db(ALICE), 'events'), where('userId', '==', ALICE));
    await assertSucceeds(getDocs(own));
  });

  it('rejects queries that could return other users\' events (rules are not filters)', async () => {
    await assertFails(getDocs(collection(db(ALICE), 'events')));
    await assertFails(getDocs(query(collection(db(ALICE), 'events'), where('userId', '==', BOB))));
  });
});

describe('creating events', () => {
  const create = (uid: string | undefined, data: Record<string, unknown>) =>
    addDoc(collection(db(uid), 'events'), data);

  it('accepts a valid event owned by the creator', async () => {
    await assertSucceeds(create(ALICE, validEvent(ALICE)));
  });

  it('accepts a description that is a string, null or absent', async () => {
    await assertSucceeds(create(ALICE, { ...validEvent(ALICE), description: 'Room 4' }));
    await assertSucceeds(create(ALICE, without(validEvent(ALICE), 'description')));
  });

  it('rejects an event stamped with someone else\'s userId', async () => {
    await assertFails(create(ALICE, validEvent(BOB)));
  });

  it('rejects signed-out creates', async () => {
    await assertFails(create(undefined, validEvent(ALICE)));
  });

  it('requires the end to be after the start', async () => {
    await assertFails(create(ALICE, { ...validEvent(ALICE), endDate: at(9) }));
    await assertFails(create(ALICE, { ...validEvent(ALICE), endDate: at(8) }));
  });

  it('requires a 1–100 character title (after trimming)', async () => {
    await assertFails(create(ALICE, { ...validEvent(ALICE), title: '' }));
    await assertFails(create(ALICE, { ...validEvent(ALICE), title: '   ' }));
    await assertFails(create(ALICE, { ...validEvent(ALICE), title: 'a'.repeat(101) }));
    await assertSucceeds(create(ALICE, { ...validEvent(ALICE), title: 'a'.repeat(100) }));
  });

  it('requires a hex colour', async () => {
    await assertFails(create(ALICE, { ...validEvent(ALICE), color: 'blue' }));
    await assertSucceeds(create(ALICE, { ...validEvent(ALICE), color: '#1ABC9C' }));
  });

  it('requires timestamps for dates', async () => {
    await assertFails(create(ALICE, { ...validEvent(ALICE), startDate: '2026-11-12T09:00' }));
  });

  it('rejects missing required fields and unknown extra fields', async () => {
    await assertFails(create(ALICE, without(validEvent(ALICE), 'color')));
    await assertFails(create(ALICE, { ...validEvent(ALICE), isAdmin: true }));
  });

  it('caps the description at 1000 characters', async () => {
    await assertFails(create(ALICE, { ...validEvent(ALICE), description: 'a'.repeat(1001) }));
  });
});

describe('updating events', () => {
  beforeEach(async () => {
    await seed('alice-event', validEvent(ALICE));
  });

  const ref = (uid?: string) => doc(db(uid), 'events', 'alice-event');

  it('lets the owner change fields', async () => {
    await assertSucceeds(updateDoc(ref(ALICE), { title: 'Retro', color: '#E74C3C' }));
  });

  it('blocks transferring the event to another user', async () => {
    await assertFails(updateDoc(ref(ALICE), { userId: BOB }));
  });

  it("blocks editing someone else's event", async () => {
    await assertFails(updateDoc(ref(BOB), { title: 'Hacked' }));
  });

  it('validates the merged result, not just the changed fields', async () => {
    // Only endDate is sent, but it would end before the stored startDate
    await assertFails(updateDoc(ref(ALICE), { endDate: at(8) }));
  });
});

describe('deleting events', () => {
  beforeEach(async () => {
    await seed('alice-event', validEvent(ALICE));
  });

  it('lets the owner delete', async () => {
    await assertSucceeds(deleteDoc(doc(db(ALICE), 'events', 'alice-event')));
  });

  it("blocks deleting someone else's event", async () => {
    await assertFails(deleteDoc(doc(db(BOB), 'events', 'alice-event')));
  });
});

describe('everything else', () => {
  it('denies access to any other collection by default', async () => {
    await assertFails(setDoc(doc(db(ALICE), 'users', ALICE), { name: 'Alice' }));
    await assertFails(getDoc(doc(db(ALICE), 'users', ALICE)));
  });
});
