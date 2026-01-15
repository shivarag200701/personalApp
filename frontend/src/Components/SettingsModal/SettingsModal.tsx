import { X } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings,Bell,CircleUserRound } from 'lucide-react';
import AccountSettings from './AccountSettings';
import GeneralSettings from './GeneralSettings';
import NotificationsSettings  from './NotificationsSettings';
import {AddPassword,ChangePassword} from './Password';
import {useQuery} from '@tanstack/react-query'
import api from '@/utils/api';
import { useState } from 'react';



interface SettingModalProps {
    setShowSettingsModal: (show: boolean) => void
}

export const SettingsModal = ({setShowSettingsModal}: SettingModalProps) => {

    const navigate = useNavigate();
    const location = useLocation();
    const [hasChanged,setHasChanged] = useState<boolean>(false)
    const [modalOpen,setModalOpen] = useState<boolean>(false)

    const segments = location.hash?.replace("#settings/","").split("/")

    const currentTab = segments[0] || "account";
    const currentSubTab = segments[1] || "";
    console.log(currentTab);
    console.log(currentSubTab);


    const tabs = [
        {
            id: "account",
            label: "Account",
            icon: <CircleUserRound className='w-5 h-5' />,
        },
        {
            id: "general",
            label: "General",
            icon: <Settings className='w-5 h-5' />,
        },
        {
            id: "notifications",
            label: "Notifications",
            icon: <Bell className='w-5 h-5' />,
        },
    ]
    

    const handleTabChange = (tabId: string|null) => {
        navigate(`#settings/${tabId}`);
    }
    const handleSubTabChange = (subTabId:string|null) => {
        if (subTabId === null){
            navigate(`#settings/${currentTab}`)
        }
        else{
        navigate(`#settings/${currentTab}/${subTabId}`)
        }
    }
    

    const {data:user} = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const res = await api.get("/v1/user/profile");
            return res.data.user
        }
    })
    console.log("user",user.isPasswordSet);
    
    
  return (
    <>
    <div className='fixed inset-0 z-40 bg-black/30' onClick={() => setShowSettingsModal(false)}/>
    <div className='fixed left-1/2 top-1/2 z-50 bg-sidebar text-foreground rounded-md shadow-md border border-border max-w-5xl w-full h-[90vh] max-h-[90vh] overflow-hidden'
    style={{
        transform: 'translate(-50%, -50%)',
    }}
    >
        <div className="grid grid-cols-[230px_auto] items-stretch h-full relative">
            <div className="h-full py-2 px-3 self-stretch">
                <span className='text-[16px] font-medium'>
                Settings
                </span>
                <div className='flex flex-col gap-1 mt-10'>
                    {tabs.map((tab) => (
                        <button
                        key={tab.id}
                        className={`w-full text-[14px] p-2 rounded-[4px] cursor-pointer
                            transition-all
                            ${tab.id ===
                            currentTab ? "bg-accent/15 border-l-2 border-accent text-accent" : "hover:bg-hover"} `}
                            onClick={() => {
                                setModalOpen(hasChanged)
                                if(!hasChanged){
                                handleTabChange(tab.id)
                                    
                                }
                            }}
                        >
                            <div className='flex justify-start items-center gap-2'>
                            {tab.icon}
                            {tab.label}
                            </div>
                        </button>
                    ))}

                </div>
            </div>
            {currentTab === "account" && !currentSubTab && <AccountSettings handleChange={handleSubTabChange} hasChanged={hasChanged} setHasChanged={setHasChanged} />}
            {currentTab === "general" && <GeneralSettings />}
            {currentTab === "notifications" && <NotificationsSettings />}
            {currentTab === "account" && currentSubTab === "password" && !user.isPasswordSet && <AddPassword handleBack={handleSubTabChange} />}
            {currentTab === "account" && currentSubTab === "password" && user.isPasswordSet && <ChangePassword  handleBack={handleSubTabChange}/>}

            
            <button className='absolute top-3 right-3 cursor-pointer z-10'
            onClick={() => {setShowSettingsModal(false); navigate("/dashboard")}}
            >
                <X className='w-5 h-5 text-muted-foreground' />
            </button>

        </div>
    </div>  
    {modalOpen && (
        <div>
        <div className='z-50 inset-0 fixed bg-black/30' onClick={()=>setModalOpen(false)}/>
        <div className='z-60 w-[375px] sm:w-[450px] h-content rounded-md p-4 fixed left-1/2 top-1/4  bg-task'
        style={{
            transform: 'translate(-50%, -50%)',
        }}
        >
            <div className='flex flex-col gap-2'>
                <span className='text-foreground text-[16px] font-medium'>Discard unsaved changes?</span>
                <span className='text-foreground font-light mb-6'>Your unsaved changes will be discarded.</span>
                <div className='flex justify-end gap-2'>
                    <button className='px-3 py-1.5 bg-button-subtle text-button-text rounded-sm max-w-30 text-[13px] font-medium hover:bg-button-subtle-hover cursor-pointer'
                    onClick={() => {setModalOpen(false)}}
                    >
                        Cancel
                    </button>
                    <button className=' text-[13px] px-3 py-1.5 bg-red-500 font-medium rounded-sm text-white cursor-pointer hover:bg-red-400'>
                        Discard
                    </button>
                </div>
            </div> 
        </div>
        </div>
    )}    
    </>
  )
}
