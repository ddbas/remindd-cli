#!/usr/bin/env node
import notifier from 'node-notifier';

import getLogger, { Logger } from '../logger.js';
import Store from '../store.js';

type TimeoutInfo = {
    time: number;
    timeout: NodeJS.Timeout;
};

const THRESHOLD = 60000;
const SYNC_INTERVAL = 5000;

const logger = getLogger(Logger.DAEMON);

logger.info('Daemon started.');

const store = new Store();
const timeouts: Record<string, TimeoutInfo> = {};

const synchronize = async () => {
    logger.info('Synchronizing.');

    logger.trace('Getting store data.');
    let data;
    try {
        data = await store.getData();
    } catch (error) {
        logger.warn(error, 'Failed to get the store data.');
        return;
    }

    logger.trace('Iterating over the records.');
    const imminentReminders: Set<string> = new Set();
    data.records.forEach((record) => {
        const childLogger = logger.child({ record });
        childLogger.debug('Processing record.');

        const { id, reminder } = record;
        if (reminder.date.getTime() < Date.now()) {
            childLogger.trace('Reminder is in the past.');
            return;
        } else if (reminder.date.getTime() > Date.now() + THRESHOLD) {
            childLogger.trace('Too early to setup a timer.');
            return;
        }

        imminentReminders.add(id);

        const existingTimeoutInfo = timeouts[id];
        if (existingTimeoutInfo != null) {
            childLogger.trace('Found an existing timer.');
            if (existingTimeoutInfo.time === reminder.date.getTime()) {
                childLogger.trace("Reminder date hasn't changed");
                return;
            }

            childLogger.trace('Reminder was rescheduled.');
            clearTimeout(existingTimeoutInfo.timeout);
        }

        const delay = reminder.date.getTime() - Date.now();
        const timeout = setTimeout(() => {
            childLogger.info('Sending notification.');
            notifier.notify({
                title: 'Reminder',
                message: reminder.title,
            });
            delete timeouts[id];
        }, delay);
        const timeoutInfo = {
            time: reminder.date.getTime(),
            timeout,
        };
        childLogger.debug({ time: timeoutInfo.time }, 'Timer set.');
        timeouts[id] = timeoutInfo;
    });

    logger.trace('Examining existing timers.');
    Object.keys(timeouts).forEach((id) => {
        const childLogger = logger.child({ id });
        childLogger.trace('Examining timer.');
        if (imminentReminders.has(id)) {
            childLogger.trace('Timer is still valid.');
            return;
        }

        // Cancel the reminder.
        childLogger.trace('Timer is no longer valid.');
        const { timeout } = timeouts[id];
        clearTimeout(timeout);
        delete timeouts[id];
        childLogger.trace('Timer cancelled.');
    });
};

const synchronizeCallback = async () => {
    try {
        await synchronize();
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

synchronizeCallback();
setInterval(synchronizeCallback, SYNC_INTERVAL);
