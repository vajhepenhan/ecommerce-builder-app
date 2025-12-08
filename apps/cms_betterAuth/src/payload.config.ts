// storage-adapter-import-placeholder
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/pages'
import { Tenants } from './collections/tenants'
import { Products } from './collections/prducts'
import { Templates } from './collections/templates'
import { TemplateComponents } from './collections/TemplateComponents'


const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Pages, Tenants, Products, Templates, TemplateComponents],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [
     multiTenantPlugin({
      collections: {
        pages: {},              // tenant-aware
        templates: {},          // tenant-aware
        templateComponents: {}, // tenant-aware
        media: {},              // tenant-aware
        users: {},              // tenant-aware
      },
    }),
  ],
})
