import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export const Route = createFileRoute("/_main/about")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin hệ thống</CardTitle>
        <CardDescription>
          Route này hiện không còn nằm trong sidebar chính nhưng vẫn có thể giữ
          lại để dùng cho cấu hình hoặc tài liệu nội bộ.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-7 text-muted-foreground">
          Nếu không cần nữa, có thể xóa route này ở bước tiếp theo để cấu trúc
          portal gọn hơn.
        </p>
      </CardContent>
    </Card>
  );
}
