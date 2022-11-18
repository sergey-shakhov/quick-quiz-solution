import React from 'react';
import uniqueId from 'lodash/uniqueId';
import Markdown from 'markdown-to-jsx';

import BlockProps from '../BlockProps';

const TextInputBlock: React.FC<BlockProps> = (props: BlockProps) => {

  const onValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange(event.target.value);
  };

  const blockId = 'block_' + uniqueId();

  const fieldId = blockId + '_input';

  return (
    <label htmlFor={fieldId}>
      <div>
        <Markdown>
          {props.quizStepModel.questionTextInMarkdown}
        </Markdown>
      </div>
      {
        !props.quizStepModel.answerOptions || props.quizStepModel.answerOptions.length <= 0
          ? null
          : <div>
            <Markdown>
              {props.quizStepModel.answerOptions[0].answerTextInMarkdown}
            </Markdown>
          </div>
      }
      <input type="text" id={fieldId} name={fieldId} placeholder="Введите ваш ответ здесь" required onChange={(event) => onValueChange(event)} />
    </label>
  );
};

export default TextInputBlock;
