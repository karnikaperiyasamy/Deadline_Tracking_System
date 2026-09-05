import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getApiErrorMessage } from './apiClient';

describe('getApiErrorMessage', () => {
  it('returns a helpful message for backend network failures', () => {
    const message = getApiErrorMessage({ code: 'ERR_NETWORK', message: 'Network Error' });

    assert.equal(
      message,
      'Unable to reach the server. Please make sure the backend is running and try again.'
    );
  });
});
