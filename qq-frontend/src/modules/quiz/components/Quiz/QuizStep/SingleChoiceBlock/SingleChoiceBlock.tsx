import React from 'react';
import Markdown from 'markdown-to-jsx';
import map from 'lodash/map';
import toString from 'lodash/toString';
import uniqueId from 'lodash/uniqueId';

import BlockProps from '../BlockProps';

const SingleChoiceBlock: React.FC<BlockProps> = (props: BlockProps) => {
  const onValueChange = (value: string) => {
    props.onChange(parseInt(value));
  };

  const checkedIndex = (() => {
    if (typeof props.answer === 'number') {
      return props.answer as number;
    } else {
      return 0;
    }
  })();

  const blockId = 'block_' + uniqueId();

  return (
    <fieldset>
      <legend>
        <Markdown>
          {props.quizStepModel.questionTextInMarkdown}
        </Markdown>
      </legend>

      {
        (map(props.quizStepModel.answerOptions, (answerOption, index) => {
          const optionId = blockId + '_' + index;
          return (<label htmlFor={optionId} key={optionId}>
            <input type="radio" id={optionId} name={optionId} value={toString(index)} checked={checkedIndex === index} onChange={(event) => onValueChange(event.target.value)} />
            <Markdown>{answerOption.answerTextInMarkdown}</Markdown>
          </label>);
        }))
      }

    </fieldset>
  );
};

export default SingleChoiceBlock;

