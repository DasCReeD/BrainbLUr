/**
 * build-skin-manifest.js — Skin Ingestion Pipeline
 *
 * Scans the winamp skins archive, generates a manifest.json,
 * and copies a curated starter set of skins to public/skins/
 * for deployment.
 *
 * Usage: node scripts/build-skin-manifest.js
 */

import { readdir, copyFile, mkdir, writeFile } from 'node:fs/promises'
import { join, basename, extname } from 'node:path'
import { existsSync } from 'node:fs'

const SKINS_ARCHIVE = 'winamp skins/Winamp-Skins-2026'
const OUTPUT_DIR = 'public/skins'
const MAX_STARTER_SKINS = 50  // curated set for deploy

// Hand-picked starter skins (by index prefix) — iconic, diverse, visually interesting
const STARTER_PICKS = [
  '2_Winamp5_Classified_v5.5',     // Default — clean modern look
  '1_Winamp3_Classified_v5.5',     // Classic Classified
  '3_Bento_Classified',            // Bento style
  '0_base-2.91',                   // Original base skin
  '22_DOOM_II_AMP_update',         // DOOM II
  '55_diablo_ii',                  // Diablo II
  '13_Fallout - Pip Boy 2000 1.2', // Fallout Pip-Boy
  '170_Fallout_Pip-Boy_3000_Green_v4', // Fallout Pip-Boy 3000
  '345_Vaporwave',                 // Vaporwave aesthetic
  '167_undertale-by-luigihann',    // Undertale
  '20_ascii',                      // ASCII art
  '162_dosamp',                    // DOS aesthetic
  '163_Windows 98',                // Win98
  '85_Windows_XP',                 // WinXP
  '46_internet-archive-winamp-skin-by-luigihann', // Internet Archive
  '86_Aphex_Twin_Grin',            // Aphex Twin
  '83_SegaDreamcast',              // Dreamcast
  '43_Impostor Among Us',          // Among Us
  '56_kirby_by_ningyotsukai-d60kue9', // Kirby
  '49_Sonic',                      // Sonic
  '63_Mario-Anniversary',          // Mario
  '5_Zelda_Amp_3',                 // Zelda
  '58_DJ_LAIN_Serial_ExP_2',       // Serial Experiments Lain
  '87_Neon Genesis Evangelion - Luce', // Evangelion
  '72_STARTREK',                   // Star Trek
  '33_Necromech',                   // Necromech (dark/industrial)
  '32_Blue_Jeans_v13',             // Blue Jeans
  '50_Commander_Keen_4',           // Commander Keen
  '48_AMPBOY',                     // Game Boy style
  '54_tricorder',                  // Trek Tricorder
  '752_Tron-Vaporwave-by-LuigiHann', // Tron Vaporwave
  '636_solarized_by_kzu-d9quazq',  // Solarized
  '515_poolside-by-luigihann',     // Poolside
  '345_Vaporwave',                 // Vaporwave
  '78_DumAmp',                     // Minimal
  '88_Mine_Amp',                   // Minimal craft
  '900_lofi_coffee',               // Lo-fi
  '935_WACUP-NewConcept',          // Modern WACUP
  '655_Windows_Winamp_Win10',      // Win10 style
  '268_DOS-Amp',                   // DOS
]

async function main() {
  console.log('╔══════════════════════════════════════════════╗')
  console.log('║  BrainBlur Skin Manifest Builder             ║')
  console.log('║  .wsz → manifest.json + starter set          ║')
  console.log('╚══════════════════════════════════════════════╝')
  console.log()

  await mkdir(OUTPUT_DIR, { recursive: true })

  if (!existsSync(SKINS_ARCHIVE)) {
    console.log(`⚠ Skin archive not found at: ${SKINS_ARCHIVE}`)
    console.log('  Generating empty manifest.')
    await writeFile(join(OUTPUT_DIR, 'manifest.json'), JSON.stringify({ version: 1, skins: [] }, null, 2))
    return
  }

  // Scan all subdirectories for .wsz files
  const folders = await readdir(SKINS_ARCHIVE, { withFileTypes: true })
  const skinDirs = folders.filter(f => f.isDirectory()).map(f => f.name).sort((a, b) => parseInt(a) - parseInt(b))

  const allSkins = []
  const starterSet = new Set(STARTER_PICKS.map(s => s.toLowerCase()))
  const starterSkins = []

  for (const dir of skinDirs) {
    const dirPath = join(SKINS_ARCHIVE, dir)
    const files = await readdir(dirPath)
    const wszFiles = files.filter(f => extname(f).toLowerCase() === '.wsz')

    for (const wsz of wszFiles) {
      const nameWithoutExt = basename(wsz, '.wsz')
      const png = files.find(f => f.startsWith(nameWithoutExt) && extname(f).toLowerCase() === '.png')

      const skin = {
        name: nameWithoutExt.replace(/^\d+_/, '').replace(/_/g, ' '),
        file: wsz,
        folder: dir,
        preview: png || null
      }
      allSkins.push(skin)

      // Check if this is a starter pick
      if (starterSet.has(nameWithoutExt.toLowerCase()) && starterSkins.length < MAX_STARTER_SKINS) {
        starterSkins.push({ ...skin, sourcePath: join(dirPath, wsz), previewPath: png ? join(dirPath, png) : null })
      }
    }
  }

  console.log(`📁 Scanned ${skinDirs.length} folders → ${allSkins.length} skins found`)

  // Copy starter skins to public/skins/
  console.log(`\n📦 Copying ${starterSkins.length} starter skins...`)
  for (const skin of starterSkins) {
    const destWsz = join(OUTPUT_DIR, skin.file)
    await copyFile(skin.sourcePath, destWsz)
    console.log(`   → ${skin.file}`)

    if (skin.previewPath && existsSync(skin.previewPath)) {
      const destPng = join(OUTPUT_DIR, skin.preview)
      await copyFile(skin.previewPath, destPng)
    }
  }

  // Build manifest
  const manifest = {
    version: 1,
    generated: new Date().toISOString(),
    defaultSkin: '2_Winamp5_Classified_v5.5.wsz',
    totalAvailable: allSkins.length,
    // Starter skins (deployed) — full skin objects
    starter: starterSkins.map(s => ({
      name: s.name,
      file: s.file,
      preview: s.preview
    })),
    // Full catalog index (name + folder only — for future lazy loading from local server)
    catalog: allSkins.map(s => ({
      name: s.name,
      file: s.file,
      folder: s.folder,
      preview: s.preview
    }))
  }

  const manifestPath = join(OUTPUT_DIR, 'manifest.json')
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2))

  console.log()
  console.log('✅ Skin manifest built!')
  console.log(`   Total skins indexed: ${allSkins.length}`)
  console.log(`   Starter skins copied: ${starterSkins.length}`)
  console.log(`   Manifest: ${manifestPath}`)
}

main().catch(err => {
  console.error('❌ Build failed:', err)
  process.exit(1)
})
