import { describe, expect, it } from 'vitest';
import { classifyCameraError } from './camera';

describe('classifyCameraError', () => {
  it.each([
    ['NotAllowedError', 'denied'],
    ['NotFoundError', 'not-found'],
    ['NotReadableError', 'in-use'],
    ['InsecureContextError', 'insecure'],
  ])('%s → %s', (name, expected) => {
    expect(classifyCameraError(new DOMException('x', name))).toBe(expected);
  });

  it('DOMException이 아니면 unknown', () => {
    expect(classifyCameraError(new Error('x'))).toBe('unknown');
  });
});
