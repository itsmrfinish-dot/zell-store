'use client'

import { useState } from 'react'
import { cleanupImagesAction } from '@/lib/actions'

export default function ImageCleanupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDryRun = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await cleanupImagesAction({ dryRun: true })
      setResults(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExecute = async () => {
    if (!confirm('This will delete orphaned image files. Continue?')) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await cleanupImagesAction({ dryRun: false })
      setResults(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Image Cleanup</h1>
        <p className="text-muted-foreground mt-2">Manage orphaned image files</p>
      </div>

      <div className="flex gap-4">
        <button onClick={handleDryRun} disabled={isLoading} className="px-4 py-2 bg-secondary text-secondary-foreground rounded">
          {isLoading ? 'Running' : 'Dry Run'}
        </button>
        <button onClick={handleExecute} disabled={isLoading} className="px-4 py-2 bg-destructive text-destructive-foreground rounded">
          {isLoading ? 'Running' : 'Execute'}
        </button>
      </div>

      {error && <div className="p-4 bg-destructive/10 border border-destructive/30 rounded"><p className="text-destructive">{error}</p></div>}

      {results && (
        <div className="p-6 bg-card border border-border rounded">
          <h2 className="text-xl font-semibold">Results</h2>
          <div className="grid grid-cols-5 gap-4 mt-4">
            <div className="p-3 bg-muted rounded">
              <p className="text-sm text-muted-foreground">Eligible</p>
              <p className="text-2xl font-bold">{results.stats.total_eligible}</p>
            </div>
            <div className="p-3 bg-muted rounded">
              <p className="text-sm text-muted-foreground">Cleaned</p>
              <p className="text-2xl font-bold text-green-700">{results.stats.cleaned}</p>
            </div>
            <div className="p-3 bg-muted rounded">
              <p className="text-sm text-muted-foreground">Missing</p>
              <p className="text-2xl font-bold text-yellow-700">{results.stats.missing}</p>
            </div>
            <div className="p-3 bg-muted rounded">
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-red-700">{results.stats.failed}</p>
            </div>
            <div className="p-3 bg-muted rounded">
              <p className="text-sm text-muted-foreground">Claimed</p>
              <p className="text-2xl font-bold">{results.stats.claimed}</p>
            </div>

        {results.results && results.results.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Candidates for Cleanup</h3>
            <div className="space-y-3">
              {results.results.map((item: any) => (
                <div key={item.orphan_id} className="flex gap-4 p-3 border border-border rounded hover:bg-muted/50 transition">
                  <div className="flex-shrink-0 w-20 h-20 bg-muted rounded overflow-hidden flex items-center justify-center">
                    <img
                      src={"https://" + item.bucket + ".supabase.co/storage/v1/object/public/" + item.bucket + "/" + item.object_path}
                      alt={item.object_path}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-muted-foreground break-all">{item.object_path}</p>
                    <p className="text-xs text-muted-foreground mt-1">Bucket: {item.bucket}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
          </div>
        </div>
      )}
    </div>
  )
}
