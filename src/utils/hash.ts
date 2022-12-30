import { v5 as uuidv5 } from 'uuid';
import fs from 'fs-extra';
import crypto from 'crypto';

const UUID_NAMESPACE = '9933e1a5-ee79-4e15-be29-bf7d49de728d';

export function hash(str: string) {
  return uuidv5(str, UUID_NAMESPACE);
}

export async function hashImage(imagePath: string) {
  const fileBuffer = await fs.readFile(imagePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}
