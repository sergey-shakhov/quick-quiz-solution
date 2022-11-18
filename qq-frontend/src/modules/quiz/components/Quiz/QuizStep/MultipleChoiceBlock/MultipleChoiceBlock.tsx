import React from 'react';
import Markdown from 'markdown-to-jsx';
import map from 'lodash/map';
import toString from 'lodash/toString';
import uniqueId from 'lodash/uniqueId';
import cloneDeep from 'lodash/cloneDeep';
import times from 'lodash/times';
import constant from 'lodash/constant';

import BlockProps from '../BlockProps';

const MultipleChoiceBlock: React.FC<BlockProps> = (props: BlockProps) => {

  const checkedArray = (() => {
    if (Array.isArray(props.answer)) {
      let array = props.answer as boolean[];
      for (let i = 0; i < props.quizStepModel.answerOptions.length; i++) {
        if (array[i] === undefined) {
          array[i] = false;
        }
      }
      return array;
    } else {
      return times(props.quizStepModel.answerOptions.length, constant(false));
    }
  })();

  const onValueChange = (index: number, value: boolean) => {
    const clonedCheckedArray = cloneDeep(checkedArray);
    clonedCheckedArray[index] = value;
    props.onChange(clonedCheckedArray);
  };

  const blockId = 'block_' + uniqueId();

  return (
    <form>
      <div>
        <Markdown>
          {props.quizStepModel.questionTextInMarkdown}
        </Markdown>
      </div>

      {
        (map(props.quizStepModel.answerOptions, (answerOption, index) => {
          const optionId = blockId + '_' + index;
          return (<label htmlFor={optionId} key={optionId}>
            <input type="checkbox" id={optionId} name={optionId} value={toString(index)} checked={checkedArray[index]} onChange={(event) => onValueChange(index, event.target.checked)} />
            <Markdown>{answerOption.answerTextInMarkdown}</Markdown>
          </label>);
        }))
      }

    </form>
  );
};

export default MultipleChoiceBlock;
