import { v4 as uuidv4 } from 'uuid';

function newId() {
  return uuidv4();
}

export {
  newId,
};
