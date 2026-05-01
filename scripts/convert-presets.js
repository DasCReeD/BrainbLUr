/**
 * convert-presets.js — Preset Ingestion Pipeline
 *
 * Converts raw .milk files from the Cream of the Crop archive into
 * chunked JSON files organized by the archive's visual theme categories:
 *
 *   ! Transition, Dancer, Drawing, Fractal, Geometric,
 *   Hypnotic, Particles, Reaction, Sparkle, Supernova, Waveform
 *
 * Usage:
 *   1. Clone the Cream of the Crop repo into raw-presets/:
 *      git clone https://github.com/projectM-visualizer/presets-cream-of-the-crop raw-presets/cream-of-the-crop
 *
 *   2. Run this script:
 *      npm run convert-presets
 *
 * Output:
 *   public/presets/manifest.json          — Index of all categories and presets
 *   public/presets/<category>.json        — One file per category
 *   public/presets/butterchurn-base.json  — Built-in butterchurn-presets (already JSON)
 */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, basename, extname } from 'node:path'
import { existsSync } from 'node:fs'

// Cream of the Crop category directories
const CATEGORIES = [
  '! Transition',
  'Dancer',
  'Drawing',
  'Fractal',
  'Geometric',
  'Hypnotic',
  'Particles',
  'Reaction',
  'Sparkle',
  'Supernova',
  'Waveform'
]

const RAW_PRESETS_DIR = 'raw-presets/cream-of-the-crop'
const OUTPUT_DIR = 'public/presets'

/**
 * Sanitize a category name for use as a filename.
 */
function sanitizeCategory(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '-').replace(/^-+/, '').toLowerCase()
}

/**
 * Read all .milk files from a category directory.
 * Returns an array of { name, content } objects.
 */
async function readCategoryPresets(categoryPath) {
  if (!existsSync(categoryPath)) {
    console.warn(`  ⚠ Category directory not found: ${categoryPath}`)
    return []
  }

  const files = await readdir(categoryPath)
  const milkFiles = files.filter(f => extname(f).toLowerCase() === '.milk')

  const presets = []
  for (const file of milkFiles) {
    try {
      const content = await readFile(join(categoryPath, file), 'utf-8')
      presets.push({
        name: basename(file, '.milk'),
        filename: file,
        content: content
      })
    } catch (err) {
      console.warn(`  ⚠ Failed to read ${file}: ${err.message}`)
    }
  }

  return presets
}

/**
 * Main conversion pipeline.
 */
async function main() {
  console.log('╔══════════════════════════════════════════════╗')
  console.log('║  BrainBlur Preset Converter                 ║')
  console.log('║  .milk → JSON category chunks               ║')
  console.log('╚══════════════════════════════════════════════╝')
  console.log()

  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true })

  const manifest = {
    version: 1,
    generated: new Date().toISOString(),
    categories: [],
    totalPresets: 0
  }

  // Check if raw presets exist
  if (!existsSync(RAW_PRESETS_DIR)) {
    console.log(`ℹ Raw presets directory not found at: ${RAW_PRESETS_DIR}`)
    console.log('  To add Cream of the Crop presets, run:')
    console.log('  git clone https://github.com/projectM-visualizer/presets-cream-of-the-crop raw-presets/cream-of-the-crop')
    console.log()
    console.log('Generating manifest with butterchurn-presets only...')
    console.log()
  } else {
    // Process each category from the Cream of the Crop archive
    for (const category of CATEGORIES) {
      const categoryPath = join(RAW_PRESETS_DIR, category)
      const slug = sanitizeCategory(category)

      console.log(`📁 Processing category: ${category}`)
      const presets = await readCategoryPresets(categoryPath)

      if (presets.length === 0) {
        console.log(`   → Skipped (no .milk files)`)
        continue
      }

      // Write category chunk (raw .milk content for now)
      // NOTE: Full Butterchurn conversion requires the parser from
      // butterchurn's internal modules. For now, we store the raw
      // content. A future step will add the actual shader compilation.
      const chunkData = {
        category: category,
        slug: slug,
        count: presets.length,
        presets: presets.map(p => ({
          name: p.name,
          filename: p.filename,
          // Raw .milk content stored as string
          raw: p.content
        }))
      }

      const chunkPath = join(OUTPUT_DIR, `${slug}.json`)
      await writeFile(chunkPath, JSON.stringify(chunkData, null, 2))

      manifest.categories.push({
        name: category,
        slug: slug,
        file: `${slug}.json`,
        count: presets.length
      })

      manifest.totalPresets += presets.length
      console.log(`   → ${presets.length} presets → ${slug}.json`)
    }
  }

  // Always include the butterchurn-presets built-in pack in the manifest
  manifest.categories.unshift({
    name: 'Butterchurn Built-in',
    slug: 'butterchurn-base',
    file: null,  // loaded from npm, not a JSON file
    count: null, // determined at runtime
    builtIn: true
  })

  // Write manifest
  const manifestPath = join(OUTPUT_DIR, 'manifest.json')
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2))

  console.log()
  console.log('✅ Conversion complete!')
  console.log(`   Categories: ${manifest.categories.length}`)
  console.log(`   Total raw presets: ${manifest.totalPresets}`)
  console.log(`   Manifest: ${manifestPath}`)
}

main().catch(err => {
  console.error('❌ Conversion failed:', err)
  process.exit(1)
})
