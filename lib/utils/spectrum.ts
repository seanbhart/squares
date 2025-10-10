/**
 * Convert a spectrum value (0-6) to its corresponding emoji
 */
export function spectrumToEmoji(value: number): string {
  const emojiMap: Record<number, string> = {
    0: '🟪',
    1: '🟦',
    2: '🟩',
    3: '🟨',
    4: '🟧',
    5: '🟥',
    6: '⬛️',
  };
  
  return emojiMap[value] ?? '❓';
}

/**
 * Convert an array of spectrum values to emoji string
 */
export function spectrumArrayToEmojis(spectrum: number[]): string {
  return spectrum.map(spectrumToEmoji).join(' ');
}

/**
 * Get the color name for a spectrum value
 */
export function getSpectrumColorName(value: number): string {
  const colorNames: Record<number, string> = {
    0: 'Purple',
    1: 'Blue',
    2: 'Green',
    3: 'Yellow',
    4: 'Orange',
    5: 'Red',
    6: 'Black',
  };
  
  return colorNames[value] ?? 'Unknown';
}
