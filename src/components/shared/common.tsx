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
        no-underline border-none transition-opacity hover:opacity-90`,
        className
      )}
      type = "button"
      onClick={onClick}
    >
      {iconElement}
      <span className={cn("text-lg",textClassName)}>
        {text}
      </span>
    </button>
  );
};


export {ChangeViewButton, ChangeViewButtonProps}