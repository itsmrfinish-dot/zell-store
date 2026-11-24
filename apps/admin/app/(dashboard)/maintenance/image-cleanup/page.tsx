import { pageWithAccess } from '../../../../lib/access/instance'
import { ImageCleanupClient } from './ImageCleanupClient'

export default pageWithAccess('zell.images.cleanup', async function ImageCleanupPage() {
  return <ImageCleanupClient />
})
