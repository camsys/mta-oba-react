import React, {useContext} from 'react';

interface ChangeViewButtonProps {
  text: string;
  color?: string;
  className?: string;
  textClassName?: string;
  iconElement?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

const ChangeViewButton = ({ 
  text, 
  color,
  className = "w-full", 
  textClassName = "text-white",
  iconElement,
  onClick
}: ChangeViewButtonProps) => {
  return (
    <button 
      {...(color ? { style: { backgroundColor: color } } : {})}
      className={`
        ${className}
        px-[1rem] py-[.98rem]
        flex items-center justify-start gap-2 rounded-lg 
        font-bold no-underline border-none
        transition-opacity hover:opacity-90 no-underline
      `}
      type = "button"
      onClick={onClick}
    >
      {iconElement && (<svg className='' width="1.85rem" height="1.6rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">{iconElement}</svg>
    )}
      <span className={`${textClassName} py-[.3rem] text-lg leading-[1rem] no-underline truncate ${textClassName}`}>
        {text}
      </span>
    </button>
  );
};



export {ChangeViewButton, ChangeViewButtonProps}