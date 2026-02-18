/**
 * Resource types for the MCP server
 */
/**
 * Tag information structure
 */
export interface TagInfo {
    name: string;
    count: number;
    files: string[];
}
/**
 * Tag metadata structure
 */
export interface TagMetadata {
    totalOccurrences: number;
    uniqueTags: number;
    scannedFiles: number;
    lastUpdate: number;
}
/**
 * Tag resource response structure
 */
export interface TagResponse {
    tags: TagInfo[];
    metadata: TagMetadata;
}
