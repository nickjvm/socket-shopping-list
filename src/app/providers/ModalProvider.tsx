import React, { createContext, useContext, ReactNode } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { FaTimes } from "react-icons/fa";
import cn from "@/utils/cn";

type ModalOptions = {
  dismissable?: boolean;
};

interface ModalContextType {
  closeModal: () => void;
  openModal: (title: string, content: ReactNode, opts?: ModalOptions) => void;
  title?: string;
  content?: ReactNode;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface GlobalModalProps {
  title?: string;
}

export function GlobalModal({
  children,
}: React.PropsWithChildren<GlobalModalProps>) {
  const [open, setOpen] = React.useState<boolean>(false);
  const [modal, setModal] = React.useState<{
    title?: string;
    content?: ReactNode;
    dismissable?: boolean;
  }>({});
  const dismissable = modal.dismissable ?? true;
  const closeModal = () => {
    setOpen(false);
  };
  const openModal = (
    title: string,
    content: ReactNode,
    opts?: ModalOptions
  ) => {
    setModal({ title, content, ...opts });
    setOpen(true);
  };
  return (
    <ModalContext.Provider
      value={{ closeModal, openModal, dismissable, ...modal }}
    >
      {children}
      <Dialog
        open={open}
        onClose={dismissable ? closeModal : () => {}}
        className="relative z-30"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-xl transition-all">
              <div className="flex justify-between items-center space-x-3 mb-4">
                <DialogTitle className="text-lg font-bold" as="div">
                  <GlobalModal.Title />
                </DialogTitle>
                {dismissable && (
                  <button onClick={closeModal} className="cursor-pointer">
                    <FaTimes className="w-4 h-4" />
                  </button>
                )}
              </div>
              <GlobalModal.Content />
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </ModalContext.Provider>
  );
}

type TitleProps = React.HTMLAttributes<HTMLHeadingElement>;

GlobalModal.Title = function Title({ className, ...props }: TitleProps) {
  const { title } = useModal();
  return (
    <h2 {...props} className={cn("text-xl", className)}>
      {title}
    </h2>
  );
};

type ContentProps = React.HTMLAttributes<HTMLDivElement>;

GlobalModal.Content = function Content({ className, ...props }: ContentProps) {
  const { content } = useModal();
  return (
    <div {...props} className={cn("min-h-full", className)}>
      {content}
    </div>
  );
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
GlobalModal.Button = function Button({
  className,
  children,
  onClick,
  ...props
}: React.PropsWithChildren<ButtonProps>) {
  const ctx = useContext(ModalContext);
  return (
    <button
      {...props}
      onClick={onClick || ctx?.closeModal}
      className={cn(
        "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer",
        className
      )}
    >
      {children}
    </button>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalContextProvider");
  }
  return context;
};
