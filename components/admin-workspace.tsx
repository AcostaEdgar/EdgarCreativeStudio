"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  X,
  Plus,
  Check,
  Trash2,
} from "lucide-react";
import { upload as blobUpload } from "@vercel/blob/client";
import type { StudioState, Work } from "@/lib/studio-types";
import { workTitle } from "@/lib/work-labels";
import "./admin-editor.css";
type Queued = {
  key: string;
  file: File;
  preview: string;
  title: string;
  alt: string;
  category: string;
  progress: number;
  error: string;
  done: boolean;
  url?: string;
  replaceId?: number;
};
const categories = [
  "Portraits",
  "People & place",
  "Spaces",
  "Nature",
  "Painting",
  "Sculpture",
];
async function json(response: Response) {
  const d = await response.json().catch(() => ({
    error: "The server could not complete this request. Please retry.",
  }));
  if (!response.ok) throw new Error(d.error || "Please retry.");
  return d;
}
export function AdminWorkspace() {
  const [state, setState] = useState<StudioState | null>(null),
    [loading, setLoading] = useState(true),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [queue, setQueue] = useState<Queued[]>([]),
    [edit, setEdit] = useState<Work | null>(null),
    [remove, setRemove] = useState<number | null>(null),
    [tab, setTab] = useState("collection");
  const editor = useRef<HTMLDialogElement>(null);
  const urls = useRef<string[]>([]);
  const lock = useRef(false);
  const replace = useRef<HTMLInputElement>(null);
  const replaceId = useRef<number | undefined>(undefined);
  useEffect(() => {
    const previews = urls.current;
    let cancelled = false;
    fetch("/api/admin/state", { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401) return;
        const d = await json(r);
        if (!cancelled) {
          setState(d);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      previews.forEach(URL.revokeObjectURL);
    };
  }, []);
  useEffect(() => {
    if (edit) editor.current?.showModal();
    else editor.current?.close();
  }, [edit]);
  function adopt(d: StudioState) {
    setState((s) => ({ ...d, storage: s?.storage || d.storage }));
  }
  async function action(fn: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Something went wrong. Please retry.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function save(body: unknown, note: string) {
    await action(async () => {
      const d = await json(
        await fetch("/api/admin/save", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }),
      );
      adopt(d);
      setMessage(note);
    });
  }
  function addFiles(files: FileList | null, id?: number) {
    if (!files) return;
    const items = Array.from(files).map((file) => {
      const preview = URL.createObjectURL(file);
      urls.current.push(preview);
      return {
        key: crypto.randomUUID(),
        file,
        preview,
        title: "",
        alt: "",
        category: "People & place",
        progress: 0,
        error: ![
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/avif",
        ].includes(file.type)
          ? "Use JPEG, PNG, WebP or AVIF."
          : file.size > 25 * 1024 * 1024
            ? "File exceeds 25 MB. Export a high-quality JPEG under 25 MB."
            : "",
        done: false,
        replaceId: id,
      };
    });
    setQueue((q) => [...q, ...items]);
    setTab("upload");
  }
  function patch(key: string, value: Partial<Queued>) {
    setQueue((q) =>
      q.map((item) => (item.key === key ? { ...item, ...value } : item)),
    );
  }
  async function uploadAll() {
    await action(async () => {
      let count = 0;
      let failed = 0;
      for (const item of queue.filter((q) => !q.done)) {
        try {
          if (
            !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
              item.file.type,
            ) ||
            item.file.size > 25 * 1024 * 1024
          )
            throw new Error("Choose a supported image under 25 MB.");
          if (!item.alt.trim())
            throw new Error("Add an image description before uploading.");
          patch(item.key, { error: "", progress: 1 });
          let data;
          if (state?.storage === "blob") {
            const bitmap = await createImageBitmap(item.file);
            const width = bitmap.width,
              height = bitmap.height;
            bitmap.close();
            let url = item.url;
            if (!url) {
              const blob = await blobUpload(
                "studio/uploads/" +
                  crypto.randomUUID() +
                  "." +
                  item.file.name.split(".").pop(),
                item.file,
                {
                  access: "public",
                  handleUploadUrl: "/api/admin/blob-upload",
                  contentType: item.file.type,
                  multipart: item.file.size > 4 * 1024 * 1024,
                  onUploadProgress: (p) =>
                    patch(item.key, {
                      progress: Math.round(p.percentage * 0.9),
                    }),
                },
              );
              url = blob.url;
              patch(item.key, { url });
            }
            data = await json(
              await fetch("/api/admin/register-upload", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  url,
                  width,
                  height,
                  title: item.title,
                  alt: item.alt,
                  category: item.category,
                  replaceId: item.replaceId,
                }),
              }),
            );
          } else {
            const f = new FormData();
            f.set("files", item.file);
            f.set("title", item.title);
            f.set("alt", item.alt);
            f.set("category", item.category);
            if (item.replaceId) f.set("replaceId", String(item.replaceId));
            data = await json(
              await fetch("/api/admin/upload", { method: "POST", body: f }),
            );
          }
          adopt(data);
          patch(item.key, { done: true, progress: 100 });
          count++;
        } catch (e) {
          failed++;
          patch(item.key, {
            error:
              e instanceof Error
                ? e.message
                : "Upload failed. Retry this file.",
            progress: 0,
          });
        }
      }
      setMessage(
        count +
          " image" +
          (count === 1 ? "" : "s") +
          " published." +
          (failed
            ? " " +
              failed +
              " need attention; completed uploads will not be repeated."
            : ""),
      );
    });
  }
  async function move(id: number, position: number) {
    if (!state) return;
    const order = state.portfolio.map((w) => w.id);
    const index = order.indexOf(id);
    order.splice(index, 1);
    order.splice(position, 0, id);
    await save(
      { move: { id, beforeId: order[position + 1] ?? null, position } },
      "Collection order saved.",
    );
  }
  const heroes = state?.home.hero.map((h) => Number(h.id)) || [];
  return (
    <main id="main" className="owner">
      <header className="owner-header">
        <Link href="/">← Back to website</Link>
        <span>EDGAR ACOSTA / PRIVATE STUDIO</span>
        {state && (
          <button
            disabled={busy}
            onClick={() =>
              action(async () => {
                await json(
                  await fetch("/api/admin/logout", { method: "POST" }),
                );
                setState(null);
                setPassword("");
              })
            }
          >
            Sign out
          </button>
        )}
      </header>
      {loading ? (
        <p className="owner-loading">Opening your studio…</p>
      ) : !state ? (
        <section className="owner-login">
          <p className="kicker">OWNER ACCESS</p>
          <h1>Studio access.</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              action(async () => {
                await json(
                  await fetch("/api/admin/login", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ password }),
                  }),
                );
                const d = await json(
                  await fetch("/api/admin/state", { cache: "no-store" }),
                );
                setState(d);
                setPassword("");
              });
            }}
          >
            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button disabled={busy}>
              {busy ? "Signing in…" : "Enter studio"} <ArrowUpRight size={18} />
            </button>
          </form>
          {error && <p role="alert">{error}</p>}
        </section>
      ) : (
        <>
          <div className="owner-title">
            <div>
              <p className="kicker">THE ARTIST’S WORKSPACE</p>
              <h1>The collection.</h1>
            </div>
            <Link href="/gallery" target="_blank">
              View live portfolio <ArrowUpRight size={16} />
            </Link>
          </div>
          <nav className="owner-tabs" aria-label="Admin sections">
            {[
              ["collection", "Collection", state.portfolio.length],
              ["upload", "Upload", queue.filter((q) => !q.done).length],
              ["hero", "Hero image", heroes.length],
            ].map(([key, label, n]) => (
              <button
                key={key}
                disabled={busy}
                aria-pressed={tab === key}
                onClick={() => setTab(String(key))}
              >
                {label}
                <small>{n || ""}</small>
              </button>
            ))}
          </nav>
          <div className="owner-status" aria-live="polite">
            {error && <p role="alert">{error}</p>}
            {message && <p>{message}</p>}
            {busy && <p>Saving your changes…</p>}
          </div>
          <input
            ref={replace}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            hidden
            onChange={(e) => {
              addFiles(e.target.files, replaceId.current);
              e.target.value = "";
            }}
          />
          {tab === "collection" && (
            <>
              <div className="owner-section-intro">
                <p>
                  Arrange the sequence. Edit the details. Every saved change
                  updates the website.
                </p>
                <button onClick={() => setTab("upload")}>
                  <Plus size={16} /> Add photographs
                </button>
              </div>
              <div className="owner-grid">
                {state.portfolio.map((w, i) => (
                  <article className="owner-card" key={w.id}>
                    <button
                      className="owner-card-image"
                      aria-label={"Edit photograph " + (i + 1)}
                      onClick={() => {
                        setEdit({ ...w });
                        setRemove(null);
                      }}
                    >
                      <Image
                        src={w.image}
                        alt={w.alt}
                        width={w.width}
                        height={w.height}
                        sizes="(max-width:700px) 45vw, 25vw"
                      />
                    </button>
                    <div className="owner-card-label">
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <span>
                        {w.title ? workTitle(w) : w.category || "Untitled"}
                      </span>
                      {heroes.includes(w.id) && <small>OPENING</small>}
                    </div>
                    <div className="owner-card-actions">
                      <button
                        disabled={busy || i === 0}
                        aria-label={"Move photograph " + (i + 1) + " earlier"}
                        onClick={() => move(w.id, i - 1)}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        disabled={busy || i === state.portfolio.length - 1}
                        aria-label={"Move photograph " + (i + 1) + " later"}
                        onClick={() => move(w.id, i + 1)}
                      >
                        <ArrowDown size={16} />
                      </button>
                      <label className="owner-position">
                        Position
                        <select
                          aria-label={"Position of photograph " + (i + 1)}
                          value={i}
                          disabled={busy}
                          onChange={(e) => move(w.id, Number(e.target.value))}
                        >
                          {state.portfolio.map((_, j) => (
                            <option key={j} value={j}>
                              {j + 1}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        disabled={busy}
                        onClick={() => {
                          setEdit({ ...w });
                          setRemove(null);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
          {tab === "upload" && (
            <>
              <div
                className="owner-upload-zone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!busy) addFiles(e.dataTransfer.files);
                }}
              >
                <Plus size={26} />
                <h2>Make room for new work.</h2>
                <p>
                  Drop photographs here, or choose multiple files.
                  <br />
                  JPEG, PNG, WebP, AVIF · up to 25 MB each.
                </p>
                <label className="owner-file-button">
                  Choose photographs
                  <input
                    disabled={busy}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={(e) => {
                      addFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <div className="upload-list">
                {queue.map((q) => (
                  <article key={q.key}>
                    <Image
                      src={q.preview}
                      unoptimized
                      alt="Upload preview"
                      width={180}
                      height={160}
                    />
                    <fieldset disabled={busy || q.done}>
                      <label>
                        Title (optional)
                        <input
                          value={q.title}
                          onChange={(e) =>
                            patch(q.key, { title: e.target.value })
                          }
                          placeholder="Leave blank for an untitled work"
                        />
                      </label>
                      <label>
                        Image description (required)
                        <input
                          value={q.alt}
                          onChange={(e) =>
                            patch(q.key, { alt: e.target.value })
                          }
                          placeholder="Describe what appears in the photograph"
                        />
                      </label>
                      <label>
                        Collection
                        <select
                          value={q.category}
                          onChange={(e) =>
                            patch(q.key, { category: e.target.value })
                          }
                        >
                          {categories.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </label>
                    </fieldset>
                    <div className="upload-state">
                      {q.done ? (
                        <span>
                          <Check size={18} /> Published
                        </span>
                      ) : (
                        <button
                          disabled={busy}
                          aria-label="Remove from upload queue"
                          onClick={() =>
                            setQueue((items) =>
                              items.filter((x) => x.key !== q.key),
                            )
                          }
                        >
                          <X size={20} />
                        </button>
                      )}
                      <progress value={q.progress} max={100} />
                      {q.error && <p role="alert">{q.error}</p>}
                      {q.replaceId && <small>Replaces existing image</small>}
                    </div>
                  </article>
                ))}
              </div>
              {queue.some((q) => !q.done) && (
                <button
                  className="owner-primary"
                  disabled={busy}
                  onClick={uploadAll}
                >
                  {busy ? "Uploading…" : "Publish pending photographs"}
                </button>
              )}
            </>
          )}
          {tab === "hero" && (
            <>
              <div className="owner-section-intro">
                <p>
                  Choose the photograph for the full-screen entrance. Selecting
                  a different image replaces the current cover. If none is
                  selected, the first photograph in your collection appears.
                </p>
              </div>
              <div className="owner-hero-choices">
                {state.portfolio.map((w) => (
                  <button
                    key={w.id}
                    disabled={busy}
                    aria-label={"Choose opening image: " + w.alt}
                    aria-pressed={heroes.includes(w.id)}
                    onClick={() =>
                      save(
                        {
                          heroIds: [w.id],
                        },
                        "Hero image published.",
                      )
                    }
                  >
                    <Image
                      src={w.image}
                      alt={w.alt}
                      width={w.width}
                      height={w.height}
                      sizes="(max-width:700px) 40vw, 20vw"
                    />
                    {heroes.includes(w.id) && (
                      <span>
                        <Check size={18} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
          <dialog
            ref={editor}
            className="owner-edit-backdrop"
            aria-label="Edit photograph"
            onCancel={(e) => {
              if (busy) e.preventDefault();
              else setEdit(null);
            }}
            onClose={() => setEdit(null)}
          >
            {edit && (
              <section className="owner-edit">
                <button
                  className="owner-edit-close"
                  disabled={busy}
                  onClick={() => setEdit(null)}
                  aria-label="Close editor"
                >
                  <X />
                </button>
                <Image
                  src={edit.image}
                  alt={edit.alt}
                  width={edit.width}
                  height={edit.height}
                  sizes="(max-width:700px) 80vw, 40vw"
                />
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    save({ work: edit }, "Photograph details saved.");
                  }}
                >
                  <h2>Details of the work.</h2>
                  <fieldset disabled={busy}>
                    <label>
                      Title (optional)
                      <input
                        autoFocus
                        value={edit.title}
                        onChange={(e) =>
                          setEdit({ ...edit, title: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Image description
                      <input
                        required
                        value={edit.alt}
                        onChange={(e) =>
                          setEdit({ ...edit, alt: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Collection
                      <select
                        value={edit.category || "People & place"}
                        onChange={(e) =>
                          setEdit({ ...edit, category: e.target.value })
                        }
                      >
                        {categories.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                    <div className="owner-field-pair">
                      <label>
                        Year
                        <input
                          value={edit.year}
                          onChange={(e) =>
                            setEdit({ ...edit, year: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Medium
                        <input
                          value={edit.medium}
                          onChange={(e) =>
                            setEdit({ ...edit, medium: e.target.value })
                          }
                        />
                      </label>
                    </div>
                    <label>
                      Note (optional)
                      <textarea
                        rows={3}
                        value={edit.description}
                        onChange={(e) =>
                          setEdit({ ...edit, description: e.target.value })
                        }
                      />
                    </label>
                    <div className="owner-field-pair">
                      <label>
                        Width
                        <input
                          type="number"
                          min="0"
                          step=".1"
                          value={edit.physicalWidth || ""}
                          onChange={(e) =>
                            setEdit({
                              ...edit,
                              physicalWidth: Number(e.target.value),
                            })
                          }
                        />
                      </label>
                      <label>
                        Height
                        <input
                          type="number"
                          min="0"
                          step=".1"
                          value={edit.physicalHeight || ""}
                          onChange={(e) =>
                            setEdit({
                              ...edit,
                              physicalHeight: Number(e.target.value),
                            })
                          }
                        />
                      </label>
                      <label>
                        Unit
                        <select
                          value={edit.unit || "cm"}
                          onChange={(e) =>
                            setEdit({ ...edit, unit: e.target.value })
                          }
                        >
                          <option>cm</option>
                          <option>in</option>
                        </select>
                      </label>
                    </div>
                  </fieldset>
                  <button disabled={busy} className="owner-primary">
                    Save details
                  </button>
                  <button
                    disabled={busy}
                    type="button"
                    onClick={() => {
                      replaceId.current = edit.id;
                      replace.current?.click();
                      setEdit(null);
                    }}
                  >
                    Replace image file
                  </button>
                  {message && <p role="status">{message}</p>}
                  {error && <p role="alert">{error}</p>}
                  <div className="owner-remove">
                    {remove === edit.id ? (
                      <>
                        <p>
                          Remove this photograph from the portfolio and opening
                          images?
                        </p>
                        <button
                          disabled={busy}
                          type="button"
                          onClick={() =>
                            action(async () => {
                              const d = await json(
                                await fetch("/api/admin/delete", {
                                  method: "POST",
                                  headers: {
                                    "content-type": "application/json",
                                  },
                                  body: JSON.stringify({ id: edit.id }),
                                }),
                              );
                              adopt(d);
                              setEdit(null);
                              setRemove(null);
                              setMessage(
                                "Photograph removed from the website.",
                              );
                            })
                          }
                        >
                          Yes, remove photograph
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setRemove(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        disabled={busy}
                        type="button"
                        onClick={() => setRemove(edit.id)}
                      >
                        <Trash2 size={15} /> Remove photograph
                      </button>
                    )}
                  </div>
                </form>
              </section>
            )}
          </dialog>
        </>
      )}
    </main>
  );
}
