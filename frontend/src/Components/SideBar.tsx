import api from '@/utils/api';
import { ChevronDown, LogOut} from 'lucide-react';
import React, { createContext, useContext,useRef, useState } from 'react'
import { PanelLeft, Settings } from 'lucide-react';
import DropDown from './DropDown'
import { SettingsModal } from './SettingsModal/SettingsModal'
import { useQuery } from '@tanstack/react-query';
import {useNavigate} from 'react-router-dom'
import { Spinner } from './ui/spinner';
import { Tooltip, TooltipTrigger } from './ui/tooltip';
import { TooltipContent } from './ui/tooltip';
import { Kbd } from './ui/kbd';

const SideBarContext = createContext<{expanded: boolean}>({expanded: false});
const SideBar = ({ children ,expanded, setExpanded}: { children: React.ReactNode, expanded: boolean, setExpanded: (expanded: boolean) => void }) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [showDropDown, setShowDropDown] = useState(false);
    const [moreOptionsActive, setMoreOptionsActive] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [isLoggingOut,setIsLoggingOut] = useState(false)
    const navigate = useNavigate()
    const {data:user} = useQuery({
      queryKey: ["users"],
        queryFn: async () => {
            const res = await api.get("/v1/user/profile");
            return res.data.user
        },
        placeholderData: {
          username: 'Guest',
          pictureUrl: '/user.png'
        }
    })

    const handleLogout = async () =>{
      try{
        setIsLoggingOut(true)
        await api.post("/v1/user/logout");
        navigate("/")

      }
      catch(error){
        console.error("error logging out",error)
        setIsLoggingOut(false);
      }
    }

    if(isLoggingOut){
      return (
        <div className="fixed inset-0 z-9999 bg-background flex flex-col items-center justify-center gap-4">
          <img src="/favicon.png" alt="Logo" width={100} height={100} />
          <Spinner />
        </div>
      )
    }
    
  return (
    <aside className={`h-screen transition-all duration-300 ease-in-out ${expanded ? "min-w-70 max-w-70" : "w-0"} 
    z-50 `}
    aria-expanded={expanded}
    aria-hidden={!expanded}
    >
        <nav className={`h-full flex flex-col bg-sidebar shadow-sm
          ${!expanded ? "pointer-events-none":""
          }`}>
        <div className='flex py-4 px-3 justify-between items-center min-w-0'>
          {expanded && (
          <button ref={buttonRef} onClick={() => {
            setShowDropDown(!showDropDown)
            setMoreOptionsActive(!moreOptionsActive)
          }}  className={`flex items-center gap-2 hover:bg-options-hover rounded-sm p-1 cursor-pointer transition-all duration-300 ease-in-out w-auto ${moreOptionsActive ? "bg-options-hover text-foreground" : ""}`}>
          <img
            src={user?.pictureUrl}
            alt="Profile"
            className="rounded-full border-2 border-border object-cover transition-all duration-300 ease-in-out w-7 h-7"
          />    
          <span className="text-xs font-medium text-foreground transition-all text-left   duration-300 ease-in-out w-auto">
            {user?.username.split(" ")[0]}
            </span>
          <ChevronDown className='w-4 h-4 text-muted-foreground' />
          </button>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button className={`p-2 rounded-md hover:bg-hover transition-colors hover:bg-secondary cursor-pointer
              ${expanded ? "relative" : " absolute top-4 left-4 z-50"}
              ${!expanded ? "pointer-events-auto" : ""}
              `}
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? "Close sidebar" : "Open sidebar"}
              >
              <PanelLeft className="text-muted-foreground font-light transition-all duration-300 ease-in-out w-5 h-5" 
              style={{transform: expanded ? "rotate(0deg)" : "rotate(180deg)"}}
              />
              </button>
              </TooltipTrigger>
              <TooltipContent className="pr-1.5">
                <div className="flex items-center gap-2 ">
                  Open/Close Sidebar<Kbd>M</Kbd>
                </div>
              </TooltipContent>
            </Tooltip>
        </div>

        <SideBarContext.Provider value={{expanded}}>
        <ul className='flex-1 px-3'>
            {children}
        </ul>
        </SideBarContext.Provider>
        </nav>
        {showDropDown && <DropDown buttonRef={buttonRef} setShowDropDown={setShowDropDown} setOptionsActive={setMoreOptionsActive} 
        width='w-64' >
              <div className='flex flex-col'>
                <button className='flex justify-start items-center gap-4 hover:bg-hover rounded-[4px]   p-1.5 m-1.5 cursor-pointer hover:bg-options-hover transition-all duration-300 '
                onClick={() => {
                  setShowSettingsModal(true)
                  setShowDropDown(false)
                  setMoreOptionsActive(false)
                  navigate("#settings/account")
                }}
                >
                    <Settings className='w-4.5 h-4.5' strokeWidth={1}
                     />
                    <span className='text-[13px] font-medium'>Settings</span>
                </button>
                <div className='h-px bg-border' />
                  <button className='flex justify-start items-center gap-4 hover:bg-hover rounded-[4px] p-1.5 m-1.5 cursor-pointer hover:bg-options-hover transition-all duration-300 '
                  onClick={handleLogout}
                  >
                    <LogOut className='w-4.5 h-4.5' strokeWidth={1} />
                    <span className='text-[13px] font-medium'>Logout</span>
                  </button>
              </div>
          </DropDown>
          }
          {showSettingsModal && <SettingsModal setShowSettingsModal={setShowSettingsModal} />}
    </aside>
  )
}

export const SideBarItem = ({icon, text,active, onClick}: {icon: React.ReactNode, text: string, active?: boolean, alert?: boolean, onClick?: () => void}) => {
    const {expanded} = useContext(SideBarContext);

    return (
      <>
      {expanded && (
        <li className={`relative flex gap-2 p-2 rounded-sm transition-all duration-300 ease-in-out  cursor-pointer my-1 whitespace-nowrap group
        ${active ? "bg-accent/15 border-l-2 border-accent  text-accent" : "hover:bg-accent/10 transition-all duration-300 ease-in-out"}
        ${expanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        ${!expanded ? "invisible":"visible"}
        `}
        onClick={expanded ? onClick : undefined}
        aria-hidden={!expanded}
        >
          <div className={`w-6 h-6 transition-all duration-300 ease-in-out`}>
            {icon}
          </div>

          <span className={`transition-all duration-300 ease-in-out overflow-hidden w-32 opacity-100`}>
            {text}
          </span>
            {expanded && (
      <div className='absolute left-full rounded-sm px-2 py-1 bg-tool-tip text-white invisible opacity-20 -translate-x-3 box-shadow-xl font-extralight ml-1   transition-all duration-300 ease-in-out  group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 z-50'>
        {text}
      </div>
      )}
        </li>
      )}
      </>
    )
}

export default SideBar