import api from '@/utils/api';
import { ChevronDown} from 'lucide-react';
import React, { createContext, useContext, useEffect, useState } from 'react'
import { PanelLeft } from 'lucide-react';

const SideBarContext = createContext<{expanded: boolean}>({expanded: false});
const SideBar = ({ children ,expanded, setExpanded}: { children: React.ReactNode, expanded: boolean, setExpanded: (expanded: boolean) => void }) => {
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [name,setName] = useState<string | null>(null);
    useEffect(() => {
        async function fetchProfile() {
          try {
            const response = await api.get("/v1/user/profile");
            if (response.data.user) {
              setProfilePicture(response.data.user.pictureUrl);
              setName(response.data.user.username);
            }
          } catch (err) {
            console.error("Error fetching profile", err);
          }
        }
        fetchProfile();
      }, []);
      console.log("name", name);
  return (
    <aside className={`h-screen transition-all duration-300 ease-in-out ${expanded ? "w-64" : "w-0"} z-50`}>
        <nav className={`h-full flex flex-col bg-[#101018]/80 shadow-sm`}>
        <div className='flex py-4 px-2 justify-between items-center'>

          <div className={`flex items-center gap-2 hover:bg-white/10 rounded-sm p-2 cursor-pointer transition-all duration-300 ease-in-out  overflow-hidden ${expanded ? "w-full":"w-0"}`}>
          <img
            src={profilePicture || ""}
            alt="Profile"
            className={`rounded-full border-2 border-white/10 object-cover transition-all duration-300 ease-in-out    ${expanded ? "w-7 h-7" : "h-0 w-0"}`}
          />    
          <span className={`text-xs font-medium text-white transition-all duration-300 ease-in-out overflow-hidden ${expanded ? "w-32" : "w-0"}`}>{name}</span>
          <ChevronDown className='w-4 h-4 text-gray-400' />
          </div>
            <button className='p-2 rounded-md hover:bg-white/10 transition-colors'
            onClick={() => setExpanded(!expanded)}
            >
            <PanelLeft className={`text-gray-400 cursor-pointer font-light transition-all duration-300 ease-in-out ${expanded ? "w-5 h-5" : "w-0 h-0"}`} />
            </button>
        </div>
        <SideBarContext.Provider value={{expanded}}>
        <ul className='flex-1 px-3'>
            {children}
        </ul>
        </SideBarContext.Provider>
        </nav>

    </aside>
  )
}

export const SideBarItem = ({icon, text,active, onClick}: {icon: React.ReactNode, text: string, active?: boolean, alert?: boolean, onClick?: () => void}) => {
    const {expanded} = useContext(SideBarContext);

    return (
        <li className={`relative text-white flex gap-2 p-2 rounded-sm transition-all duration-300 ease-in-out  cursor-pointer my-1 whitespace-nowrap group
        ${active ? "bg-purple-500/15 border-l-2 border-purple-400" : "hover:bg-purple-500/10 transition-all duration-300 ease-in-out"}
        ${expanded ? "w-full opacity-100" : "w-0 opacity-0"}
        `}
        onClick={onClick}
        >
          <div className={`${expanded ? "w-6 h-6" : "h-0 w-0"} overflow-hidden transition-all duration-300 ease-in-out`}>
            {icon}
            </div>
            <span className={`transition-all duration-300 ease-in-out overflow-hidden ${expanded ? "w-32" : "w-0"}`}>{text}</span>
            {expanded && (
      <div className='absolute left-full rounded-sm px-2 py-1 bg-purple-500 text-white border border-white/10 invisible opacity-20 -translate-x-3 box-shadow-xl text-sm ml-1   transition-all duration-300 ease-in-out  group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 z-50'>
        {text}
      </div>
      )}
        </li>
    )
}

export default SideBar