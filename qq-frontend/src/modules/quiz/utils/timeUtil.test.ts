import { formatDuration } from './timeUtil';

describe('testUtil tests', () => {
  describe('formatDuration tests', () => {
    it('should format durations with hours', () => {
      expect(formatDuration(3600)).toEqual('1 час');
    });

    it('should format durations with minutes', () => {
      expect(formatDuration(180)).toEqual('3 минуты');
    });

    it('should format durations with hours, minutes, seconds', () => {
      expect(formatDuration(3*60*60 + 3*60  + 3)).toEqual('3 часа 3 минуты 3 секунды');
    });

    it('should format empty duration', () => {
      expect(formatDuration(0)).toEqual('');
    });

    it('should not format negative numbers', () => {
      expect(() => {
        formatDuration(-1);
      }).toThrow();
    });
  });
  
});
