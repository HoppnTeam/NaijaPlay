import React from 'react';
import { LucideProps } from 'lucide-react';

export const NairaSign = React.forwardRef<SVGSVGElement, LucideProps>(
  ({ color = 'currentColor', size = 24, strokeWidth = 2, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 8h16" />
      <path d="M4 16h16" />
      <path d="M6 4v16" />
      <path d="M18 4v16" />
      <path d="M15 4l-6 16" />
    </svg>
  )
);

NairaSign.displayName = 'NairaSign';

export default NairaSign; 