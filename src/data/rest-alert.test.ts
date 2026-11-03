import * as Notifications from 'expo-notifications';

import { allowRestAlert, cancelRestAlert, restAlertAllowed, scheduleRestAlert } from './rest-alert';
import { updateSettings } from './settings';

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'timeInterval' },
  AndroidImportance: { HIGH: 5 },
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve(null)),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  dismissNotificationAsync: jest.fn(() => Promise.resolve()),
}));

const n = jest.mocked(Notifications);
const flush = () => new Promise<void>((r) => setImmediate(() => r()));

beforeEach(() => {
  jest.clearAllMocks();
  let id = 0;
  n.scheduleNotificationAsync.mockImplementation(() => Promise.resolve(`alert-${++id}`));
  updateSettings({ restAlert: true });
});

afterEach(() => {
  cancelRestAlert();
  updateSettings({ restAlert: false });
});

test('the next rest clears the last "Rest over" from the lock screen, so they never pile up', async () => {
  scheduleRestAlert(Date.now() + 60_000);
  await flush();
  expect(n.dismissNotificationAsync).not.toHaveBeenCalled();
  cancelRestAlert();
  expect(n.dismissNotificationAsync).not.toHaveBeenCalled();
  scheduleRestAlert(Date.now() + 60_000);
  expect(n.dismissNotificationAsync).toHaveBeenCalledWith('alert-1');
});

test('with the setting off, nothing is scheduled', async () => {
  updateSettings({ restAlert: false });
  scheduleRestAlert(Date.now() + 60_000);
  await flush();
  expect(n.scheduleNotificationAsync).not.toHaveBeenCalled();
});

test('cancel takes back the waiting alert', async () => {
  scheduleRestAlert(Date.now() + 60_000);
  await flush();
  cancelRestAlert();
  expect(n.cancelScheduledNotificationAsync).toHaveBeenCalledWith('alert-1');
});

test('restAlertAllowed reads the phone without asking', async () => {
  n.getPermissionsAsync.mockResolvedValue({ granted: false } as never);
  await expect(restAlertAllowed()).resolves.toBe(false);
  n.getPermissionsAsync.mockResolvedValue({ granted: true } as never);
  await expect(restAlertAllowed()).resolves.toBe(true);
  expect(n.requestPermissionsAsync).not.toHaveBeenCalled();
});

test('allowRestAlert does not ask again once the phone said no for good', async () => {
  n.getPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: false } as never);
  await expect(allowRestAlert()).resolves.toBe(false);
  expect(n.requestPermissionsAsync).not.toHaveBeenCalled();
});
