import api from '@/utils/api';
import { LogOut} from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

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
        <div className='flex flex-col py-4 px-3 gap-2 min-w-0'>
          <div className='flex justify-between items-center'>
            {expanded && (
              <>
                <span className="text-xs font-semibold text-muted-foreground px-2">MENU</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className="p-1.5 rounded-md hover:bg-secondary transition-colors cursor-pointer"
                      onClick={() => setExpanded(false)}
                      aria-label="Close sidebar"
                    >
                      <PanelLeft className="text-muted-foreground font-light w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="pr-1.5">
                    <div className="flex items-center gap-2">
                      Close Sidebar<Kbd>M</Kbd>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
          {expanded && (
          <button ref={buttonRef} onClick={() => {
            setShowDropDown(!showDropDown)
            setMoreOptionsActive(!moreOptionsActive)
          }}  className={`flex items-center gap-2 hover:bg-options-hover rounded-md p-3 w-full cursor-pointer transition-all duration-300 ease-in-out border border-border bg-options-hover/30`}>
          <div className='relative'>
            <Avatar>
              <AvatarImage
                src={user?.pictureUrl}
                alt="@profile"
                className='grayscale'
              />
              <AvatarFallback>{user?.username.slice(0,2)}</AvatarFallback>
            </Avatar>
            <div className='absolute flex items-center justify-center -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-white '>
              <div className='bg-emerald-500 h-2.5 w-2.5 rounded-full '/>
            </div>
          </div>
          <div className='flex flex-col leading-4'>
            <span className="text-md font-semibold text-foreground transition-all text-left duration-300 ease-in-out w-auto">
              {user?.username}
            </span>
            <span className='text-[10px] text-left text-slate-500 font-medium'>Basic Plan</span>
          </div> 
          </button>
          )}
          {!expanded && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded-md hover:bg-hover transition-colors hover:bg-secondary cursor-pointer absolute top-3 left-3 z-50 pointer-events-auto"
                onClick={() => setExpanded(!expanded)}
                aria-label="Open sidebar"
                >
                <PanelLeft className="text-muted-foreground font-light transition-all duration-300 ease-in-out w-4 h-4" 
                style={{transform: "rotate(180deg)"}}
                />
                </button>
              </TooltipTrigger>
              <TooltipContent className="pr-1.5">
                <div className="flex items-center gap-2 ">
                  Open/Close Sidebar<Kbd>M</Kbd>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <SideBarContext.Provider value={{expanded}}>
        <ul className='flex-1 px-3'>
            {children}
        </ul>
        </SideBarContext.Provider>
        
        {expanded && (
          <div className='px-3 pb-4 border-t border-border pt-3'>
            <button 
              className="p-2 rounded-md hover:bg-secondary transition-colors cursor-pointer w-full flex items-center gap-2"
              onClick={() => {
                setShowSettingsModal(true)
                navigate("#settings/account")
              }}
              aria-label="Settings"
            >
              <Settings className="text-muted-foreground font-light w-5 h-5" strokeWidth={1.5} />
              <span className="text-sm text-muted-foreground">Settings</span>
            </button>
          </div>
        )}
        </nav>
        {showDropDown && <DropDown buttonRef={buttonRef} setShowDropDown={setShowDropDown} setOptionsActive={setMoreOptionsActive} 
        width='w-64' >
              <div className='flex flex-col'>
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