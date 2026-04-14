import React, {useContext} from 'react';
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
        no-underline border-none transition-opacity focus:outline focus:outline-1 focus:outline-mta-dark-blue focus:outline-offset-1 focus:ring-1 focus:ring-mta-dark-blue focus:ring-offset-1 focus:ring-offset-[#fff]`,
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



function UnderlineOnFocusElement ({elementType: Element = 'a', children, className, ...props}: {elementType?: keyof JSX.IntrinsicElements, children: string | JSX.Element, className?: string, [key: string]: any}) {
    return (
        <Element className={cn("focus:underline focus:border-none focus:outline-none focus:decoration-white focus:decoration-1", className)} {...props}>
            {children}
        </Element>
    )
}



export {ChangeViewButton, ChangeViewButtonProps, UnderlineOnFocusElement}