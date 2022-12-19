import { v5 as uuidv5 } from 'uuid';

const UUID_NAMESPACE = '9933e1a5-ee79-4e15-be29-bf7d49de728d';

export function hash(str: string) {
  return uuidv5(str, UUID_NAMESPACE);
}
