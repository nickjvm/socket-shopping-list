"use client";

import { useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

import { RxCross1, RxHamburgerMenu } from "react-icons/rx";
import { TbTrash } from "react-icons/tb";
import { IoIosClose } from "react-icons/io";
import { FiPlusSquare } from "react-icons/fi";
import { LuEye, LuEyeOff, LuListCheck } from "react-icons/lu";

import cn from "@/utils/cn";
import { AppDispatch, RootState } from "@/store";
import { getHistory, remove } from "@/store/historySlice";
import { setSidebarOpen, toggleSidebar } from "@/store/layoutSlice";
import { useShoppingList } from "@/app/providers/ShoppingList";
import { useModal } from "@/app/providers/ModalProvider";

import ThemeSwitch from "./ThemeSwitch";
import RecentlyCompleted from "./RecentlyCompleted";

export default function NavMenu() {
  const pathname = usePathname();
  const { openModal } = useModal();

  const params = useParams();
  const { showCompleted, setShowCompleted, deleteCompletedItems } =
    useShoppingList();
  const sidebarOpen = useSelector(
    (state: RootState) => state.layout.sidebarOpen
  );
  const dispatch = useDispatch<AppDispatch>();
  const history = useSelector((state: RootState) => state.history.history);

  useEffect(() => {
    if (!history.length) {
      dispatch(getHistory());
    }
  }, [params.list_id, dispatch, history.length]);

  useEffect(() => {
    dispatch(setSidebarOpen(false));
  }, [pathname, dispatch]);

  return (
    <>
      <div
        className={cn(
          "max-w-[calc(100vw-60px)] w-3xs bg-slate-100 dark:bg-slate-800 border-l border-l-slate-300 dark:border-l-slate-700 absolute top-0 right-0 bottom-0 translate-x-full transition-transform duration-300 z-20",
          sidebarOpen && "translate-x-0"
        )}
      >
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="cursor-pointer mt-4 mr-4 p-2 absolute right-full hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
        >
          {sidebarOpen ? (
            <RxCross1 className="w-4 h-4" />
          ) : (
            <RxHamburgerMenu className="w-4 h-4" />
          )}
        </button>
        <div className="py-4 h-full flex flex-col">
          {!!history.length && (
            <>
              <div className="px-4">
                <h3 className="text-lg">Recent lists</h3>
              </div>
              <ul className="p-4 overflow-auto">
                {history.map((list) => (
                  <li
                    key={list.id}
                    className="first:-mt-2 last:-mb-2 flex group hover:bg-white dark:hover:bg-slate-600 bg-transparent transition-colors p-2 -mx-2 rounded-md"
                  >
                    <Link
                      className="w-full py-2 -my-2 block"
                      href={`/list/${list.id}`}
                    >
                      {list.name}
                    </Link>
                    <button
                      className="opacity-50 group-hover:opacity-100 transition-all text-slate-400 cursor-pointer hover:text-slate-800 "
                      onClick={() => dispatch(remove(list.id))}
                    >
                      <IoIosClose className="w-6 h-6" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t border-slate-300 dark:border-slate-700 my-3"></div>
            </>
          )}
          <div className="px-2">
            <Link
              href="/"
              className="cursor-pointer group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-white dark:hover:bg-slate-600 transition-colors"
            >
              <FiPlusSquare />
              New List
            </Link>
            <ThemeSwitch
              onClick={() => {
                dispatch(setSidebarOpen(false));
              }}
            />
            {params.list_id && (
              <>
                <button
                  onClick={() => {
                    setShowCompleted(!showCompleted);
                    dispatch(setSidebarOpen(false));
                  }}
                  className="cursor-pointer group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-white dark:hover:bg-slate-600 transition-colors"
                >
                  {showCompleted ? <LuEyeOff /> : <LuEye />}
                  {showCompleted ? "Hide" : "Show"} Completed
                </button>
                <button
                  className="cursor-pointer group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-white dark:hover:bg-slate-600 transition-colors"
                  onClick={() => {
                    dispatch(setSidebarOpen(false));
                    openModal("Recently Completed", <RecentlyCompleted />);
                  }}
                >
                  <LuListCheck /> Recently Completed
                </button>
                <button
                  onClick={() => {
                    deleteCompletedItems();
                    dispatch(setSidebarOpen(false));
                  }}
                  className="cursor-pointer group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-white dark:hover:bg-slate-600 transition-colors"
                >
                  <TbTrash /> Delete Completed
                </button>
              </>
            )}
          </div>
          <div className="mt-auto border-t border-slate-300 dark:border-slate-700 px-2 py-2 -mb-4 dark:bg-slate-700 text-center text-sm">
            Built with ❤️ by{" "}
            <Link
              href="https://github.com/nickjvm/socket-shopping-list"
              className="font-bold hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              @nickjvm
            </Link>
          </div>
        </div>
      </div>
      <div
        onClick={() => dispatch(setSidebarOpen(false))}
        className={cn(
          " bg-white/80 dark:bg-black/80 fixed inset-0 z-10 pointer-events-none opacity-0 transition-opacity",
          sidebarOpen && "opacity-100 pointer-events-auto"
        )}
      />
    </>
  );
}
