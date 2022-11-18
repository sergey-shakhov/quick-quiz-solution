import nodeSchedule from 'node-schedule';

import { DateTime } from './models';

function scheduleAt(at: DateTime, callback: () => void) {
  nodeSchedule.scheduleJob(at, callback);
}

export {
  scheduleAt,
};


