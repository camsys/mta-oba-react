import React, {useContext} from 'react';

interface LinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  noUnderline?: boolean;
}

const Link = ({ href, className = "", children, onClick = null, noUnderline = false }: LinkProps & { noUnderline?: boolean }) => {
  return (
    <a 
      href={href} 
      className={`${className} no-underline block`} 
      onClick={onClick}
    >
      {children}
    </a>
  );
}

const InternalLink = ({ className = "", children, redirectFunction, noUnderline = false }: any) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (redirectFunction) redirectFunction(e);
  };

  return (
    <Link href="#" className={`${className} no-underline`} onClick={handleClick} noUnderline={noUnderline}>
      {children}
    </Link>
  );
};

const ChangeViewButton = ({ 
  text, 
  color,
  className = "w-full", 
  textClassName = "text-white",
  iconElement 
}: { 
  text: string, 
  color?: string, 
  className?: string,
  textClassName?: string, 
  iconElement?: React.ReactNode 
}) => {
  return (
    <button 
      {...(color ? { style: { backgroundColor: color } } : {})}
      className={`
        ${className}
        px-[20px] py-[10px]
        flex items-center justify-start gap-2 rounded-lg 
        font-bold no-underline border-none
        transition-opacity hover:opacity-90 no-underline
      `}
    >
      {iconElement && (<svg className='my-[4px]' width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">{iconElement}</svg>
    )}
      <span className={`${textClassName} my-[4px] text-xl leading-[20px] truncate no-underline`}>
        {text}
      </span>
    </button>
  );
};

      {/* {iconElement && (
        <svg 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          className="h-5 w-5 shrink-0"
        >
          {iconElement}
        </svg>
      )} */}



export {ChangeViewButton,Link,InternalLink}