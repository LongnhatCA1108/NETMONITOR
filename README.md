# NETMONITOR - HỆ THỐNG GIÁM SÁT MẠNG NỘI BỘ VÀ DỊCH VỤ TAILSCALE

Tài liệu mô tả kiến trúc, đặc tả API và thiết kế kỹ thuật cho hệ thống giám sát node và service trong mạng riêng ảo Tailscale (Tailnet).

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1. Mục tiêu
- Xây dựng dashboard nội bộ phục vụ môi trường **Lab / cá nhân**:
  - **Phân loại Node (3 loại):**
    1. `Node Monitor` (🛰️ Hub giám sát trung tâm - nơi đang chạy NetMonitor, không tự ping chính nó).
    2. `Node Server` (🖥️ Máy chủ dịch vụ - ping TCP/HTTP thường xuyên để theo dõi uptime, latency).
    3. `Node Endpoint` (💻 Máy trạm, điện thoại - không ping thường xuyên, chỉ lưu lịch sử kết nối/ngắt).
  - **Phân loại Dịch Vụ (3 loại, mỗi loại có icon riêng biệt):**
    1. `Dịch vụ Lưu trữ` (💾 Storage - MinIO, S3, NAS share, backup vault...).
    2. `Dịch vụ Cơ sở dữ liệu` (🗄️ Database - PostgreSQL, MySQL, Redis, MongoDB...).
    3. `Dịch vụ Ứng dụng` (⚡ Application - API gateway, Auth service, Grafana, Docker container...).
  - **Giao diện Tech Topology Map:** Bản đồ mạng tương tác, đặt Node Giám Sát ở trung tâm; các thiết bị xung quanh kết nối vào Hub. Thiết bị online có đèn sáng và **dòng dữ liệu chạy vào/ra**; thiết bị offline tắt đèn và kết nối bằng đường nét đứt.


### 1.2. Quy mô & Giới hạn thiết kế
- **Quy mô:** Dưới 20 nodes, dưới 40 services.
- **Lưu trữ:** Lưu trữ ngắn hạn (3 – 7 ngày), tự động dọn rác (purge) để giữ SQLite luôn siêu nhẹ.
- **Tần suất kiểm tra:**
  - Đồng bộ thiết bị từ Tailscale API: Mỗi 2 – 5 phút.
  - Kiểm tra dịch vụ (Service Check): 60 giây (hoặc tùy biến 30s – 300s).

### 1.3. Công nghệ lựa chọn
- **Backend:** Node.js (Express hoặc Fastify).
  - Đóng vai trò Proxy & Background Worker: che giấu API Key Tailscale, chạy cron scheduler kiểm tra dịch vụ và cung cấp REST API cho frontend.
- **Cơ sở dữ liệu:** SQLite (sử dụng driver `better-sqlite3` kết hợp chế độ `WAL - Write-Ahead Logging`).
- **Frontend:** React (Vite), SPA build tĩnh xuất ra thư mục `dist/` và được chính backend Node.js serve qua static files (không cần máy chủ web phụ).

---

## 2. CHI TIẾT CÁC NHÓM API CỦA TAILSCALE

Hệ thống tích hợp với hệ sinh thái API của Tailscale (v2).
- **Base URL:** `https://api.tailscale.com/api/v2/`
- **Xác thực:** 
  - Personal API Key: `Authorization: Bearer tskey-api-...`
  - Hoặc OAuth Client: Scopes `devices:core:read`, `routes:read`, ...

### Nhóm 1: Devices API (Polling trạng thái mạng & cấu hình node)
Đây là nhóm API chính được dùng để đồng bộ danh sách thiết bị.

| Endpoint | Method | Mô tả & Tham số | Ứng dụng trong dự án |
| :--- | :--- | :--- | :--- |
| `/tailnet/{tailnet}/devices` | `GET` | Lấy toàn bộ danh sách thiết bị trong mạng.<br>• Query `?fields=all`: Lấy thêm `clientConnectivity`, `postureIdentity`, `sshEnabled`.<br>• Filter: `?hostname=...`, `?tags=tag:prod`, `?isEphemeral=true` | Poller định kỳ (2-5 phút) gọi để cập nhật danh sách node, IP 100.x, OS, lastSeen. |
| `/device/{deviceId}` | `GET` | Xem chi tiết cấu hình và trạng thái của 1 node cụ thể. | Dùng khi click vào chi tiết 1 node trên dashboard. |
| `/device/{deviceId}/routes` | `GET` | Kiểm tra routes: So sánh `advertisedRoutes` và `enabledRoutes`. | Kiểm tra Subnet Router hoặc Exit Node có đang kích hoạt không. |
| `/device/{deviceId}/attributes` | `GET` / `PATCH` | Đọc / Gán thuộc tính posture tùy biến (`custom:*`). | Phân nhóm hoặc gắn metadata mở rộng cho node. |

### Nhóm 2: Logging API (Flow logs & Audit logs)
Nhóm API dành cho phân tích kết nối và kiểm toán bảo mật.

| Endpoint | Method | Mô tả | Ứng dụng |
| :--- | :--- | :--- | :--- |
| `/tailnet/{tailnet}/logging/network` | `GET` | Network flow logs: Ghi nhận node nào kết nối tới node nào, qua cổng nào, thời gian nào. | Dùng mở rộng khi cần truy vết luồng traffic kết nối giữa các node. |
| `/tailnet/{tailnet}/logging/configuration` | `GET` | Audit log cấu hình: Ai đã sửa ACL, ai phê duyệt node, thời gian. | Theo dõi lịch sử thay đổi quyền và thiết bị trong tailnet. |
| `/tailnet/{tailnet}/logging/{logType}/stream` | `GET/PUT/DELETE` | Cấu hình stream log liên tục ra SIEM, AWS S3 hoặc S3-compatible storage (`logType` = `configuration` \| `network`). | Dùng khi muốn lưu trữ log dài hạn ra bên ngoài. |

### Nhóm 3: Webhooks API (Sự kiện theo thời gian thực)
Nhận thông báo chủ động từ Tailscale thay vì phải liên tục gọi API poll.

- **Endpoints:** `GET/POST /tailnet/{tailnet}/webhooks`, `GET/PATCH/DELETE /webhooks/{endpointId}`, `POST .../test`, `POST .../rotate`
- **Các Event quan trọng:**
  - `nodeCreated`: Có thiết bị mới vừa tham gia tailnet.
  - `nodeNeedsApproval` / `nodeApproved`: Trạng thái phê duyệt thiết bị.
  - `nodeKeyExpiring` / `nodeKeyExpired`: Cảnh báo key sắp hết hạn hoặc đã hết hạn (gây mất mạng).
  - `nodeDeleted`: Thiết bị bị xóa khỏi mạng.
  - `subnetIPForwardingNotEnabled`: Subnet router bị lỗi chưa bật IP forwarding trên OS.

### Nhóm 4: Client Metrics (Scrape Prometheus v1.78.0+)
Không qua REST API mà scrape trực tiếp từ daemon `tailscaled` trên từng node.

- **Cách lấy metric:**
  - Cục bộ: `http://100.100.100.100/metrics`
  - Từ xa qua mạng Tailnet: Chạy lệnh `tailscale set --webclient`, mở port `5252` trong ACL, sau đó scrape: `http://<tailscale-ip>:5252/metrics`
  - CLI: `tailscale metrics print`
- **Các metric hữu ích:**
  - `tailscaled_inbound_bytes_total`, `tailscaled_outbound_bytes_total`: Băng thông vào/ra.
  - `tailscaled_inbound_dropped_packets_total{reason="acl|..."}`: Gói tin bị drop do vi phạm ACL.
  - `tailscaled_health_messages{type}`: Thông điệp cảnh báo sức khỏe của client.
  - `path="direct_ipv4" | "direct_ipv6" | "derp"`: Kiểm tra kết nối là trực tiếp (P2P tốc độ cao) hay phải đi vòng qua relay DERP (độ trễ cao).

---

## 3. KIẾN TRÚC HỆ THỐNG VÀ LUỒNG DỮ LIỆU

```
                 +----------------------------+
                 |    Tailscale Cloud API     |
                 | (api.tailscale.com/api/v2) |
                 +--------------+-------------+
                                |
                   Poll 2-5 min | (GET /devices)
                                v
               +--------------------------------+
               |       NODE.JS BACKEND          |
               |                                |
               |  [Poller Task]                 |
               |  - Upsert nodes info           |
               |  - Compute is_online           |
               |                                |
               |  [Service Checker Worker]      |
               |  - Concurrency pool (5-10 reqs)|
               |  - TCP Connect / HTTP Ping     |
               |  - Record latency & status     |
               |                                |
               |  [Purge Task]                  |
               |  - Run nightly (retain 3-7d)   |
               +-------+----------------+-------+
                       |                |
         Read / Write  |                | Serve API & Static UI
                       v                v
            +--------------------+   +---------------------+
            |   SQLite (WAL)     |   |   React SPA (Vite)  |
            |   netmonitor.db    |   |   (dist/ directory) |
            +--------------------+   +---------------------+
```

### 3.1. Cơ chế giám sát thiết bị (Device Monitoring)
- Node Backend chạy một cron job định kỳ **2 – 5 phút** gọi `GET /tailnet/{tailnet}/devices`.
- Xác định trạng thái online:
  $$\text{is\_online} = (\text{now} - \text{lastSeen}) < 3\text{ phút}$$
- Lưu / cập nhật bảng `devices`.

### 3.2. Cơ chế kiểm tra dịch vụ (Service Checker)
- Định kỳ **60 giây** (mặc định), hệ thống quét toàn bộ các service đang kích hoạt (`enabled = 1`).
- Thực hiện kiểm tra trực tiếp qua mạng Tailscale:
  - **TCP Check:** Tạo kết nối socket thuần tới `<node_ip>:<port>`, timeout 3 – 5 giây. Nếu kết nối thành công thì ghi nhận `UP` và tính `latency_ms`.
  - **HTTP Check:** Gửi request `GET http://<node_ip>:<port><path>` (ví dụ `/health`), timeout 5 giây, kiểm tra status code 2xx/3xx.
- Giới hạn tải: Dùng worker pool kiểm tra tối đa **5 – 10 kiểm tra đồng thời** (concurrency limit) để không gây nghẽn kết nối hoặc khóa ghi file SQLite.

### 3.3. Cơ chế xoay vòng dữ liệu (Data Retention)
- Bảng lịch sử kiểm tra `checks` chỉ cần lưu 3 – 7 ngày.
- Mỗi 24h chạy tác vụ:
  ```sql
  DELETE FROM checks WHERE checked_at < datetime('now', '-3 days');
  ```

---

## 4. THIẾT KẾ CƠ SỞ DỮ LIỆU (SQLITE SCHEMA)

Sử dụng `better-sqlite3`. Khởi tạo DB với:
```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA busy_timeout = 5000;
```

### 4.1. Bảng `devices` (Thiết bị Tailscale)
```sql
CREATE TABLE IF NOT EXISTS devices (
    node_id TEXT PRIMARY KEY,           -- ID node từ Tailscale (ví dụ: "node-xyz123")
    hostname TEXT NOT NULL,            -- Hostname thiết bị (ví dụ: "web-worker-01")
    ip TEXT NOT NULL,                  -- Địa chỉ IPv4 Tailscale (100.x.y.z)
    os TEXT,                           -- Hệ điều hành (linux, windows, darwin...)
    client_version TEXT,               -- Phiên bản client Tailscale
    last_seen TEXT,                    -- ISO8601 timestamp từ Tailscale API
    is_online INTEGER DEFAULT 0,       -- 1: Online, 0: Offline
    tags TEXT,                         -- JSON array dạng chuỗi: '["tag:prod", "tag:server"]'
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2. Bảng `services` (Dịch vụ khai báo theo dõi)
```sql
CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,           -- Khóa ngoại trỏ về devices(node_id)
    name TEXT NOT NULL,                -- Tên gợi nhớ (ví dụ: "PostgreSQL DB", "Nginx Gateway")
    port INTEGER NOT NULL,             -- Cổng dịch vụ (ví dụ: 5432, 80, 8080)
    type TEXT DEFAULT 'tcp',           -- Loại check: 'tcp' hoặc 'http'
    path TEXT DEFAULT '/',             -- Đường dẫn (nếu type = 'http', ví dụ: '/healthz')
    interval_sec INTEGER DEFAULT 60,   -- Chu kỳ check (giây)
    enabled INTEGER DEFAULT 1,         -- 1: Đang giám sát, 0: Tạm dừng
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(device_id) REFERENCES devices(node_id) ON DELETE CASCADE
);
```

### 4.3. Bảng `checks` (Lịch sử kết quả kiểm tra)
```sql
CREATE TABLE IF NOT EXISTS checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL,
    checked_at TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL,              -- 'UP' hoặc 'DOWN'
    latency_ms INTEGER DEFAULT 0,      -- Thời gian phản hồi (ms)
    error_msg TEXT,                    -- Chi tiết lỗi nếu DOWN (ECONNREFUSED, ETIMEDOUT...)
    FOREIGN KEY(service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_checks_service_ts ON checks(service_id, checked_at DESC);
```

---

## 5. THIẾT KẾ BACKEND REST API

Tất cả API được phục vụ dưới tiền tố `/api`.

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/devices` | Danh sách thiết bị, lọc theo trạng thái online/offline, tags. |
| `POST` | `/api/devices/sync` | Kích hoạt đồng bộ thủ công ngay lập tức từ Tailscale API. |
| `GET` | `/api/services` | Danh sách toàn bộ service, kèm trạng thái mới nhất (`last_status`, `last_latency`, `last_check`). |
| `POST` | `/api/services` | Khai báo theo dõi service mới `{ device_id, name, port, type, path, interval_sec }`. |
| `PUT` | `/api/services/:id` | Cập nhật cấu hình service hoặc bật/tắt `enabled`. |
| `DELETE` | `/api/services/:id` | Xóa theo dõi một service. |
| `GET` | `/api/services/:id/history?hours=24` | Lấy dữ liệu lịch sử độ trễ và trạng thái để vẽ biểu đồ đường (latency chart). |
| `GET` | `/api/dashboard/summary` | Thống kê nhanh: Tổng node, số node online, tổng service, số service DOWN. |

---

## 6. THIẾT KẾ ĐỊNH TUYẾN GIAO DIỆN (SOC REACT ROUTER)

Hệ thống sử dụng `react-router-dom` với Backend hỗ trợ SPA Fallback hoàn chỉnh:

| Đường dẫn (URL) | Màn Hình | Tính Năng & Thiết Kế SOC |
| :--- | :--- | :--- |
| **`/`** *(hoặc `/topology`)* | **Bản Đồ Topology Toàn Màn Hình** | • Bố cục tràn viền 100vh không thanh cuộn chuẩn màn hình NOC.<br>• Hub giám sát trung tâm với luồng sóng radar.<br>• Đường liên kết hiển thị luồng dữ liệu 2 chiều khi online, nét đứt khi offline.<br>• Panel HUD Telemetry và Drawer trượt xem chi tiết từng node.<br>• Nút **`[ ⛶ Toàn Màn Hình ]`** chiếu lên TV hoặc màn hình phụ. |
| **`/services`** | **Danh Mục Dịch Vụ** | • Phân loại theo 3 nhóm: 💾 Storage, 🗄️ Database, ⚡ Application.<br>• Bộ lọc trạng thái (ALL/UP/DOWN) và ô tìm kiếm nhanh.<br>• Modal khai báo dịch vụ mới, thanh tiến trình Uptime 24h. |
| **`/nodes`** | **Danh Mục Thiết Bị** | • Phân loại 3 nhóm Node: 🛰️ Hub Monitor, 🖥️ Managed Servers, 💻 Endpoints.<br>• Xem nhật ký kết nối / ngắt kết nối (Audit Trail) của từng endpoint. |
| **`/analytics`** | **Phân Tích & SLA** | • Biểu đồ độ trễ trực quan 24 giờ của từng dịch vụ (Average, Min, Max Peak).<br>• Bảng đánh giá tiêu chuẩn SLA (Đạt/Vi phạm ngưỡng 99.5%). |


---

## 7. CẤU TRÚC DỰ ÁN DỰ KIẾN (PROJECT DIRECTORY)

```
D:\CODE\CANHAN\NETMONITOR/
├── README.md                 <-- Tài liệu này
├── .env.example              <-- Mẫu biến môi trường
├── package.json
├── server/                   <-- Backend Node.js
│   ├── index.js              <-- Server entrypoint (Express/Fastify)
│   ├── db.js                 <-- Khởi tạo SQLite (better-sqlite3 + WAL)
│   ├── tailscale.js          <-- Client tương tác Tailscale API
│   ├── checker.js            <-- Worker kiểm tra TCP/HTTP Socket
│   └── routes.js             <-- Khai báo REST API
└── client/                   <-- Frontend React (Vite)
    ├── package.json
    ├── vite.config.js
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── DeviceTable.jsx
    │   │   ├── ServiceTable.jsx
    │   │   └── AddServiceModal.jsx
    │   └── services/api.js
    └── dist/                 <-- Thư mục build tĩnh sau khi `npm run build`
```

---

## 8. CẤU HÌNH MẪU (.env)

```env
# Cấu hình Server
PORT=3000
NODE_ENV=production

# Cấu hình Tailscale API
TAILSCALE_API_KEY=tskey-api-kxxxxxxxxxxxxxxx
TAILSCALE_TAILNET=your-tailnet-name.ts.net

# Cấu hình chu kỳ
TAILSCALE_SYNC_INTERVAL_SEC=180   # 3 phút đồng bộ devices một lần
DEFAULT_SERVICE_CHECK_SEC=60      # 60 giây ping service một lần
DATA_RETENTION_DAYS=3             # Lưu log lịch sử trong 3 ngày
```
