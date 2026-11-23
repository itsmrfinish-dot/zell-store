'use client'

import { useState } from 'react'
import { cleanupImagesAction } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

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
        <p className="text-muted-foreground mt-2">Manage orphaned image files in storage</p>
      </div>

      <div className="flex gap-4">
        <Button onClick={handleDryRun} disabled={isLoading} variant="outline">
          {isLoading ? 'Running...' : 'Dry Run (Preview)'}
        </Button>
        <Button onClick={handleExecute} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
          {isLoading ? 'Running...' : 'Execute Cleanup'}
        </Button>
      </div>

      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive/30">
          <p className="text-destructive font-medium">Error: {error}</p>
        </Card>
      )}

      {results && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Results</h2>
          <div className="grid grid-cols-5 gap-4">
            <div className="p-3 bg-muted rounded">
              <p className="text-sm text-muted-foreground">Eligible</p>
              <p className="text-2xl font-bold">{results.stats.total_eligible}</p>
            </div>
            <div className="p-3 bg-muted rounded">
              <p className="text-sm text-muted-foreground">Claimed</p>
              <p className="text-2xl font-bold">{results.stats.claimed}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded">
              <p className="text-sm text-green-700">Cleaned</p>
              <p className="text-2xl font-bold text-green-700">{results.stats.cleaned}</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded">
              <p className="text-sm text-yellow-700">Missing</p>
              <p className="text-2xl font-bold text-yellow-700">{results.stats.missing}</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded">
              <p className="text-sm text-red-700">Failed</p>
              <p className="text-2xl font-bold text-red-700">{results.stats.failed}</p>
            </div>
          </div>

          {results.results.length > 0 && (
            <div className="space-y-2 mt-6">
              <h3 className="font-semibold">File Details</h3>
              <div className="max-h-96 overflow-y-auto space-y-1">
                {results.results.map((r: any, i: number) => (
                  <div key={i} className="text-sm p-2 bg-muted rounded flex justify-between items-start">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">{r.bucket}/{r.object_path}</p>
                      <p className={`text-xs font-semibold ${
                        r.status === 'success' ? 'text-green-700' :
                        r.status === 'missing' ? 'text-yellow-700' :
                        'text-red-700'
                      }`}>
                        {r.status.toUpperCase()}
                      </p>
                      {r.error && <p className="text-xs text-red-600">{r.error}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
