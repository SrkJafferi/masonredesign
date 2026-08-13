"use client";

import { PencilIcon, PlusIcon } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { AdminThumb } from "@/components/admin/admin-thumb";
import { DeleteConfirm } from "@/components/admin/delete-confirm";
import { StatusBadge } from "@/components/admin/status-badge";
import { SubmitButton } from "@/components/admin/submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createBanner, deleteBanner, updateBanner } from "@/features/banners/actions";
import type { BannerAdminItem } from "@/features/banners/types";
import { idleResult } from "@/lib/cms/validation";

type DialogState = { mode: "create" } | { mode: "edit"; banner: BannerAdminItem } | null;

function BannerDialog({ state, onClose }: { state: DialogState; onClose: () => void }) {
  const isEdit = state?.mode === "edit";
  const banner = isEdit ? state.banner : null;
  const action = isEdit ? updateBanner : createBanner;
  const [result, formAction] = useActionState(action, idleResult);

  useEffect(() => {
    if (result.status === "success") onClose();
  }, [result, onClose]);

  return (
    <Dialog open={state !== null} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit banner" : "Add banner"}</DialogTitle>
          <DialogDescription>
            Banners appear in the homepage hero slider, ordered by sort order.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4" key={banner?.id ?? "create"}>
          {isEdit ? <input type="hidden" name="id" value={banner!.id} /> : null}

          <div className="space-y-2">
            <Label htmlFor="image">
              Banner image {isEdit ? "(leave empty to keep current)" : "(required)"}
            </Label>
            {isEdit && banner?.previewUrl ? (
              <AdminThumb
                src={banner.previewUrl}
                alt={banner.image_alt}
                className="h-20 w-32"
              />
            ) : null}
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              required={!isEdit}
            />
            <p className="text-xs text-muted-foreground">
              JPEG, PNG or WebP · up to 5 MB.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_alt">Image description (for accessibility)</Label>
            <Input
              id="image_alt"
              name="image_alt"
              defaultValue={banner?.image_alt ?? ""}
              placeholder="e.g. MASOM community gathering"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input id="title" name="title" defaultValue={banner?.title ?? ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link_url">Link URL (optional)</Label>
            <Input
              id="link_url"
              name="link_url"
              type="url"
              inputMode="url"
              placeholder="https://…"
              defaultValue={banner?.link_url ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">Sort order</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              min={0}
              defaultValue={banner?.sort_order ?? 0}
              className="w-28"
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="is_active"
              name="is_active"
              defaultChecked={banner ? banner.is_active : true}
            />
            <Label htmlFor="is_active">Active (show on the website)</Label>
          </div>

          {result.status === "error" ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {result.message}
            </p>
          ) : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <SubmitButton pendingLabel="Saving…">
              {isEdit ? "Save changes" : "Add banner"}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function BannerManager({ banners }: { banners: BannerAdminItem[] }) {
  const [dialog, setDialog] = useState<DialogState>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Banners</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hero slider images for the homepage.
          </p>
        </div>
        <Button variant="cta" onClick={() => setDialog({ mode: "create" })}>
          <PlusIcon className="size-4" />
          Add banner
        </Button>
      </div>

      {banners.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No banners yet. The homepage is showing the built-in default banners. Add one
            to take over the hero slider.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Preview</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-20">Order</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <AdminThumb src={banner.previewUrl} alt={banner.image_alt} />
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-foreground">
                      {banner.title || banner.image_alt || "Untitled banner"}
                    </p>
                    {banner.link_url ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {banner.link_url}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {banner.sort_order}
                  </TableCell>
                  <TableCell>
                    <StatusBadge active={banner.is_active} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Edit banner"
                        onClick={() => setDialog({ mode: "edit", banner })}
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <DeleteConfirm
                        action={deleteBanner}
                        id={banner.id}
                        entityLabel="banner"
                        name={banner.title || banner.image_alt}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <BannerDialog state={dialog} onClose={() => setDialog(null)} />
    </div>
  );
}
