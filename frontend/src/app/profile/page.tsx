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
    <div className="min-h-[80vh] bg-gradient-to-br from-slate-50 to-blue-100 py-10">
      <div className="site-container max-w-4xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 mb-10">
          <div className="flex flex-col items-center md:items-start md:w-1/3">
            <Card className="w-full rounded-xl shadow-lg border border-blue-100 p-6 flex flex-col items-center bg-white">
              <div className="relative mb-2">
                <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-blue-400 to-blue-200 shadow-lg flex items-center justify-center text-4xl font-bold text-white border-4 border-white">
                  {name ? name[0].toUpperCase() : "U"}
                </div>
                <span className="absolute bottom-2 right-2 bg-green-400 border-2 border-white rounded-full w-5 h-5"></span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-blue-900">{name || "Chưa đặt tên"}</div>
              <div className="text-base text-blue-700 mb-2">{email}</div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline">Cập nhật</Button>
              </div>
              <div className="flex gap-3 mt-4">
                <a href="https://facebook.com" target="_blank" rel="noopener" title="Facebook" className="hover:scale-110 transition">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#1877F3"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.326 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
                </a>
                <a href="https://zalo.me" target="_blank" rel="noopener" title="Zalo" className="hover:scale-110 transition">
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="#0088FF"><path d="M16 2C8.268 2 2 7.82 2 15.02c0 3.98 1.98 7.56 5.08 10.02l-1.08 3.96a1 1 0 0 0 1.32 1.2l4.36-1.44c1.36.38 2.8.58 4.32.58 7.732 0 14-5.82 14-13.02S23.732 2 16 2zm0 24c-1.44 0-2.82-.2-4.12-.56a1 1 0 0 0-.64.04l-3.44 1.14.86-3.16a1 1 0 0 0-.36-1.06C5.36 20.18 3.5 17.7 3.5 15.02c0-6.07 6.08-11.02 12.5-11.02s12.5 4.95 12.5 11.02S22.07 26 16 26z"/></svg>
                </a>
                <a href={`mailto:${email}`} title="Email" className="hover:scale-110 transition">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#EA4335"><path d="M12 13.065l-8-5.065V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-8 5.065zM12 11L4 6.5V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1.5L12 11z"/></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener" title="LinkedIn" className="hover:scale-110 transition">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#0A66C2"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.026-3.063-1.867-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.841-1.563 3.039 0 3.601 2.002 3.601 4.604v5.592z"/></svg>
                </a>
              </div>
            </Card>
          </div>
          <div className="flex-1">
            <Tabs value={tab} onValueChange={v => setTab(v as "info" | "addresses" | "orders")} className="w-full">
              <TabsList className="mb-6 flex gap-2 bg-white rounded-xl shadow px-2 py-2">
                <TabsTrigger value="info" className="px-4 py-2 rounded-lg font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">Thông tin</TabsTrigger>
                <TabsTrigger value="addresses" className="px-4 py-2 rounded-lg font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">Địa chỉ</TabsTrigger>
                <TabsTrigger value="orders" className="px-4 py-2 rounded-lg font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">Đơn hàng</TabsTrigger>
              </TabsList>
              <TabsContent value="info">
                <Card className="rounded-xl shadow-lg border border-blue-100">
                  <CardHeader>
                    <h2 className="text-xl font-bold text-blue-800">Thông tin cá nhân</h2>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-sm text-blue-500">Đang tải thông tin...</div>
                    ) : (
                      <div className="grid gap-4">
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-blue-700">Họ và tên</label>
                          <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-blue-50 focus:bg-white border-blue-200 focus:border-blue-400 rounded-lg" />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-blue-700">Email</label>
                          <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-blue-50 focus:bg-white border-blue-200 focus:border-blue-400 rounded-lg" />
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={() => alert('Tính năng lưu hồ sơ chưa được triển khai trong demo')} className="bg-blue-600 hover:bg-blue-700 text-white px-6">Lưu</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="addresses">
                <Card className="rounded-xl shadow-lg border border-blue-100">
                  <CardHeader>
                    <h2 className="text-xl font-bold text-blue-800">Địa chỉ giao hàng</h2>
                  </CardHeader>
                  <CardContent>
                    <AddressList />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="orders">
                <Card className="rounded-xl shadow-lg border border-blue-100">
                  <CardHeader>
                    <h2 className="text-xl font-bold text-blue-800">Đơn hàng của bạn</h2>
                  </CardHeader>
                  <CardContent>
                    <OrdersList />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
