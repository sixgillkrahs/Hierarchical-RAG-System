import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      closeButton
      position="top-center"
      richColors
      toastOptions={{
        classNames: {
          description: "text-sm leading-6",
          title: "text-sm font-semibold",
          toast:
            "rounded-[1.4rem] border border-border/60 bg-background/96 shadow-[0_24px_70px_-36px_rgba(35,27,20,0.45)]",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
