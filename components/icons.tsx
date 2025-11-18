import React from 'react';

const SVGIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    {props.children}
  </svg>
);

export const HomeIcon = () => (
  <SVGIcon className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </SVGIcon>
);

export const BuildingIcon = () => (
  <SVGIcon className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 11.25h6M9 15.75h6M9 20.25h6" />
  </SVGIcon>
);

export const UsersIcon = () => (
  <SVGIcon className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 3.375c-3.148 0-5.875 2.194-5.875 5.25c0 2.292 1.562 4.243 3.75 4.98.663.248 1.054.812 1.054 1.486v.45c0 .414.336.75.75.75h2.25a.75.75 0 00.75-.75v-.45c0-.673.39-1.238 1.054-1.486c2.188-.736 3.75-2.687 3.75-4.98c0-3.056-2.727-5.25-5.875-5.25z" />
  </SVGIcon>
);

export const PackageIcon = () => (
  <SVGIcon className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </SVGIcon>
);

export const CarIcon = () => (
  <SVGIcon className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5h10.5a1.125 1.125 0 001.125-1.125V6.75a1.125 1.125 0 00-1.125-1.125H4.5A1.125 1.125 0 003.375 6.75v10.875c0 .621.504 1.125 1.125 1.125zM16.5 18.75h-2.25m0-12h3.75a.75.75 0 01.75.75v3.75a.75.75 0 01-.75.75h-3.75a.75.75 0 01-.75-.75V7.5a.75.75 0 01.75-.75z" />
  </SVGIcon>
);

export const PlusCircleIcon = () => (
    <SVGIcon className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </SVGIcon>
);

export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SVGIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </SVGIcon>
);

export const ArrowRightLeftIcon = () => (
  <SVGIcon className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </SVGIcon>
);

export const ArrowLeftOnRectangleIcon = () => (
  <SVGIcon className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-3 0l-3-3m0 0l3-3m-3 3h12" />
  </SVGIcon>
);

export const PencilIcon = () => (
    <SVGIcon className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 19.07a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </SVGIcon>
);

export const PrinterIcon = () => (
  <SVGIcon className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12h10.5m-10.5 3h10.5m-10.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-15c-.621 0-1.125-.504-1.125-1.125v-9.75c0-.621.504-1.125 1.125-1.125H6.75zM6 12l1.5-1.5m0 0l1.5 1.5m-1.5-1.5V3.75c0-.621.504-1.125 1.125-1.125h6.75c.621 0 1.125.504 1.125 1.125v6.75m-1.5-1.5l1.5 1.5m0 0l-1.5 1.5m1.5-1.5V12" />
  </SVGIcon>
);

export const ArchiveBoxArrowDownIcon = () => (
  <SVGIcon className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </SVGIcon>
);

export const ArrowRightCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SVGIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </SVGIcon>
);

export const ArrowLeftCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SVGIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </SVGIcon>
);