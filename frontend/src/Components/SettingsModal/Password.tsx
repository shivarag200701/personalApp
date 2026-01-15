import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import {useState } from "react";

interface PasswordProps {
    handleBack: (subTab:string|null) => void;
}

export const AddPassword = ({handleBack}:PasswordProps) => {

    const [type,setType] = useState<string>("password")
    const [confirmType,setConfirmType] = useState<string>("password")


  return (
    <div className="bg-background h-full rounded-r-md font-medium ">
        <div className="flex gap-4 text-[16px] font-medium pl-4 py-2 pr-2">
        <button onClick={() => {handleBack(null)}} className="p-2 hover:bg-muted transition-all duration-300 rounded-sm cursor-pointer">
            <ArrowLeft size={20} className="text-muted-foreground"/>
        </button>
        <span className="flex items-center">
        Add Password
        </span>
        </div>
        <div className='h-px bg-border'/>
        <div className="p-4">
        <div className="flex gap-2 flex-col">
        <div className="p-2 flex gap-1 flex-col">
            <span>
                New Password
            </span>
            <div className="relative w-full sm:max-w-96">
            <input type={type} className="border border-border rounded-[4px] text-[12px] font-extralight p-1 px-2 w-full focus:outline-none focus:ring-1 focus:ring-ring transition-all hover:ring-1 hover:ring-ring relative bg-input" />
            <button className="absolute inset-y-0 right-0 flex items-center pr-2"
                onClick={() => type === "password" ? setType("text") : setType("password")}
            >
                { type === "password" ?(<Eye className="w-5 h-5 text-muted-foreground cursor-pointer" />)
                    :(<EyeOff className="w-5 h-5 text-muted-foreground cursor-pointer" />)
                    }
            </button>
            </div>
            
        </div>
        <div className="p-2 flex gap-2 flex-col">
        <span>
            Confirm new Password
            </span>
            <div className="relative w-full sm:max-w-96">
            <input type={confirmType} className="border border-border rounded-[4px] text-[12px] font-extralight p-1 px-2 w-full focus:outline-none focus:ring-1 focus:ring-ring transition-all hover:ring-1 hover:ring-ring relative bg-input" />
            <button 
            onClick={() => confirmType === "password" ? setConfirmType("text") : setConfirmType("password")}
            className="absolute inset-y-0 right-0 flex items-center pr-2">
            { confirmType === "password" ?(<Eye className="w-5 h-5 text-muted-foreground cursor-pointer" />)
                    :(<EyeOff className="w-5 h-5 text-muted-foreground cursor-pointer" />)
                    }
            </button>
            </div>
        </div>
        </div>
        </div>
    </div>
  )
}

export const ChangePassword = ({handleBack}:PasswordProps) => {
    const [type,setType] = useState<string>("password")
    const [confirmType,setConfirmType] = useState<string>("password")
    const [currentPassType,setCurrentPassType] = useState<string>("password")
    const [currentPassword,setCurrentPassword] = useState<string>("")
    const [newPassword,setNewPassword] = useState<string>("")
    const [confirmPassword,setConfirmPassword] = useState<string>("")

    const isInvalid = !currentPassword || !newPassword || !confirmPassword;
    return (
        <div className="bg-background rounded-r-md font-medium flex flex-col">
        <div className="flex gap-4 text-[16px] font-medium pl-4 py-2 pr-2">
        <button onClick={() => {handleBack(null)}} className="p-2 hover:bg-muted transition-all duration-300 rounded-sm cursor-pointer">
            <ArrowLeft size={20} className="text-muted-foreground"/>
        </button>
        <span className="flex items-center">
        Change Password
        </span>
        </div>
        <div className='h-px bg-border'/>
        <div className="p-4 flex flex-col h-full justify-between overflow-hidden ">
        <div className="flex flex-1 min-h-0 flex-col gap-2 overflow-auto">
        <div className="p-2 flex gap-1 flex-col">
            <span>
                Current Password
            </span>
            <div className="relative w-full sm:max-w-96">
            <input type={currentPassType} onChange={(e) => setCurrentPassword(e.target.value)} className="border border-border rounded-[4px] text-[12px] font-extralight p-1 px-2 w-full focus:outline-none focus:ring-1 focus:ring-ring transition-all hover:ring-1 hover:ring-ring relative bg-input" />
            <button className="absolute top-1.5 right-0 flex items-center pr-2"
                onClick={() => currentPassType === "password" ? setCurrentPassType("text") : setCurrentPassType("password")}
            >
                { currentPassType === "password" ?(<Eye className="w-5 h-5 text-muted-foreground cursor-pointer" />)
                    :(<EyeOff className="w-5 h-5 text-muted-foreground cursor-pointer" />)
                    }
            </button>
            <div className="mt-2">
            <a href="" className="underline text-accent font-extralight text-[13px]">Forgot password?</a>
            </div>
            </div>
            
        </div>
        <div className="p-2 flex gap-1 flex-col">
            <span>
                New Password
            </span>
            <div className="relative w-full sm:max-w-96">
            <input type={type} onChange={(e) => setNewPassword(e.target.value)} className="border border-border rounded-[4px] text-[12px] font-extralight p-1 px-2 w-full focus:outline-none focus:ring-1 focus:ring-ring transition-all hover:ring-1 hover:ring-ring relative bg-input" />
            <button className="absolute inset-y-0 right-0 flex items-center pr-2"
                onClick={() => type === "password" ? setType("text") : setType("password")}
            >
                { type === "password" ?(<Eye className="w-5 h-5 text-muted-foreground cursor-pointer" />)
                    :(<EyeOff className="w-5 h-5 text-muted-foreground cursor-pointer" />)
                    }
            </button>
            </div>
            
        </div>
        <div className="p-2 flex gap-2 flex-col">
        <span>
            Confirm new Password
            </span>
            <div className="relative w-full sm:max-w-96">
            <input type={confirmType} onChange={(e) => setConfirmPassword(e.target.value)} className="border border-border rounded-[4px] text-[12px] font-extralight p-1 px-2 w-full focus:outline-none focus:ring-1 focus:ring-ring transition-all hover:ring-1 hover:ring-ring relative bg-input" />
            <button 
            onClick={() => confirmType === "password" ? setConfirmType("text") : setConfirmType("password")}
            className="absolute inset-y-0 right-0 flex items-center pr-2">
            { confirmType === "password" ?(<Eye className="w-5 h-5 text-muted-foreground cursor-pointer" />)
                    :(<EyeOff className="w-5 h-5 text-muted-foreground cursor-pointer" />)
                    }
            </button>
            </div>
        </div>
        </div>
        <div className="h-px bg-border"/>
        <div className="flex justify-end pt-4 ">
            <div className="flex gap-2 items-center">
                <div>
                    <button className="px-3 py-1 bg-secondary rounded-[4px] font-light text-[14px]">
                        Cancel
                    </button>
                </div>
                <div className="">
                <button 
                disabled={isInvalid}
                className="px-3 py-1 bg-accent rounded-[4px] text-accent-foreground font-light text-[14px] disabled:opacity-50 disabled:cursor-not-allowed">
                        Change Password
                    </button>
                </div>
            </div>
        </div>
        </div>
    </div>
    )
}
