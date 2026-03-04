import { useUIStore } from '../../store';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const NotificationContainer = () => {
  const { notifications, removeNotification } = useUIStore();

  if (notifications.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border ${getBgColor(
            notification.type
          )} animate-slide-up max-w-sm`}
        >
          {getIcon(notification.type)}
          <p className="flex-1 text-sm text-[#5D3A1A]">{notification.message}</p>
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-[#5D3A1A]/60 hover:text-[#5D3A1A] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
