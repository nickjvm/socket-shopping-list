import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { FiPlusSquare } from "react-icons/fi";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { IoIosClose } from "react-icons/io";
import { RxHamburgerMenu } from "react-icons/rx";

import ThemeSwitch from "@/app/components/ThemeSwitch";
import { useListHistory } from "@/app/hooks/useListHistory";
import { useShoppingList } from "@/app/providers/ShoppingList";

import cn from "@/utils/cn";

type LayoutContextType = {
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [navOpen, setNavOpen] = useState<boolean>(false);
  const { history, remove, get: getHistory } = useListHistory();
  const pathname = usePathname();
  const params = useParams();
  const { showCompleted, setShowCompleted } = useShoppingList();

  function toggleNav() {
    setNavOpen((prev) => !prev);
  }

  useEffect(() => {
    getHistory();
  }, [params.list_id]);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  return (
    <LayoutContext.Provider value={{ navOpen, setNavOpen }}>
      <div id="layout" className="flex h-screen relative overflow-hidden">
        <div className="grow">{children}</div>
        <div
          className={cn(
            "max-w-[calc(100vw-60px)] w-3xs bg-slate-100 dark:bg-slate-800 border-l border-l-slate-300 dark:border-l-slate-700 absolute top-0 right-0 bottom-0 translate-x-full transition-transform duration-300 z-20",
            navOpen && "translate-x-0"
          )}
        >
          <button
            onClick={toggleNav}
            className="cursor-pointer mt-4 mr-4 p-2 absolute right-full hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
          >
            <RxHamburgerMenu className="size-4 fill-black/60" />
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
                        className="opacity-0 group-hover:opacity-100 transition-all text-slate-400 cursor-pointer hover:text-slate-800 "
                        onClick={() => remove(list.id)}
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
              <ThemeSwitch />
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="cursor-pointer group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-white dark:hover:bg-slate-600 transition-colors"
              >
                {showCompleted ? <LuEyeOff /> : <LuEye />}
                {showCompleted ? "Hide" : "Show"} Completed
              </button>
            </div>
          </div>
        </div>
        <div
          onClick={() => setNavOpen(false)}
          className={cn(
            " bg-white/80 dark:bg-black/80 fixed inset-0 z-10 pointer-events-none opacity-0 transition-opacity",
            navOpen && "opacity-100 pointer-events-auto"
          )}
        />
      </div>
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};
