/**
 * Property types and schemas for Obsidian notes
 */
import { z } from "zod";
/**
 * Define validation schemas
 * Allow any string for type to be more flexible
 */
export declare const PropertyType: z.ZodString;
/**
 * Valid status values for notes
 */
export declare const StatusEnum: z.ZodEnum<["draft", "in-progress", "review", "complete"]>;
/**
 * Schema for reading properties (includes timestamps)
 */
export declare const ObsidianPropertiesSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    created: z.ZodOptional<z.ZodString>;
    modified: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    status: z.ZodOptional<z.ZodArray<z.ZodEnum<["draft", "in-progress", "review", "complete"]>, "many">>;
    version: z.ZodOptional<z.ZodString>;
    platform: z.ZodOptional<z.ZodString>;
    repository: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    sources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    urls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    papers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    custom: z.ZodOptional<z.ZodObject<{}, "strip", z.ZodUnknown, z.objectOutputType<{}, z.ZodUnknown, "strip">, z.objectInputType<{}, z.ZodUnknown, "strip">>>;
}, "strip", z.ZodTypeAny, {
    version?: string | undefined;
    type?: string[] | undefined;
    status?: ("draft" | "in-progress" | "review" | "complete")[] | undefined;
    title?: string | undefined;
    created?: string | undefined;
    modified?: string | undefined;
    author?: string | undefined;
    tags?: string[] | undefined;
    platform?: string | undefined;
    repository?: string | undefined;
    dependencies?: string[] | undefined;
    sources?: string[] | undefined;
    urls?: string[] | undefined;
    papers?: string[] | undefined;
    custom?: z.objectOutputType<{}, z.ZodUnknown, "strip"> | undefined;
}, {
    version?: string | undefined;
    type?: string[] | undefined;
    status?: ("draft" | "in-progress" | "review" | "complete")[] | undefined;
    title?: string | undefined;
    created?: string | undefined;
    modified?: string | undefined;
    author?: string | undefined;
    tags?: string[] | undefined;
    platform?: string | undefined;
    repository?: string | undefined;
    dependencies?: string[] | undefined;
    sources?: string[] | undefined;
    urls?: string[] | undefined;
    papers?: string[] | undefined;
    custom?: z.objectInputType<{}, z.ZodUnknown, "strip"> | undefined;
}>;
/**
 * Schema for validating property updates (excludes timestamps)
 */
export declare const PropertyUpdateSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    status: z.ZodOptional<z.ZodArray<z.ZodEnum<["draft", "in-progress", "review", "complete"]>, "many">>;
    version: z.ZodOptional<z.ZodString>;
    platform: z.ZodOptional<z.ZodString>;
    repository: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    sources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    urls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    papers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    custom: z.ZodOptional<z.ZodObject<{}, "strip", z.ZodUnknown, z.objectOutputType<{}, z.ZodUnknown, "strip">, z.objectInputType<{}, z.ZodUnknown, "strip">>>;
}, "strip", z.ZodTypeAny, {
    version?: string | undefined;
    type?: string[] | undefined;
    status?: ("draft" | "in-progress" | "review" | "complete")[] | undefined;
    title?: string | undefined;
    author?: string | undefined;
    tags?: string[] | undefined;
    platform?: string | undefined;
    repository?: string | undefined;
    dependencies?: string[] | undefined;
    sources?: string[] | undefined;
    urls?: string[] | undefined;
    papers?: string[] | undefined;
    custom?: z.objectOutputType<{}, z.ZodUnknown, "strip"> | undefined;
}, {
    version?: string | undefined;
    type?: string[] | undefined;
    status?: ("draft" | "in-progress" | "review" | "complete")[] | undefined;
    title?: string | undefined;
    author?: string | undefined;
    tags?: string[] | undefined;
    platform?: string | undefined;
    repository?: string | undefined;
    dependencies?: string[] | undefined;
    sources?: string[] | undefined;
    urls?: string[] | undefined;
    papers?: string[] | undefined;
    custom?: z.objectInputType<{}, z.ZodUnknown, "strip"> | undefined;
}>;
/**
 * Derived types from schemas
 */
export type ObsidianProperties = z.infer<typeof ObsidianPropertiesSchema>;
export type PropertyUpdate = z.infer<typeof PropertyUpdateSchema>;
/**
 * Property operation description
 */
export interface PropertyOperation {
    operation: 'get' | 'update' | 'patch';
    filepath: string;
    properties?: Partial<ObsidianProperties>;
    replace?: boolean;
}
/**
 * Result of property validation
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}
/**
 * Result of property operations
 */
export interface PropertyManagerResult {
    success: boolean;
    message: string;
    properties?: ObsidianProperties;
    errors?: string[];
}
