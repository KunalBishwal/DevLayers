import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import {
  ImageIcon,
  LinkIcon,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react"

type LinkItem = {
  label: string
  url: string
}

type EditFormType = {
  title: string
  body: string
  tags: string
  img_url: string
  links?: LinkItem[]
}

interface EditPostDialogProps {
  isEditOpen: boolean
  setIsEditOpen: (open: boolean) => void
  editForm: EditFormType
  setEditForm: (form: EditFormType) => void
  isSaving: boolean
  handleSavePost: () => void
  addLinkRow: () => void
  updateLinkRow: (index: number, field: "label" | "url", value: string) => void
  removeLinkRow: (index: number) => void
}

export function EditPostDialog({
  isEditOpen,
  setIsEditOpen,
  editForm,
  setEditForm,
  isSaving,
  handleSavePost,
  addLinkRow,
  updateLinkRow,
  removeLinkRow,
}: EditPostDialogProps) {
  return (
    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>Update your log details.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
            />
          </div>

          {/* Content */}
          <div className="grid gap-2">
            <Label htmlFor="body">Content</Label>
            <Textarea
              id="body"
              className="min-h-[150px]"
              value={editForm.body}
              onChange={(e) =>
                setEditForm({ ...editForm, body: e.target.value })
              }
            />
          </div>

          {/* Tags */}
          <div className="grid gap-2">
            <Label htmlFor="tags">
              Tags{" "}
              <span className="text-xs text-muted-foreground">
                (comma separated)
              </span>
            </Label>
            <Input
              id="tags"
              value={editForm.tags}
              onChange={(e) =>
                setEditForm({ ...editForm, tags: e.target.value })
              }
            />
          </div>

          {/* Image URL */}
          <div className="grid gap-2">
            <Label htmlFor="img_url" className="flex items-center gap-2">
              <ImageIcon className="w-3 h-3" /> Image URL
            </Label>
            <Input
              id="img_url"
              value={editForm.img_url}
              onChange={(e) =>
                setEditForm({ ...editForm, img_url: e.target.value })
              }
            />
          </div>

          {/* Links */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <LinkIcon className="w-3 h-3" /> Links & Resources
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLinkRow}
                className="h-7 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" /> Add Link
              </Button>
            </div>

            <div className="space-y-2">
              {editForm.links?.map((link, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Input
                    placeholder="Label"
                    value={link.label}
                    onChange={(e) =>
                      updateLinkRow(index, "label", e.target.value)
                    }
                  />
                  <Input
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) =>
                      updateLinkRow(index, "url", e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLinkRow(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {(!editForm.links || editForm.links.length === 0) && (
                <p className="text-xs text-muted-foreground italic">
                  No links added.
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsEditOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSavePost} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
