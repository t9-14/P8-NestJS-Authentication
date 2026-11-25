"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Building2, Eye, Pencil, Plus, RefreshCw, Trash2, UserRound, X } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getUser, logout } from "@/lib/auth";
import { apiClient } from "@/lib/api";
import { CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Position = { id: number; position_code: string; position_name: string; created_at: string; updated_at: string };
const endpoint = CONFIG.ENDPOINTS.POSITIONS;

export default function DashboardPage() {
  const router = useRouter();
  const { isChecking } = useAuthGuard({ requireAuth: true });
  const [user, setUser] = useState<User | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selected, setSelected] = useState<Position | null>(null);
  const [editing, setEditing] = useState<Position | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Position | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadPositions = async () => {
    setLoading(true);
    setError("");
    try {
      setPositions(await apiClient<Position[]>(endpoint));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load positions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isChecking) return;
    let active = true;
    void getUser().then((currentUser) => {
      if (!active) return;
      if (!currentUser) router.replace(CONFIG.ROUTES.LOGIN);
      else {
        setUser(currentUser);
        void loadPositions();
      }
    });
    return () => { active = false; };
  }, [isChecking, router]);

  const openForm = (position?: Position) => {
    setSelected(null);
    setError("");
    setNotice("");
    setEditing(position ?? null);
    setCode(position?.position_code ?? "");
    setName(position?.position_name ?? "");
    setFormOpen(true);
  };

  const submitPosition = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const position_code = code.trim();
    const position_name = name.trim();
    if (!position_code || !position_name) {
      setError("Enter both a position code and name.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await apiClient<Position>(editing ? `${endpoint}/${editing.id}` : endpoint, {
        method: editing ? "PUT" : "POST",
        body: { position_code, position_name },
      });
      setFormOpen(false);
      setNotice(editing ? "Position updated." : "Position created.");
      await loadPositions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save position.");
    } finally {
      setSaving(false);
    }
  };

  const readPosition = async (id: number) => {
    setLoading(true);
    setError("");
    setSelected(null);
    try {
      setSelected(await apiClient<Position>(`${endpoint}/${id}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read position.");
    } finally {
      setLoading(false);
    }
  };

  const removePosition = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    setError("");
    try {
      await apiClient<void>(`${endpoint}/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      setNotice("Position deleted.");
      await loadPositions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete position.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setError("");
    setLoggingOut(true);
    try {
      await logout();
      router.replace(CONFIG.ROUTES.LOGIN);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed.");
    } finally {
      setLoggingOut(false);
    }
  };

  if (isChecking || !user) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Verifying session...</div>;
  }

  return (
    <main className="min-h-screen bg-[#eaf7ed] px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-7">
        <header className="flex flex-col gap-4 rounded-lg border border-[#d4e4d8] bg-[#f9f9f9] px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-md bg-[#daf7e2] text-[#128d35]"><Building2 className="size-5" /></div><div><p className="text-sm font-semibold">Org<span className="text-[#16b843]">Manage</span></p><p className="text-xs text-muted-foreground">Position administration</p></div></div>
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end"><div className="flex items-center gap-2.5"><div className="flex size-9 items-center justify-center rounded-full bg-[#daf7e2] text-[#128d35]"><UserRound className="size-4" /></div><div className="max-w-40"><p className="truncate text-sm font-medium">{user.user_metadata?.username || user.email || "User"}</p><p className="text-xs text-muted-foreground">Signed in</p></div></div><span className="hidden h-8 w-px bg-border sm:block" /><Button variant="outline" onClick={handleLogout} disabled={loggingOut}>{loggingOut ? "Signing out..." : "Logout"}</Button></div>
        </header>

        <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#128d35]">Organization management</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1e1e1e]">Organization Positions</h1><p className="mt-1 text-sm text-[#666666]">Manage the roles and responsibilities in your organization.</p></div>

        {(error || notice) && (
          <div role="status" className={`rounded-md border px-4 py-3 text-sm ${error ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-green-300 bg-green-50 text-green-800"}`}>
            {error || notice}
          </div>
        )}

        {selected && (
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div><CardTitle>Position Details</CardTitle><CardDescription>Position record from the database</CardDescription></div>
              <Button variant="ghost" size="icon" aria-label="Close details" onClick={() => setSelected(null)}><X /></Button>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div><Label>Position ID</Label><p className="mt-1 text-sm">{selected.id}</p></div>
              <div><Label>Position Code</Label><p className="mt-1 text-sm">{selected.position_code}</p></div>
              <div><Label>Position Name</Label><p className="mt-1 text-sm">{selected.position_name}</p></div>
              <div><Label>Created At</Label><p className="mt-1 text-sm">{new Date(selected.created_at).toLocaleString()}</p></div>
            </CardContent>
          </Card>
        )}

        {formOpen && (
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div><CardTitle>{editing ? "Update Position" : "Create New Position"}</CardTitle><CardDescription>{editing ? "Edit the selected position." : "Add a position to your organization."}</CardDescription></div>
              <Button variant="ghost" size="icon" aria-label="Close form" onClick={() => setFormOpen(false)}><X /></Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitPosition} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="position-code">Position Code</Label><Input id="position-code" value={code} onChange={(event) => setCode(event.target.value)} maxLength={80} required /></div>
                  <div className="space-y-2"><Label htmlFor="position-name">Position Name</Label><Input id="position-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={160} required /></div>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>Cancel</Button>
                  <Button type="submit" disabled={saving}>{saving ? "Saving..." : editing ? "Save Changes" : "Create Position"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="gap-4 border-b border-[#e5e5e5] bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div><CardTitle className="text-lg text-[#1e1e1e]">Position directory</CardTitle><CardDescription className="mt-1">View and manage positions in your organization.</CardDescription></div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => void loadPositions()} disabled={loading}><RefreshCw className={loading ? "animate-spin" : ""} />Refresh</Button>
              <Button className="bg-[#16b843] text-white hover:bg-[#119b37]" onClick={() => openForm()}><Plus />New position</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow className="bg-[#f3f4f3] hover:bg-[#f3f4f3]"><TableHead className="h-12 pl-5 text-[11px] uppercase tracking-wider text-[#777777]">ID</TableHead><TableHead className="text-[11px] uppercase tracking-wider text-[#777777]">Position Code</TableHead><TableHead className="text-[11px] uppercase tracking-wider text-[#777777]">Position Name</TableHead><TableHead className="text-[11px] uppercase tracking-wider text-[#777777]">Created At</TableHead><TableHead className="pr-5 text-right text-[11px] uppercase tracking-wider text-[#777777]">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {loading && positions.length === 0 ? <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">Loading positions...</TableCell></TableRow>
                  : positions.length === 0 ? <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No positions yet. Create your first position to get started.</TableCell></TableRow>
                    : positions.map((position) => (
                      <TableRow key={position.id}>
                        <TableCell className="pl-5 font-mono text-xs text-muted-foreground">{position.id}</TableCell><TableCell><span className="inline-flex rounded-sm bg-[#daf7e2] px-2 py-1 text-xs font-semibold text-[#167b32]">{position.position_code}</span></TableCell><TableCell className="font-medium text-[#242424]">{position.position_name}</TableCell><TableCell className="text-sm text-muted-foreground">{new Date(position.created_at).toLocaleDateString()}</TableCell>
                        <TableCell><div className="flex flex-wrap justify-end gap-1 pr-2">
                          <Button variant="ghost" size="sm" className="text-[#666666] hover:bg-[#daf7e2] hover:text-[#128d35]" aria-label={`Read ${position.position_code}`} onClick={() => void readPosition(position.id)}><Eye />Read</Button>
                          <Button variant="ghost" size="sm" className="text-[#666666] hover:bg-[#eeeeee] hover:text-[#1e1e1e]" aria-label={`Update ${position.position_code}`} onClick={() => openForm(position)}><Pencil />Update</Button>
                          <Button variant="ghost" size="sm" className="text-[#777777] hover:bg-[#fff0f0] hover:text-[#d62424]" aria-label={`Delete ${position.position_code}`} onClick={() => setDeleteTarget(position)}><Trash2 />Delete</Button>
                        </div></TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open && !saving) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete position?</AlertDialogTitle><AlertDialogDescription>Delete {deleteTarget?.position_code} — {deleteTarget?.position_name}? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" disabled={saving} onClick={removePosition}>{saving ? "Deleting..." : "Delete Position"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
