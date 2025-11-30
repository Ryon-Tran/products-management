"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AddressList from "@/components/AddressList";
import OrdersList from "@/components/OrdersList";
import { auth as authApi } from "@/lib/api";

export default function ProfilePage() {
  const [tab, setTab] = useState<"info" | "addresses" | "orders">("info");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    // load any cached user immediately so UI updates right away
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('pm_user');
        if (raw) {
          const u = JSON.parse(raw);
          if (u?.name) setName(u.name);
          if (u?.email) setEmail(u.email);
        }
      }
    } catch (err) {
      /* ignore parse errors */
    }

    (async () => {
      setLoading(true);
      try {
        const me = await authApi.me();
        if (!mounted) return;
        if (me) {
          if (me.name) setName(me.name);
          if (me.email) setEmail(me.email);
        }
      } catch (e) {
        console.warn('failed to load profile', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  return (
    <div className="min-h-[70vh] bg-[color:var(--color-bg)] py-8">
      <div className="site-container max-w-3xl mx-auto">
        <h1 className="mb-6 text-2xl font-bold text-[color:var(--color-text)]">Hồ sơ cá nhân</h1>
        <Card className="mb-6">
          <CardHeader className="flex flex-col items-center gap-2">
            <div className="h-20 w-20 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-semibold">
              {name ? name[0].toUpperCase() : "U"}
            </div>
            <div className="text-lg font-medium">{name}</div>
            <div className="text-sm text-[color:var(--color-muted)]">{email}</div>
          </CardHeader>
        </Card>
        <Tabs value={tab} onValueChange={v => setTab(v as "info" | "addresses" | "orders")} className="w-full">
          <TabsList className="mb-4 flex gap-2">
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="addresses">Địa chỉ</TabsTrigger>
            <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
          </TabsList>
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Thông tin cá nhân</h2>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-sm text-[color:var(--color-muted)]">Đang tải thông tin...</div>
                ) : (
                  <div className="grid gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium">Họ và tên</label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">Email</label>
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={() => alert('Tính năng lưu hồ sơ chưa được triển khai trong demo')}>Lưu</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="addresses">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Địa chỉ giao hàng</h2>
              </CardHeader>
              <CardContent>
                <AddressList />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Đơn hàng của bạn</h2>
              </CardHeader>
              <CardContent>
                <OrdersList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
