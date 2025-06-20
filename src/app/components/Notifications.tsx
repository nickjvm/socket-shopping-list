"use client";

import { RootState } from "@/store";
import { removeNotification } from "@/store/notificationsSlice";
import cn from "@/utils/cn";
import { IoIosClose } from "react-icons/io";
import { useSelector } from "react-redux";

export default function Notifications() {
  const notifications = useSelector(
    (state: RootState) => state.notifications.messages
  );
  return (
    <ul className="fixed bottom-18 left-0 right-0 z-50 p-4 space-y-2 text-center flex flex-col items-center justify-center pointer-events-none">
      {notifications.map((notification) => (
        <li
          key={notification.id}
          className={cn(
            "z-50 pl-4 pr-2 py-2 rounded shadow-md transition-all flex gap-2 items-center text-sm pointer-events-auto",
            notification.type === "info" &&
              "border border-slate-300 bg-slate-100/50 dark:bg-slate-800/50 dark:text-white",
            notification.type === "error" &&
              "border border-red-300 bg-red-100/50 dark:bg-red-800/50 dark:text-white"
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
  );
}
