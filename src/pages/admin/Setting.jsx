import React from 'react';

const Setting = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>⚙️ Cấu hình hệ thống</h1>
      <p>Trang cấu hình hệ thống dành cho Admin</p>
      <div style={{ 
        backgroundColor: '#f0f9ff', 
        padding: '15px', 
        borderRadius: '8px',
        border: '1px solid #0ea5e9'
      }}>
        <p><strong>✅ Navigation thành công!</strong></p>
        <p>Bạn đã truy cập thành công vào trang Cấu hình hệ thống thông qua abilities-based navigation.</p>
      </div>
    </div>
  );
};

export default Setting;
