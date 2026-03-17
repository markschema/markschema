import fs from 'node:fs'
import path from 'node:path'

const docsRoot = path.resolve('docs')
const markdownFiles = []
const manifestPath = path.join(docsRoot, 'api', 'types', 'type-methods.json')
const configPath = path.join(docsRoot, '.vitepress', 'config.ts')

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath)
      continue
    }
    if (entry.isFile() && fullPath.endsWith('.md')) {
      markdownFiles.push(fullPath)
    }
  }
}

walk(docsRoot)

const broken = []
const legacy = []
const manifestBroken = []
const configBroken = []
const legacyFiles = []

function routeExists(href) {
  const normalized = href.replace(/\/$/, '')
  const relative = normalized.startsWith('/') ? normalized.slice(1) : normalized
  const asFile = path.join(docsRoot, `${relative}.md`)
  const asIndex = path.join(docsRoot, relative, 'index.md')
  return fs.existsSync(asFile) || fs.existsSync(asIndex)
}

for (const file of markdownFiles) {
  const content = fs.readFileSync(file, 'utf8')
  const regex = /\[[^\]]*]\((\/[^)#?\s]+)\)/g
  let match

  while ((match = regex.exec(content)) !== null) {
    const href = match[1]
    if (!href.startsWith('/api/')) continue

    if (/-2(\/?$)/.test(href) || /-min(\/?$)/.test(href)) {
      legacy.push({ href, file })
    }

    if (!routeExists(href)) {
      broken.push({ href, file })
    }
  }
}

if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  for (const [typeSlug, entry] of Object.entries(manifest)) {
    const typeIndex = path.join(docsRoot, 'api', 'types', typeSlug, 'index.md')
    if (!fs.existsSync(typeIndex)) {
      manifestBroken.push({
        kind: 'missing type index',
        href: `/api/types/${typeSlug}/`,
      })
    }

    for (const method of entry.methods ?? []) {
      const href = `/api/types/${typeSlug}/${method.slug}`
      if (!routeExists(href)) {
        manifestBroken.push({
          kind: 'missing method page',
          href,
        })
      }
      if (/-2$/.test(method.slug) || /-min$/.test(method.slug)) {
        legacy.push({
          href,
          file: manifestPath,
        })
      }
    }

    for (const aux of entry.sharedAux ?? []) {
      const href = `/api/aux/${aux}`
      if (!routeExists(href)) {
        manifestBroken.push({
          kind: 'missing shared auxiliary page',
          href,
        })
      }
      if (/-2$/.test(aux) || /-min$/.test(aux)) {
        legacy.push({
          href,
          file: manifestPath,
        })
      }
    }
  }
}

if (fs.existsSync(configPath)) {
  const config = fs.readFileSync(configPath, 'utf8')
  const typeSlugs = [...config.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1])
  for (const typeSlug of typeSlugs) {
    const href = `/api/types/${typeSlug}/`
    if (!routeExists(href)) {
      configBroken.push({ kind: 'missing type route from config', href })
    }
  }
}

for (const file of markdownFiles) {
  const basename = path.basename(file)
  if (/.*-(2|min)\.md$/.test(basename)) {
    legacyFiles.push(file)
  }
}

if (legacy.length > 0) {
  console.error('Legacy API links found:')
  for (const item of legacy) {
    console.error(`- ${item.href} <- ${item.file}`)
  }
}

if (broken.length > 0) {
  console.error('Broken API links found:')
  for (const item of broken) {
    console.error(`- ${item.href} <- ${item.file}`)
  }
}

if (manifestBroken.length > 0) {
  console.error('Broken links from type-methods manifest found:')
  for (const item of manifestBroken) {
    console.error(`- ${item.kind}: ${item.href}`)
  }
}

if (configBroken.length > 0) {
  console.error('Broken links inferred from VitePress config found:')
  for (const item of configBroken) {
    console.error(`- ${item.kind}: ${item.href}`)
  }
}

if (legacyFiles.length > 0) {
  console.error('Legacy doc files found (should be removed):')
  for (const file of legacyFiles) {
    console.error(`- ${file}`)
  }
}

if (
  legacy.length > 0 ||
  broken.length > 0 ||
  manifestBroken.length > 0 ||
  configBroken.length > 0 ||
  legacyFiles.length > 0
) {
  process.exit(1)
}

console.log('docs api links ok')
