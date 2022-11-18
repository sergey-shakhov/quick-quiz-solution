import { nanoid } from 'nanoid';

function generateQuizId(): string {
  return nanoid(32);
}

export {
  generateQuizId,
};
