import { assert, assertError, assertString } from './assert.utils';

describe('assert', () => {
  it('should not throw an error when the condition is true', () => {
    expect(() => assert(true, 'Condition is true')).not.toThrow();
  });

  it('should throw an error when the condition is false', () => {
    expect(() => assert(false, 'Condition is false')).toThrow(
      'Assertion failed: Condition is false'
    );
  });
});

describe('assertError', () => {
  it('should not throw an error when the value is an Error', () => {
    const error = new Error('Test error');
    expect(() => assertError(error, 'It is an Error')).not.toThrow();
  });

  it('should throw an error when the value is not an Error', () => {
    const nonErrorValue = 'Not an error';
    expect(() => assertError(nonErrorValue, 'Not an Error')).toThrow(
      'Assertion failed: Not an Error'
    );
  });
});

describe('assertString', () => {
  it('should not throw an error when the value is a string', () => {
    const stringValue = 'Test string';
    expect(() => assertString(stringValue, 'It is a string')).not.toThrow();
  });

  it('should throw an error when the value is not a string', () => {
    const nonStringValue = 10;
    expect(() => assertString(nonStringValue, 'It is a string')).toThrow(
      'Assertion failed: It is a string'
    );
  });
});