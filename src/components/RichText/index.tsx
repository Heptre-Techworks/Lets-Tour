import { MediaBlock } from '@/blocks/MediaBlock/Component'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  type DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { defaultColors } from '@payloadcms/richtext-lexical/client'

import { CodeBlock, CodeBlockProps } from '@/blocks/Code/Component'

import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
} from '@/payload-types'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { cn } from '@/utilities/ui'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CTABlockProps | MediaBlockProps | BannerBlockProps | CodeBlockProps>

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`
}


// ---------------------------------------------------------------------------
// Text styling saved by the admin editor (text colour, highlight, font size, font family).
// Payload's default text converter ignores all of it, so choosing a colour in the admin
// never reached the website. These maps mirror the options in `src/fields/defaultLexical.ts`.
// ---------------------------------------------------------------------------
type CssMap = Record<string, string>
const FONT_SIZE_CSS: Record<string, CssMap> = {
  small: { 'font-size': '14px' },
  medium: { 'font-size': '16px' },
  large: { 'font-size': '20px' },
  xlarge: { 'font-size': '24px' },
  xxlarge: { 'font-size': '32px' },
}

const toCamel = (prop: string) =>
  prop.startsWith('--') ? prop : prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())

const addCss = (target: React.CSSProperties, css?: CssMap) => {
  if (!css) return
  Object.entries(css).forEach(([k, v]) => {
    ;(target as Record<string, string>)[toCamel(k)] = v
  })
}

/** Inline `style="color: red; font-family: X"` string saved on a text node → style object. */
const parseInlineStyle = (raw: unknown): React.CSSProperties => {
  const out: React.CSSProperties = {}
  if (typeof raw !== 'string') return out
  raw.split(';').forEach((decl) => {
    const i = decl.indexOf(':')
    if (i === -1) return
    const prop = decl.slice(0, i).trim()
    const val = decl.slice(i + 1).trim()
    if (prop && val) (out as Record<string, string>)[toCamel(prop)] = val
  })
  return out
}

const textNodeStyle = (node: any): React.CSSProperties | null => {
  const style: React.CSSProperties = parseInlineStyle(node?.style)
  const state = node?.$ as Record<string, string> | undefined
  if (state) {
    addCss(style, (defaultColors.text as Record<string, { css: CssMap }>)[state.color]?.css)
    addCss(style, (defaultColors.background as Record<string, { css: CssMap }>)[state.background]?.css)
    addCss(style, FONT_SIZE_CSS[state['font-size']])
  }
  return Object.keys(style).length ? style : null
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  text: (args) => {
    const base = (defaultConverters.text as any)(args)
    const style = textNodeStyle(args.node)
    // `[&_strong]:text-inherit`: bold text must keep the colour picked for it (prose would otherwise recolour <strong>).
    return style ? (
      <span style={style} className="[&_strong]:text-inherit [&_em]:text-inherit">
        {base}
      </span>
    ) : (
      base
    )
  },
  ...LinkJSXConverter({ internalDocToHref }),
  blocks: {
    banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0"
        {...node.fields}
        captionClassName="mx-auto max-w-[48rem]"
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props
  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}
