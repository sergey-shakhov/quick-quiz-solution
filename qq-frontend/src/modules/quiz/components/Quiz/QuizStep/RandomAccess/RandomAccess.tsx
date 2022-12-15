import React from 'react';
import { observer } from 'mobx-react-lite';
import map from 'lodash/map';
import times from 'lodash/times';
import range from 'lodash/range';

import quizStore from '../../../../stores/quizStore';

import styles from './RandomAccess.module.css';

type Props = {
  onStepNavigationRequested: (stepIndex: number) => void;
};

const RandomAccess: React.FC<Props> = observer((props: Props) => {

  const onChange = (valueAsString: string) => {
    const stepIndex = parseInt(valueAsString) - 1;
    props.onStepNavigationRequested(stepIndex);
  };

  if (!quizStore.maxAvailableStepIndex || !quizStore.currentQuizStep) {
    return null;
  }

  return (<div className={styles.component}>
    <span>Вернуться к вопросу</span>
          
    <select style={{display: 'inline-block', width: '100px'}} onChange={(evt) => onChange(evt.target.value)} value={quizStore.currentQuizStep.stepIndex + 1}>
      {
        map(range(quizStore.maxAvailableStepIndex + 1), (stepIndex: number) => (<option key={stepIndex}>{stepIndex + 1}</option>))
      }
    </select>
  </div>);
});

export default RandomAccess;
