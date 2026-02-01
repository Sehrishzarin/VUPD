import { Button, Layout, Menu } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../../components/NotificationBell";
import "./DefaultLayout.css";

const { Header, Content, Sider } = Layout;

const DefaultLayout = ({ menuItems }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [selectedKey, setSelectedKey] = useState("");

  // Update selected menu item based on current route
  useEffect(() => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    if (currentItem) {
      setSelectedKey(currentItem.key);
    } else {
      // Handle nested routes (e.g., /invigilator/duties -> duties tab)
      const pathSegments = location.pathname.split('/');
      const lastSegment = pathSegments[pathSegments.length - 1];
      const matchedItem = menuItems.find(item => {
        const itemPathSegments = item.path.split('/');
        return itemPathSegments[itemPathSegments.length - 1] === lastSegment;
      });
      if (matchedItem) {
        setSelectedKey(matchedItem.key);
      }
    }
  }, [location.pathname, menuItems]);
  const handleLogout = () => {
 
    console.log("User logged out");
    logout();
    navigate("/");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={200}
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          overflow: "hidden",
        }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", paddingBottom: 80 }}>
          {/* Logo Section */}
          <div className="logo" style={{ padding: "20px 16px", flexShrink: 0 }}>
            <img
              src="/logo.png"
              alt="Logo"
              height={100}
              width={100}
              style={{ display: "block", margin: "0 auto" }}
            />
          </div>
          
          {/* Menu Section - Scrollable */}
          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minHeight: 0, padding: "12px 0" }}>
            <Menu
              theme="dark"
              mode="inline"
              items={menuItems}
              selectedKeys={[selectedKey]}
              onClick={({ key }) => {
                const item = menuItems.find((i) => i.key === key);
                if (item?.path) {
                  setSelectedKey(key);
                  navigate(item.path);
                }
              }}
              style={{ 
                borderRight: 0,
                background: "transparent",
                fontSize: "14px"
              }}
            />
          </div>
        </div>
        
        {/* Logout Button - Always Visible at Bottom Edge */}
        <div style={{ 
          position: "absolute",
          bottom: 16,
          left: 0,
          right: 0,
          width: "100%",
          padding: "0 16px",
          zIndex: 10,
          background: "inherit"
        }}>
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ width: "100%", height: "40px" }}
          >
            Logout
          </Button>
        </div>
      </Sider>
      
      <Layout style={{ marginLeft: 200 }}>
        <Header style={{ 
          background: "#fff", 
          padding: "0 24px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 1,
          boxShadow: "none",
          borderBottom: "1px solid #e8e8e8"
        }}>
          <div style={{ fontWeight: "bold", fontSize: "18px" }}>
            {user?.name || "Dashboard"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {user?.role !== "admin" && <NotificationBell />}
          </div>
        </Header>
        <Content style={{ 
          margin: 0, 
          padding: "24px",
          minHeight: "calc(100vh - 64px)",
          background: "#f8fafc",
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden"
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DefaultLayout;