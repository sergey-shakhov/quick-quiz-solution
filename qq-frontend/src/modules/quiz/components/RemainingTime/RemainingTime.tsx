import React from 'react';
import isNumner from 'lodash/isNumber';
import { observer } from 'mobx-react-lite';

import quizStore from '../../stores/quizStore';

import { formatDurationAsTimer } from '../../utils/timeUtil';

const RemainingTime = observer(() => {

  const remainingTimeInSeconds = quizStore.liveRemainingTimeInSeconds;

  if (isNumner(remainingTimeInSeconds)) {
    if (remainingTimeInSeconds > 0) {
      const formattedRemainingTime = formatDurationAsTimer(remainingTimeInSeconds);
      return <>Осталось времени <strong>{formattedRemainingTime}</strong></>;
    } else {
      return <strong>Время закончилось, завершаем тест...</strong>;
    }
  } else {
    return null;
  }
});

export default RemainingTime;
