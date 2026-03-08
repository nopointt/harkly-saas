"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { copyToClipboard } from "@/utils/clipboard"

interface ShareLinkDialogProps {
  artifactId: string
  projectId: string
}

interface ShareLinkState {
  token: string
  url: string
}

export function ShareLinkDialog({ artifactId, projectId }: ShareLinkDialogProps) {
  const [open, setOpen] = useState(false)
  const [shareLink, setShareLink] = useState<ShareLinkState | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/projects/${projectId}/artifacts/${artifactId}/share-link`,
        { method: "POST" }
      )
      if (!res.ok) {
        toast.error("Failed to create share link")
        return
      }
      const data = (await res.json()) as { share_link: { token: string }; url: string }
      setShareLink({ token: data.share_link.token, url: data.url })
    } catch {
      toast.error("Failed to create share link")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyUrl = async () => {
    if (!shareLink) return
    const success = await copyToClipboard(shareLink.url)
    if (success) {
      toast.success("Link copied to clipboard!")
    } else {
      toast.error("Failed to copy link")
    }
  }

  const handleRevoke = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/projects/${projectId}/artifacts/${artifactId}/share-link`,
        { method: "DELETE" }
      )
      if (!res.ok) {
        toast.error("Failed to revoke link")
        return
      }
      setShareLink(null)
      toast.success("Share link revoked")
    } catch {
      toast.error("Failed to revoke link")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setShareLink(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          Share link
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share artifact</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Anyone with this link can view this artifact (read-only).
        </p>

        {!shareLink ? (
          <Button onClick={handleCreate} disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create shareable link"}
          </Button>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={shareLink.url}
                className="text-xs font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="shrink-0"
              >
                Copy
              </Button>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRevoke}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Revoking..." : "Revoke link"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
