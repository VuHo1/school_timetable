# Hướng Dẫn Deploy Ứng Dụng HAST Frontend Trên IIS

## 1. Yêu Cầu Hệ Thống

### 1.1 Phần Mềm Cần Thiết
- **Windows Server 2016/2019/2022** hoặc **Windows 10/11** (Professional/Enterprise)
- **IIS 10.0** trở lên
- **Node.js 18.0** trở lên (để build ứng dụng)
- **Git** (để clone source code)

### 1.2 Cài Đặt IIS và Các Tính Năng Cần Thiết

```powershell
# Mở PowerShell với quyền Administrator
# Cài đặt IIS
# Lấy danh sách tất cả feature IIS
$features = Get-WindowsOptionalFeature -Online | Where-Object { $_.FeatureName -like "IIS*" }

foreach ($f in $features) {
    if ($f.State -ne "Enabled") {
        Write-Host "Enabling $($f.FeatureName) ..."
        Enable-WindowsOptionalFeature -Online -FeatureName $f.FeatureName -All -NoRestart
    } else {
        Write-Host "$($f.FeatureName) đã bật rồi."
    }
}

Write-Host "Hoàn tất cài đặt IIS!"
```

### 1.3 Cài Đặt Node.js

Tải và cài đặt từ: https://nodejs.org/

```powershell
# Kiểm tra phiên bản Node.js đã cài đặt
node --version
npm --version
```

## 2. Chuẩn Bị Ứng Dụng

### 2.1 Clone và Cài Đặt Dependencies

```bash
# Clone source code (nếu chưa có)
git clone <repository-url>
cd school_timetable

# Cài đặt dependencies
npm install
```

### 2.2 Cấu Hình Environment Variables

Tạo file `.env.production` trong thư mục gốc:

```env
# Backend API URL
VITE_API_BASE_URL=https://api.hast-app.online

# Firebase Configuration (nếu sử dụng)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 2.3 Build Ứng Dụng

```bash
# Build ứng dụng cho production
npm run build

# Kết quả build sẽ nằm trong thư mục dist/
```

### 2.4 Cấu Trúc Thư Mục Sau Khi Build

```
dist/
├── index.html
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
└── [các file khác]
```

## 3. Cấu Hình IIS

### 3.1 Tạo Application Pool

1. Mở **IIS Manager**
2. Chọn **Application Pools** → **Add Application Pool**
3. Cấu hình:
   - **Name**: HAST_Frontend_AppPool
   - **.NET CLR Version**: No Managed Code
   - **Managed Pipeline Mode**: Integrated
   - **Identity**: ApplicationPoolIdentity

### 3.2 Tạo Website

1. Chọn **Sites** → **Add Website**
2. Cấu hình:
   - **Site name**: HAST_Frontend
   - **Application pool**: HAST_Frontend_AppPool
   - **Physical path**: C:\inetpub\wwwroot\frontend
   - **Port**: 80 (hoặc port khác tùy chọn)

### 3.3 Cấu Hình Application Pool

1. Chọn **HAST_Frontend_AppPool** → **Advanced Settings**
2. Cập nhật:
   - **Start Mode**: AlwaysRunning
   - **Idle Time-out**: 0 (không timeout)
   - **Regular Time Interval**: 0

## 4. Deploy Ứng Dụng

### 4.1 Copy Files Build

```powershell
# Copy toàn bộ nội dung thư mục dist vào C:\inetpub\wwwroot\frontend
Copy-Item -Path ".\dist\*" -Destination "C:\inetpub\wwwroot\frontend" -Recurse -Force
```

### 4.2 Cấp Quyền Thư Mục

```powershell
# Cấp quyền cho AppPool
icacls "C:\inetpub\wwwroot\frontend" /grant "IIS AppPool\HAST_Frontend_AppPool:(OI)(CI)(RX)" /T
```

## 5. Cấu Hình URL Rewrite (Quan Trọng cho SPA)

### 5.1 Cài Đặt URL Rewrite Module

Tải và cài đặt từ: https://www.iis.net/downloads/microsoft/url-rewrite

### 5.2 Tạo web.config

Tạo file `web.config` trong thư mục `C:\inetpub\wwwroot\frontend`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="Handle History Mode and custom 404/500" stopProcessing="true">
          <match url="(.*)" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    
    <!-- Cấu hình MIME types cho các file tĩnh -->
    <staticContent>
      <mimeMap fileExtension=".js" mimeType="application/javascript" />
      <mimeMap fileExtension=".css" mimeType="text/css" />
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
      <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
    </staticContent>
    
    <!-- Cấu hình cache cho static assets -->
    <caching>
      <profiles>
        <add extension=".js" policy="CacheForTimePeriod" duration="00:01:00:00" />
        <add extension=".css" policy="CacheForTimePeriod" duration="00:01:00:00" />
        <add extension=".png" policy="CacheForTimePeriod" duration="00:01:00:00" />
        <add extension=".jpg" policy="CacheForTimePeriod" duration="00:01:00:00" />
        <add extension=".gif" policy="CacheForTimePeriod" duration="00:01:00:00" />
        <add extension=".ico" policy="CacheForTimePeriod" duration="00:01:00:00" />
      </profiles>
    </caching>
    
    <!-- Cấu hình compression -->
    <httpCompression>
      <dynamicTypes>
        <add mimeType="text/*" enabled="true" />
        <add mimeType="message/*" enabled="true" />
        <add mimeType="application/javascript" enabled="true" />
        <add mimeType="application/json" enabled="true" />
        <add mimeType="*/*" enabled="false" />
      </dynamicTypes>
      <staticTypes>
        <add mimeType="text/*" enabled="true" />
        <add mimeType="message/*" enabled="true" />
        <add mimeType="application/javascript" enabled="true" />
        <add mimeType="application/atom+xml" enabled="true" />
        <add mimeType="application/xaml+xml" enabled="true" />
        <add mimeType="image/svg+xml" enabled="true" />
        <add mimeType="*/*" enabled="false" />
      </staticTypes>
    </httpCompression>
  </system.webServer>
</configuration>
```

## 6. Cấu Hình CORS (Nếu Cần)

Nếu backend và frontend chạy trên các domain khác nhau, cần cấu hình CORS trong backend.

## 7. Kiểm Tra và Test

### 7.1 Kiểm Tra Application Pool

1. Mở **IIS Manager**
2. Chọn **Application Pools** → **HAST_Frontend_AppPool**
3. Đảm bảo **Status** là **Started**

### 7.2 Kiểm Tra Website

1. Chọn **Sites** → **HAST_Frontend**
2. Đảm bảo **Status** là **Started**
3. Click **Browse** để mở website

### 7.3 Test Ứng Dụng

- Kiểm tra trang chủ load được
- Kiểm tra routing hoạt động (navigate giữa các trang)
- Kiểm tra API calls đến backend
- Kiểm tra authentication/authorization

## 8. Cấu Hình HTTPS (Khuyến Nghị)

### 8.1 Tạo SSL Certificate

```powershell
# Tạo self-signed certificate (chỉ dùng cho development)
New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\LocalMachine\My"
```

### 8.2 Bind HTTPS

1. Trong IIS Manager, chọn site **HAST_Frontend**
2. Click **Bindings** → **Add**
3. Cấu hình:
   - **Type**: https
   - **Port**: 443
   - **SSL certificate**: Chọn certificate đã tạo

## 9. Troubleshooting

### 9.1 Lỗi 404 - Not Found
- Kiểm tra URL Rewrite Module đã cài đặt
- Kiểm tra web.config có đúng cú pháp
- Kiểm tra đường dẫn vật lý

### 9.2 Lỗi 500 - Internal Server Error
- Kiểm tra quyền thư mục
- Kiểm tra web.config syntax
- Kiểm tra Application Pool configuration

### 9.3 Lỗi API Calls
- Kiểm tra VITE_API_BASE_URL trong .env.production
- Kiểm tra CORS configuration
- Kiểm tra network connectivity

### 9.4 Lỗi Routing
- Kiểm tra web.config rewrite rules
- Kiểm tra React Router configuration
- Kiểm tra base URL trong vite.config.js

**Lưu ý**: Đảm bảo thay đổi các thông tin nhạy cảm như API keys, URLs trước khi deploy vào production.
