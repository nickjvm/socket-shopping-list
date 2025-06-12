import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useTheme } from "next-themes";
import { FiMoon, FiPlusSquare, FiSun } from "react-icons/fi";
import { RxHamburgerMenu } from "react-icons/rx";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { useShoppingList } from "../providers";
import Link from "next/link";

export default function SettingsDropdown() {
  const { setTheme, resolvedTheme } = useTheme();
  const { setShowCompleted, showCompleted } = useShoppingList();
  return (
    <div className=" text-right">
      <Menu>
        <MenuButton className="cursor-pointer inline-flex items-center gap-2 rounded-md dark:bg-slate-800 px-3 py-3 text-sm/6 font-semibold dark:text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white dark:data-hover:bg-gray-700 data-hover:bg-gray-100 dark:data-open:bg-gray-700 data-open:bg-gray-200 transition-colors">
          <RxHamburgerMenu className="size-4 fill-black/60" />
        </MenuButton>

        <MenuItems
          transition
          anchor="bottom end"
          className="dark:bg-slate-600 origin-top-right rounded-xl border  border-white/5 bg-black/5 p-1 text-sm/6 dark:text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
        >
          <MenuItem
            as={Link}
            href="/"
            className="cursor-pointer justify-end group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10"
          >
            <FiPlusSquare />
            New List
          </MenuItem>
          <MenuItem>
            <button
              className="cursor-pointer justify-end group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10"
              onClick={() => {
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
              }}
            >
              {resolvedTheme === "dark" && (
                <>
                  <FiSun /> Switch to Light Mode
                </>
              )}
              {resolvedTheme === "light" && (
                <>
                  <FiMoon /> Switch to Dark Mode
                </>
              )}
            </button>
            {/* <button className="justify-end group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
              <BiPencil className="size-4 fill-black/30" />
              Edit
            </button> */}
          </MenuItem>
          <MenuItem>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="cursor-pointer justify-end group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10"
            >
              {showCompleted ? <LuEyeOff /> : <LuEye />}
              {showCompleted ? "Hide" : "Show"} Completed
            </button>
          </MenuItem>
        </MenuItems>
      </Menu>
    </div>
  );
}
