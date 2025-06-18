import cn from "@/utils/cn";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { IoIosClose } from "react-icons/io";
import { v4 as uuid } from "uuid";

type Notification = {
  id: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
};

type NotificationsContextType = {
  notifications: Notification[];
  addNotification: (
    message: string,
    type?: Notification["type"],
    timeout?: number
  ) => void;
  removeNotification: (id: string) => void;
};

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
};

export const NotificationsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (
    message: string,
    type: Notification["type"] = "info",
    timeout?: number
  ) => {
    const id = uuid();
    setNotifications((prev) => [...prev, { id, message, type }]);

    if (timeout) {
      setTimeout(() => {
        removeNotification(id);
      }, timeout);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationsContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
      <ul className="fixed bottom-18 left-0 right-0 z-50 p-4 space-y-2 text-center flex flex-col items-center justify-center pointer-events-none">
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className={cn(
              "z-50 pl-4 pr-2 py-2 rounded shadow-md transition-all flex gap-2 items-center text-sm pointer-events-auto",
              notification.type === "info" &&
                "border border-slate-300 bg-slate-100/50 dark:bg-slate-800/50 dark:text-white"
            )}
          >
            <span>{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="cursor-pointer"
            >
              <IoIosClose className="w-5 h-5" />
            </button>
          </li>
        ))}
      </ul>
    </NotificationsContext.Provider>
  );
};
