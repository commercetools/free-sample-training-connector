import dotenv from 'dotenv';
dotenv.config();

import { assertError } from '../utils/assert.utils';
import { deleteProductPublishedSubscription } from './actions';

async function preUndeploy(): Promise<void> {
  await deleteProductPublishedSubscription();
}

export async function run(): Promise<void> {
  try {
    await preUndeploy();
  } catch (error) {
    assertError(error);
    process.stderr.write(`Post-undeploy failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

run();
