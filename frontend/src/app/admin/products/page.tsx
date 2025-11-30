"use client";

import { useEffect, useState } from "react";
import { list as fetchProducts, create as createProduct, update as updateProduct, remove as removeProduct } from "@/lib/api/products";
import { list as fetchCategories } from "@/lib/api/categories";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Edit, Trash2, ImagePlus } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Product = {
  id?: number;
  name: string;
  description?: string;
  price?: number;
  category_id?: number | null;
  image_url?: string | null;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [selected, setSelected] = useState<number[]>([]);

  const [form, setForm] = useState<{ name: string; description: string; price: string; category_id: string; image_url: string }>(
    { name: "", description: "", price: "", category_id: "", image_url: "" }
  );

  async function load() {
    setLoading(true);
    try {
      const prods = await fetchProducts();
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (err) {
      console.warn("Failed to load products", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cats = await fetchCategories();
        if (mounted && Array.isArray(cats)) setCategories(cats);
      } catch (err) {
        console.warn("Failed to load categories", err);
      }
    })();
    load();
    return () => { mounted = false };
  }, []);

  function openNew() {
    setEditing(null);
    setForm({ name: "", description: "", price: "", category_id: "", image_url: "" });
    setDialogOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name || "",
      description: p.description || "",
      price: typeof p.price === "number" ? p.price.toString() : p.price || "",
      category_id: p.category_id ? String(p.category_id) : "",
      image_url: p.image_url || ""
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price ? Number(form.price) : 0,
      category_id: form.category_id ? Number(form.category_id) : undefined,
      image_url: form.image_url ? String(form.image_url).trim() : undefined,
    } as any;

    try {
      if (editing && editing.id) {
        await updateProduct(editing.id, payload);
      } else {
        await createProduct(payload);
      }
      setDialogOpen(false);
      await load();
    } catch (err: any) {
      console.error("Save failed", err);
      alert(err?.message || "Save failed");
    }
  }

  async function handleDelete(id?: number) {
    if (!id) return;
    if (!confirm("Xác nhận xóa sản phẩm này?")) return;
    try {
      await removeProduct(id);
      await load();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Xóa thất bại");
    }
  }

  function toggleSelect(id?: number) {
    if (!id) return;
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function toggleSelectAll() {
    if (selected.length === products.length) setSelected([]);
    else setSelected(products.filter(p => p.id).map(p => p.id as number));
  }

  return (
    <div>

      <div className="mb-4 flex items-center justify-between">
      <h1 className="mb-4 text-2xl font-semibold ">Quản lý sản phẩm</h1>
        <div className="flex gap-2">
          <Button onClick={openNew}>Thêm sản phẩm</Button>
        </div>
      </div>

      <div className="rounded bg-white p-4 shadow">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <input type="checkbox" aria-label="select all" onChange={toggleSelectAll} checked={selected.length === products.length && products.length > 0} />
                  </TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <input type="checkbox" aria-label={`select-${p.id}`} checked={selected.includes(p.id as number)} onChange={() => toggleSelect(p.id)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded bg-slate-100">
                          <img src={p.image_url || '/images/placeholder.png'} alt={p.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-sm text-[color:var(--color-muted)]">{p.description ? (p.description.length > 100 ? p.description.slice(0, 100) + '...' : p.description) : '-'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{(categories.find(c => c.id === p.category_id)?.name) || '-'}</TableCell>
                    <TableCell>{!isNaN(Number(p.price)) ? Number(p.price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : p.price}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button title="Sửa" onClick={() => openEdit(p)} className="inline-flex items-center gap-2 rounded border px-2 py-1">
                          <Edit size={14} />
                          <span className="text-sm">Sửa</span>
                        </button>
                        <button title="Xóa" onClick={() => handleDelete(p.id)} className="inline-flex items-center gap-2 rounded border px-2 py-1 text-destructive">
                          <Trash2 size={14} />
                          <span className="text-sm">Xóa</span>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {/* Product Info */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Tên sản phẩm</label>
              <Input value={form.name} onChange={(e: any) => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Nhập tên sản phẩm" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Mô tả</label>
              <Input value={form.description} onChange={(e: any) => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Mô tả ngắn gọn" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Giá</label>
                <Input type="number" value={form.price} onChange={(e: any) => setForm(prev => ({ ...prev, price: e.target.value }))} placeholder="Giá sản phẩm" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Danh mục</label>
                <Select value={form.category_id} onValueChange={val => setForm(prev => ({ ...prev, category_id: val }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Hình ảnh sản phẩm</label>
              <div className="flex items-center gap-3">
                <Input value={form.image_url} placeholder="https://.../image.jpg" onChange={(e: any) => setForm(prev => ({ ...prev, image_url: e.target.value }))} />
                {form.image_url ? (
                  <img src={form.image_url} alt="preview" className="h-12 w-12 rounded object-cover border" />
                ) : (
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded border bg-slate-100 text-muted-foreground">
                    <ImagePlus size={24} />
                  </span>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>{editing ? 'Lưu' : 'Tạo'}</Button>
            <DialogClose>
              <Button variant="ghost">Hủy</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
