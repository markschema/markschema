import type { SchemaIntrospection, SchemaNodeMeta, SchemaSectionMeta } from '@/lib/playground-model'

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const classNameOf = (value: unknown): string =>
  isObject(value) && (value as any).constructor ? (value as any).constructor.name : typeof value

const constraintFromPrimitive = (schema: any): string[] => {
  const constraints: string[] = []
  const name = classNameOf(schema)

  if (name === 'StringSchema' || name === 'EmailSchema' || name === 'UrlSchema') {
    if (schema.minLength !== undefined) constraints.push(`min(${schema.minLength})`)
    if (schema.maxLength !== undefined) constraints.push(`max(${schema.maxLength})`)
    if (schema.shouldTrim) constraints.push('trim()')
    if (schema.startsWithValue !== undefined) constraints.push(`startsWith(${JSON.stringify(schema.startsWithValue)})`)
    if (schema.endsWithValue !== undefined) constraints.push(`endsWith(${JSON.stringify(schema.endsWithValue)})`)
    if (schema.includesValue !== undefined) constraints.push(`includes(${JSON.stringify(schema.includesValue)})`)
  }

  if (name === 'NumberSchema') {
    if (schema.mustBeInt) constraints.push('int()')
    if (schema.minValue !== undefined) constraints.push(`min(${schema.minValue})`)
    if (schema.maxValue !== undefined) constraints.push(`max(${schema.maxValue})`)
  }

  if (name === 'ArraySchema') {
    if (schema.minItems !== undefined) constraints.push(`min(${schema.minItems})`)
    if (schema.maxItems !== undefined) constraints.push(`max(${schema.maxItems})`)
    if (schema.exactLength !== undefined) constraints.push(`length(${schema.exactLength})`)
  }

  if (name === 'LiteralSchema' && schema.literalValue !== undefined) {
    constraints.push(`literal(${JSON.stringify(schema.literalValue)})`)
  }

  if (name === 'EnumSchema' && Array.isArray(schema.values)) {
    constraints.push(`enum(${schema.values.join(', ')})`)
  }

  return constraints
}

type UnwrappedSchema = {
  schema: any
  wrappers: string[]
  constraints: string[]
}

const unwrapSchema = (schema: any): UnwrappedSchema => {
  const wrappers: string[] = []
  const constraints: string[] = []
  let current = schema

  for (let depth = 0; depth < 24; depth += 1) {
    const name = classNameOf(current)

    if (name === 'OptionalSchema') {
      wrappers.push('optional')
      current = current.inner
      continue
    }
    if (name === 'NullableSchema') {
      wrappers.push('nullable')
      current = current.inner
      continue
    }
    if (name === 'DefaultSchema') {
      wrappers.push(`default(${JSON.stringify(current.defaultValue)})`)
      current = current.inner
      continue
    }
    if (name === 'TransformSchema') {
      wrappers.push('transform')
      current = current.inner
      continue
    }
    if (name === 'PipelineSchema') {
      wrappers.push('pipeline')
      if (current.left) {
        constraints.push(...constraintFromPrimitive(current.left))
      }
      current = current.right
      continue
    }
    if (name === 'ErrorMapSchema') {
      wrappers.push('errorMap')
      current = current.inner
      continue
    }
    if (name === 'PreprocessSchema') {
      wrappers.push('preprocess')
      current = current.inner
      continue
    }

    break
  }

  constraints.push(...constraintFromPrimitive(current))

  return { schema: current, wrappers, constraints }
}

const buildNode = (label: string, kind: string, constraints: string[] = [], children: SchemaNodeMeta[] = []): SchemaNodeMeta => ({
  id: `${label}:${kind}:${Math.random().toString(36).slice(2, 8)}`,
  label,
  kind,
  constraints,
  children,
})

const inspectSchemaNode = (schema: any, label: string, seen: WeakSet<object>): SchemaNodeMeta => {
  if (!isObject(schema)) {
    return buildNode(label, typeof schema, [], [])
  }

  if (seen.has(schema)) {
    return buildNode(label, 'circular', [], [])
  }
  seen.add(schema)

  const { schema: unwrapped, wrappers, constraints } = unwrapSchema(schema)
  const kind = classNameOf(unwrapped)

  if (kind === 'DocumentSchema' && isObject(unwrapped.shape)) {
    const children = Object.entries(unwrapped.shape).map(([key, child]) =>
      inspectSchemaNode(child, key, seen),
    )
    return buildNode(label, 'document', wrappers, children)
  }

  if (kind === 'SectionFieldsSchema' && isObject(unwrapped.shape)) {
    const children = Object.entries(unwrapped.shape).map(([key, child]) => inspectSchemaNode(child, key, seen))
    const sectionName = String(unwrapped.sectionName ?? label)
    return buildNode(sectionName, 'section.fields', [...wrappers, ...constraints], children)
  }

  if (kind === 'SectionParagraphSchema') {
    return buildNode(String(unwrapped.sectionName ?? label), 'section.paragraph', [...wrappers, ...constraints], [])
  }

  if (kind === 'SectionParagraphsSchema') {
    const children = Array.isArray(unwrapped.schemas)
      ? unwrapped.schemas.map((child: any, index: number) => inspectSchemaNode(child, `paragraph[${index}]`, seen))
      : []
    return buildNode(String(unwrapped.sectionName ?? label), 'section.paragraphs', [...wrappers, ...constraints], children)
  }

  if (kind === 'SectionListSchema') {
    const child = inspectSchemaNode(unwrapped.itemSchema, 'item', seen)
    return buildNode(String(unwrapped.sectionName ?? label), 'section.list', [...wrappers, ...constraints], [child])
  }

  if (kind === 'SectionCollectionSchema' || kind === 'SectionTableSchema') {
    const childSchema = unwrapped.itemSchema ?? unwrapped.schema
    const children = childSchema ? [inspectSchemaNode(childSchema, 'item', seen)] : []
    return buildNode(String(unwrapped.sectionName ?? label), `section.${kind === 'SectionTableSchema' ? 'tables' : 'collection'}`, [...wrappers, ...constraints], children)
  }

  if (kind === 'SectionChildrenEachSchema') {
    const child = inspectSchemaNode(unwrapped.childSchema, 'subsection', seen)
    const notes: string[] = []
    if (Array.isArray(unwrapped.expectedHeadings) && unwrapped.expectedHeadings.length > 0) {
      notes.push(`sequence(${unwrapped.expectedHeadings.map((value: unknown) => String(value)).join(', ')})`)
    }
    if (unwrapped.childDepth) {
      notes.push(`headingLevel(${unwrapped.childDepth})`)
    }
    return buildNode(String(unwrapped.sectionName ?? label), 'section.each', [...wrappers, ...notes], [child])
  }

  if (kind === 'ObjectSchema' && isObject(unwrapped.shape)) {
    const children = Object.entries(unwrapped.shape).map(([key, child]) => inspectSchemaNode(child, key, seen))
    const policy = unwrapped.options?.unknownKeys ? [`unknownKeys:${unwrapped.options.unknownKeys}`] : []
    return buildNode(label, 'object', [...wrappers, ...policy, ...constraints], children)
  }

  if (kind === 'UnionSchema' && Array.isArray(unwrapped.schemas)) {
    const children = unwrapped.schemas.map((child: any, index: number) =>
      inspectSchemaNode(child, `variant[${index}]`, seen),
    )
    return buildNode(label, 'union', [...wrappers, ...constraints], children)
  }

  if (kind === 'DiscriminatedUnionSchema' && Array.isArray(unwrapped.schemas)) {
    const children = unwrapped.schemas.map((child: any, index: number) => inspectSchemaNode(child, `variant[${index}]`, seen))
    return buildNode(label, 'discriminatedUnion', [...wrappers, `discriminator:${String(unwrapped.discriminatorKey)}`], children)
  }

  if ((kind === 'MetadataSchema' || kind === 'MetadataObjectSchema') && unwrapped.schema) {
    const child = inspectSchemaNode(unwrapped.schema, 'metadata', seen)
    return buildNode(label, kind === 'MetadataObjectSchema' ? 'metadataObject' : 'metadata', wrappers, [child])
  }

  if (kind === 'MatchLabelValueSchema') {
    const child = inspectSchemaNode(unwrapped.valueSchema, 'value', seen)
    return buildNode(label, `match.label(${String(unwrapped.labelName)})`, wrappers, [child])
  }

  if (kind === 'MatchLabelsValuesSchema' || kind === 'MatchLabelsEntriesSchema' || kind === 'MatchLabelsEntriesEachSchema') {
    const list = Array.isArray(unwrapped.labels) ? unwrapped.labels : []
    const child = unwrapped.valueSchema
      ? inspectSchemaNode(unwrapped.valueSchema, 'value', seen)
      : unwrapped.itemSchema
        ? inspectSchemaNode(unwrapped.itemSchema, 'item', seen)
        : undefined
    return buildNode(label, `${kind}(${list.join(', ')})`, wrappers, child ? [child] : [])
  }

  if (kind === 'BlockListSchema') {
    const child = inspectSchemaNode(unwrapped.itemSchema, 'item', seen)
    return buildNode(label, 'block.list', wrappers, [child])
  }

  return buildNode(label, kind, [...wrappers, ...constraints], [])
}

const buildSchemaSections = (schema: any): SchemaSectionMeta[] => {
  const sections: SchemaSectionMeta[] = []
  const docShape = isObject(schema?.shape) ? schema.shape : undefined
  if (!docShape) return sections

  for (const [key, value] of Object.entries(docShape)) {
    const base = unwrapSchema(value).schema
    const kind = classNameOf(base)

    if (kind !== 'SectionFieldsSchema') {
      continue
    }

    const fieldShape = isObject(base.shape) ? base.shape : {}

    const fields = Object.entries(fieldShape).map(([fieldName, fieldSchema]) => {
      const unwrapped = unwrapSchema(fieldSchema)
      return {
        name: fieldName,
        type: classNameOf(unwrapped.schema),
        constraints: unwrapped.constraints,
        wrappers: unwrapped.wrappers,
      }
    })

    sections.push({
      id: `${key}:${String(base.sectionName ?? key)}`,
      key,
      name: String(base.sectionName ?? key),
      fields,
    })
  }

  return sections
}

export const introspectSchema = (schema: unknown): SchemaIntrospection => {
  if (!isObject(schema)) {
    return {
      tree: [],
      sections: [],
    }
  }

  const root = inspectSchemaNode(schema, 'schema', new WeakSet<object>())
  const sections = buildSchemaSections(schema)

  return {
    tree: [root],
    sections,
  }
}
