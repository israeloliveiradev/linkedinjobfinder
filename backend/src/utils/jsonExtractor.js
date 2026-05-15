export function extractJsonFromString(str) {
  if (!str) return null;
  const match = str.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch (error) {
    return null;
  }
}
