/**
 * Splits a large string of text into smaller chunks based on a maximum size.
 * It attempts to split along logical breaks (like headers, identified by double newlines)
 * to keep related content together.
 *
 * @param text The full text to be chunked.
 * @param maxChunkSize The target maximum size for each chunk (in characters).
 * @returns An array of text chunks.
 */
export const chunkText = (text: string, maxChunkSize: number): string[] => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Regex to find potential headers/logical breaks. It looks for one or more blank lines
  // followed by a line that is likely a title (doesn't start with whitespace, list markers, etc.).
  // The (?=...) is a positive lookahead, which keeps the delimiter (the header) at the start of the next split part.
  const headerRegex = /\n\s*\n(?=\S.*$)/m;
  const logicalBlocks = text.split(headerRegex).map(block => block.trim()).filter(block => block.length > 0);

  // If the text cannot be split into logical blocks, or if it's smaller than the max size,
  // return it as a single chunk.
  if (logicalBlocks.length <= 1 && text.length <= maxChunkSize) {
    return [text];
  }
  
  // If we couldn't split by headers but the text is large, we have to split by size.
  // This is a fallback to avoid oversized chunks.
  if (logicalBlocks.length <= 1) {
      console.warn("Could not split text by headers. Falling back to size-based chunking.");
      const chunks: string[] = [];
      for (let i = 0; i < text.length; i += maxChunkSize) {
          chunks.push(text.substring(i, i + maxChunkSize));
      }
      return chunks;
  }

  const chunks: string[] = [];
  let currentChunk = "";

  for (const block of logicalBlocks) {
    // If adding the next block would exceed the max size, push the current chunk and start a new one.
    // An exception is made if the current chunk is empty, to ensure even large blocks are added.
    if (currentChunk.length > 0 && (currentChunk.length + block.length + 2) > maxChunkSize) {
      chunks.push(currentChunk);
      currentChunk = "";
    }

    // Add the block to the current chunk.
    currentChunk += (currentChunk.length > 0 ? '\n\n' : '') + block;
  }

  // Add the last remaining chunk.
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
};
