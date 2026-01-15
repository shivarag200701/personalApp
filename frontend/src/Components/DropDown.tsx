import { useEffect, useState } from "react";

interface DropDownProps {
    buttonRef: React.RefObject<HTMLButtonElement | null>
    setShowDropDown: (showDropDown: boolean) => void
    children: React.ReactNode,
    setOptionsActive: (optionsActive: boolean) => void
    width?: string
}

const DropDown = ({buttonRef, setShowDropDown, children, setOptionsActive, width}: DropDownProps) => {
    const getInitialPosition = () => {
        if (buttonRef?.current){
            const rect = buttonRef.current.getBoundingClientRect();
            return {
                left: rect.left,
                top: rect.top + rect.height,
            }
        }
        return {left:0 ,top:0}
    }
    const [position, setPosition] = useState(getInitialPosition)

    useEffect(() => {
        if (buttonRef?.current){
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                left: rect.left,
                top: rect.top + rect.height + 5,
            })
        }
    },[buttonRef])
  return (
    <>
    <div className="inset-0 fixed z-40" onClick={() => {
        setShowDropDown(false)
        setOptionsActive(false)
    }} />
    <div className={`bg-card text-foreground absolute  rounded-md shadow-md z-50 border border-border  ${width}`}
    style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
    }}
    >{children}</div>
    </>
  )
}

export default DropDown