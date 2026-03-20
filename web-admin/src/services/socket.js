import { io } from 'socket.io-client';
import { ElMessage, ElNotification } from 'element-plus';

/**
 * WebSocket服务
 * 处理与后端的实时通讯
 */
class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * 初始化WebSocket连接
   */
  connect() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('WebSocket: 未登录，跳过连接');
      return;
    }

    // 获取API基础URL
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const wsUrl = apiBaseUrl.replace('/api', '');

    this.socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.setupEventHandlers();
  }

  /**
   * 设置事件处理器
   */
  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('WebSocket 已连接');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket 已断开');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket 连接错误:', error);
      this.reconnectAttempts++;
    });

    // 订单事件
    this.socket.on('order:created', (data) => {
      console.log('新订单通知:', data);
      ElNotification({
        title: data.title || '新订单',
        message: data.message || '您有新订单',
        type: 'success',
        duration: 5000,
      });
      // 触发自定义事件，让组件可以响应
      window.dispatchEvent(new CustomEvent('order:created', { detail: data }));
    });

    this.socket.on('order:status', (data) => {
      console.log('订单状态变更:', data);
      ElNotification({
        title: data.title || '订单状态变更',
        message: data.message,
        type: 'info',
        duration: 5000,
      });
      window.dispatchEvent(new CustomEvent('order:status', { detail: data }));
    });

    // 請求書事件
    this.socket.on('invoice:created', (data) => {
      console.log('請求書通知:', data);
      ElNotification({
        title: data.title || '請求書生成',
        message: data.message,
        type: 'warning',
        duration: 5000,
      });
      window.dispatchEvent(new CustomEvent('invoice:created', { detail: data }));
    });

    this.socket.on('invoice:overdue', (data) => {
      console.log('請求書逾期:', data);
      ElNotification({
        title: data.title || '請求書逾期',
        message: data.message,
        type: 'error',
        duration: 0, // 不自动关闭
      });
      window.dispatchEvent(new CustomEvent('invoice:overdue', { detail: data }));
    });

    // 商品事件
    this.socket.on('product:approved', (data) => {
      console.log('商品审核通过:', data);
      ElNotification({
        title: data.title || '商品审核通过',
        message: data.message,
        type: 'success',
        duration: 5000,
      });
      window.dispatchEvent(new CustomEvent('product:approved', { detail: data }));
    });

    this.socket.on('product:rejected', (data) => {
      console.log('商品审核拒绝:', data);
      ElNotification({
        title: data.title || '商品审核拒绝',
        message: data.message,
        type: 'error',
        duration: 5000,
      });
      window.dispatchEvent(new CustomEvent('product:rejected', { detail: data }));
    });

    // 系统通知
    this.socket.on('system:notification', (data) => {
      console.log('系统通知:', data);
      ElNotification({
        title: data.title,
        message: data.message,
        type: 'info',
        duration: 5000,
      });
      window.dispatchEvent(new CustomEvent('system:notification', { detail: data }));
    });
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * 重新连接
   */
  reconnect() {
    this.disconnect();
    this.connect();
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus() {
    return this.isConnected;
  }
}

// 导出单例
export const socketService = new SocketService();
export default socketService;
