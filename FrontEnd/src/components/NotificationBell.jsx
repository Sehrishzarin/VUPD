// components/NotificationBell.jsx
import { useEffect, useState } from "react";
import {
  Badge,
  Dropdown,
  List,
  Button,
  Space,
  Typography,
  Tag,
  Divider,
  Spin,
  Empty,
  Tooltip
} from "antd";
import {
  BellOutlined,
  DeleteOutlined,
  CheckOutlined,
  EyeOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text, Title } = Typography;

const NotificationBell = () => {
  const { 
    socket, 
    user, 
    getNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotification, 
    clearAllNotifications 
  } = useAuth();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  // Load notifications from backend
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit("registerUser", user._id);

    const handleNotification = async (data) => {
      console.log("Received real-time notification:", data);
      await loadNotifications();
      // Optional: Trigger a toast here if needed
    };

    socket.on("notification", handleNotification);
    socket.on("admin-notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
      socket.off("admin-notification", handleNotification);
    };
  }, [socket, user]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      await loadNotifications();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      await loadNotifications();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      await loadNotifications();
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      await loadNotifications();
    } catch (err) {
      console.error("Failed to clear all notifications:", err);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'duty-assigned': '🎯',
      'attendance-marked': '✅',
      'attendance-verified': '📋',
      'leave-request-submitted': '📝',
      'leave-approved': '👍',
      'leave-rejected': '👎',
      'payment-approved': '💰',
      'withdrawal-request': '💳',
      'withdrawal-approved': '✅',
      'withdrawal-rejected': '❌',
      'withdrawal-processed': '💰',
      'report-uploaded': '📊',
      'system-alert': '⚠️'
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type) => {
    const colors = {
      'duty-assigned': 'blue',
      'attendance-marked': 'green',
      'attendance-verified': 'cyan',
      'leave-request-submitted': 'orange',
      'leave-approved': 'green',
      'leave-rejected': 'red',
      'payment-approved': 'gold',
      'withdrawal-request': 'purple',
      'withdrawal-approved': 'green',
      'withdrawal-rejected': 'red',
      'withdrawal-processed': 'green',
      'report-uploaded': 'blue',
      'system-alert': 'red'
    };
    return colors[type] || 'default';
  };

  const notificationItems = (
    <div style={{ 
      width: 400, 
      maxHeight: 500, 
      overflowY: 'auto', 
      overflowX: 'hidden',
      backgroundColor: '#fff',
      boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
      borderRadius: '8px'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 1
      }}>
        <Title level={5} style={{ margin: 0 }}>Notifications</Title>
        <Space>
          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <Button 
                type="text" 
                size="small" 
                icon={<CheckOutlined />}
                onClick={handleMarkAllAsRead}
                style={{ color: '#1890ff' }}
              />
            </Tooltip>
          )}
          {notifications.length > 0 && (
            <Tooltip title="Clear all">
              <Button 
                type="text" 
                size="small" 
                danger
                icon={<DeleteOutlined />}
                onClick={handleClearAll}
              />
            </Tooltip>
          )}
          <Tooltip title="Refresh">
            <Button 
              type="text" 
              size="small" 
              icon={<ReloadOutlined />}
              onClick={loadNotifications}
              loading={loading}
            />
          </Tooltip>
        </Space>
      </div>
      
      {loading && notifications.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <Spin />
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ padding: '40px 0' }}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No notifications" />
        </div>
      ) : (
        <List
          itemLayout="vertical"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              style={{ 
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
                background: item.read ? '#fff' : '#f6ffed',
                cursor: 'pointer',
                transition: 'background 0.3s'
              }}
              onClick={() => !item.read && handleMarkAsRead(item._id)}
              className="notification-item"
            >
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                {/* Icon Column */}
                <div style={{ 
                  fontSize: '20px', 
                  marginTop: '2px',
                  minWidth: '24px'
                }}>
                  {getNotificationIcon(item.type)}
                </div>

                {/* Content Column */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Top Row: Title & Time */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <Text strong style={{ fontSize: '14px', marginRight: '8px' }}>
                      {item.title}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                      {dayjs(item.createdAt).fromNow()}
                    </Text>
                  </div>

                  {/* Message Body */}
                  <div style={{ 
                    color: 'rgba(0, 0, 0, 0.65)', 
                    fontSize: '13px', 
                    marginBottom: '8px',
                    lineHeight: '1.5'
                  }}>
                    {item.message}
                  </div>

                  {/* Bottom Row: Tags & Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <Space size={4} wrap>
                      <Tag 
                        color={getNotificationColor(item.type)} 
                        style={{ margin: 0 }}
                      >
                        {item.type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Tag>
                      {item.priority === 'high' && (
                        <Tag color="red" style={{ margin: 0 }}>Important</Tag>
                      )}
                      {!item.read && (
                        <Tag color="green" style={{ margin: 0 }}>New</Tag>
                      )}
                    </Space>

                    <Space size={2}>
                      {!item.read && (
                        <Tooltip title="Mark as read">
                          <Button 
                            type="text" 
                            size="small" 
                            icon={<EyeOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(item._id);
                            }}
                          />
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <Button 
                          type="text" 
                          size="small" 
                          danger 
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(item._id);
                          }}
                        />
                      </Tooltip>
                    </Space>
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
      
      {notifications.length > 0 && (
        <div style={{ 
          padding: '8px 16px', 
          textAlign: 'center', 
          borderTop: '1px solid #f0f0f0',
          background: '#fafafa'
        }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {unreadCount} unread • {notifications.length} total
          </Text>
        </div>
      )}
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => notificationItems}
      trigger={['click']}
      open={visible}
      onOpenChange={setVisible}
      placement="bottomRight"
      arrow
    >
      <Badge 
        count={unreadCount} 
        offset={[-5, 5]}
        style={{ cursor: 'pointer' }}
        size="small"
      >
        <div
          style={{ 
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <BellOutlined style={{ fontSize: 18 }} />
        </div>
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;