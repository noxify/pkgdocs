import z from "zod"

/**
 * Zod schema for MDX frontmatter validation.
 * Defines the structure and validation rules for page metadata.
 */
export const frontmatterSchema = z.object({
  /** Specifies the page title. If not specified, the transformed file name will be used */
  title: z.string().optional(),
  /** Specifies the page description. If not specified, no description will be set */
  description: z.string().optional(),
  /** Specifies tags for the page */
  tags: z.array(z.string()).optional(),
  /**
   * Specifies the navigation title.
   *
   * - If not specified, the `title` prop will be used
   * - If `title` is also not specified, the transformed file name will be used
   */
  navTitle: z.string().optional(),
  /**
   * Specifies the entry point / landing page in the collection chooser.
   *
   * If not specified, the collection path will be used (e.g., `/docs/<collection-name>`)
   */
  entrypoint: z.string().optional(),
  /** Specifies an alias for the collection */
  alias: z.string().optional(),
  /** Should the table of contents be displayed. Defaults to true */
  toc: z.boolean().optional().default(true),
  /** Specifies the current page as an external link */
  externalLink: z.string().url().optional(),
  /** Should the current page be hidden from the section grid. Defaults to false */
  hideFromSectionGrid: z.boolean().optional().default(false),
})

/**
 * Zod schema for page heading validation.
 * Defines the structure for extracted headings with level, text, and id.
 */
export const headingSchema = z.array(
  z.object({
    /** The heading level (1-6) */
    level: z.number(),
    /** The heading text content */
    text: z.string(),
    /** The unique identifier for the heading */
    id: z.string(),
  }),
)

/**
 * Combined schema for documentation pages.
 * Contains frontmatter and headings schemas.
 */
export const docSchema = {
  frontmatter: frontmatterSchema,
}

export type Frontmatter = z.infer<typeof frontmatterSchema>
export type DocSchema = typeof docSchema
