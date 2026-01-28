export function CodeBlock({ lang, children }: { lang?: string; children: string }) {
  return (
    <pre data-lang={lang} className="mdx-code">
      <code>{children}</code>
    </pre>
  )
}
