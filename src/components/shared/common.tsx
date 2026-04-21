import React, {ComponentPropsWithoutRef, useContext} from 'react';
import {cn} from "../util/coreUtils";


interface ChangeViewButtonProps {
  text?: string | JSX.Element;
  color?: string;
  className?: string;
  textClassName?: string;
  iconClassName?: string;
  iconElement?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

const ChangeViewButton = ({ 
  text, 
  color,
  className, 
  textClassName,
  iconClassName,
  iconElement,
  onClick
}: ChangeViewButtonProps) => {
  return (
    <button 
      {...(color ? { style: { backgroundColor: color } } : {})}
      className={cn(
        `px-4 py-4 text-white flex items-center  w-full
        justify-start gap-2 rounded-sm font-bold 
        no-underline border-none transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-mta-dark-blue focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-mta-dark-blue focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff]`,
        className
      )}
      type = "button"
      onClick={onClick}
    >
      {iconElement}
      <span className={cn("text-lg text-[#ffffff]",textClassName)}>
        {text}
      </span>
    </button>
  );
};


// // has multiple variants rather than accepting color as prop becasue tailwind struggles with dynamic classes
function UnderlineOnFocusElement({ 
    as: Element = 'a', 
    variant = 'mta_yellow', 
    className, 
    children, 
    ...props 
}: Props) {
    const variants = {
        mta_yellow: "focus-visible:decoration-mta-yellow group-focus-visible:decoration-mta-yellow",
        black: "focus-visible:decoration-black group-focus-visible:decoration-black",
        mta_blue: "focus-visible:decoration-mta-blue group-focus-visible:decoration-mta-blue",
        white: "focus-visible:decoration-white group-focus-visible:decoration-white"
    };

    return (
        <Element 
            className={cn(
                "underline-offset-2 focus-visible:underline focus-visible:outline-none focus-visible:decoration-3 group-focus-visible:underline group-focus-visible:decoration-3",
                variants[variant],
                className
            )} 
            {...props}
        >
            {children}
        </Element>
    );
}



// todo: we're aiming to move to Compound Component Pattern for shared components now that we've moved to tailwind
type SlotProps = ComponentPropsWithoutRef<'div'>;

const MainSlot = ({ children, className, ...props }: SlotProps) => (
    <div {...props} className={cn("flex-grow min-w-0", className)}>
        {children}
    </div>
);

const SideSlot = ({ children, className, ...props }: SlotProps) => (
    <div {...props} className={cn("flex-shrink-0 flex items-center", className)}>
        {children}
    </div>
);

function LeftExpandsRoot({ children, className, ...props }: SlotProps) {
    return (
        <div {...props} className={cn("flex items-start gap-2", className)}>
            {children}
        </div>
    );
}


/**
 * Use this component for standard list items or headers where the left 
 * content should take up all available space and the right content 
 * should stay fixed (e.g., Route Name + Alert Icon).
 * * @example
 * <LeftExpands>
 * <LeftExpands.Main>Description</LeftExpands.Main>
 * <LeftExpands.Side>Status</LeftExpands.Side>
 * </LeftExpands>
 */
export const LeftExpands = Object.assign(LeftExpandsRoot, {
    Main: MainSlot,
    Side: SideSlot,
});






export {ChangeViewButton, ChangeViewButtonProps, UnderlineOnFocusElement}