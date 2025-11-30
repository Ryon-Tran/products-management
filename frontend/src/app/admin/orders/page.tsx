import OrdersList from "./OrdersList";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminOrdersPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Quản lý đơn hàng</h1>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Đơn hàng</CardTitle>
            </div>
            <CardAction>
              <div className="flex items-center gap-2">
                <Button size="sm">Thanh toán chưa xử lý</Button>
                <Button size="sm" variant="default">Xuất CSV</Button>
              </div>
            </CardAction>
          </CardHeader>
          <CardContent>
            <OrdersList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
