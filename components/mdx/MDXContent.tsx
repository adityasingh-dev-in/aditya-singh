import * as runtime from 'react/jsx-runtime'
import { MDXComponents } from './MDXComponents'

interface MDXContentProps {
  code: string
  components?: Record<string, React.ComponentType<unknown>>
}

const getMDXComponent = (code: string) => {
  const fn = new Function(code)
  return fn({ ...runtime }).default
}

export function MDXContent({ code, components }: MDXContentProps) {
  const Component = getMDXComponent(code)
  return <Component components={{ ...MDXComponents, ...components }} />
}
