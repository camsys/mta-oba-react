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
        justify-start gap-2 rounded-lg font-bold 
        no-underline border-none transition-opacity hover:opacity-90`,
        className
      )}
      type = "button"
      onClick={onClick}
    >
      {iconElement && (<svg className={cn('flex-shrink-0 w-[1.85rem] h-[1.6rem]', iconClassName)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">{iconElement}</svg>
    )}
      <span className={cn("text-lg",textClassName)}>
        {text}
      </span>
    </button>
  );
};



const SvgIcon = ({iconElement, className, ariaLabel}: 
  {iconElement: React.ReactNode, className?: string, ariaLabel?: string}) => {
    return (
        <svg 
          className={cn('*:focus:fill-current *:fill-current', className)} 
          viewBox="0 0 24 24"
          aria-label={ariaLabel? ariaLabel : "svg icon"} 
          role="presentation"
          xmlns="http://www.w3.org/2000/svg">
            {iconElement}
        </svg>
    )
}


export {ChangeViewButton, ChangeViewButtonProps}