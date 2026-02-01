// pages/admin/Centers.jsx
import React from "react";
import { Table, Button } from "antd";

const Centers = () => {
  return (
    <div>
      <h2>Centers Management</h2>
      <Button type="primary" style={{ marginBottom: 16 }}>Add New Center</Button>
      <Table columns={[{ title: "Center Name" }, { title: "Location" }]} dataSource={[]} />
    </div>
  );
};

export default Centers;
