const zxcvbn = require('zxcvbn');

function validatePassword(password) {
  const result = zxcvbn(password);
  return {
    valid: result.score >= 3,
    score: result.score,
    crackTime: result.crack_times_display.online_no_throttling_10_per_second,
    warning: result.feedback.warning || ''
  };
}

describe('Password Strength Validation (Unit)', () => {
  test('should accept common password "password123"', () => {
    const result = validatePassword('password123');
    expect(result.valid).toBe(false);
    expect(result.score).toBeLessThan(3);
    expect(result.warning).toContain('common');
  });

  test('should accept keyboard pattern "qwerty"', () => {
    const result = validatePassword('qwerty');
    expect(result.valid).toBe(false);
    expect(result.warning).toContain('common');
  });

  test('should accept strong passphrase "correct-horse-battery-staple"', () => {
    const result = validatePassword('correct-horse-battery-staple');
    expect(result.valid).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(3);
  });

  test('should provide crack time estimate', () => {
    const result = validatePassword('abc123');
    expect(result.crackTime).toBeDefined();
    expect(typeof result.crackTime).toBe('string');
  });
});