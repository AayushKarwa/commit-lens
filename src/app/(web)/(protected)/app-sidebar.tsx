'use client'
import { Bot, CreditCard, LayoutDashboard, Plus, Presentation } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "~/components/ui/sidebar";
import useProject from "~/hooks/use-project";
import { cn } from "~/lib/utils";

const items = [
    {
        title: "Dashboard",
        url: '/dashboard',
        icon: LayoutDashboard
    },
    {
        title: "Q&A",
        url: '/qa',
        icon: Bot
    },
    {
        title: "Meetings",
        url: '/meetings',
        icon: Presentation
    },
    {
        title: "Billing",
        url: '/billing',
        icon: CreditCard
    },
    
]

// const projects = [
//     {
//         name: 'Project 1'
//     },
//     {
//         name: 'Droject 2'
//     },
//     {
//         name: 'Kroject 3'
//     },
//     {
//         name: 'Oroject 4'
//     },
//     {
//         name: 'Uroject 5'
//     },
//     {
//         name: 'Troject 6'
//     },
// ]

export const AppSidebar = () => {
    const pathname = usePathname()
    const {open} = useSidebar()
    const {projects,projectId,setProjectId }= useProject()
  return (
    <Sidebar collapsible="icon" variant="floating">
        <SidebarHeader>
            <div className="flex items-center gap-2">
                <Image src='/logo.png' alt='logo' width={60} height={60} />
                {open && (
                    <h1 className="mb-3 text-xl font-bold text-primary/80 ">
                CommitLens</h1>
                )}
                </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel>
                    Application
                </SidebarGroupLabel>
                <SidebarGroupContent>
                    {items.map((item)=>(
                         <SidebarMenuItem key={item.title} >
                         <SidebarMenuButton asChild>
                            <Link href={item.url} className={cn({'!bg-primary !text-white': pathname === item.url },
                                'list-none'
                            )} >
                            <item.icon/>
                            <span>{item.title}</span>
                            
                             </Link>
                         </SidebarMenuButton>
                     </SidebarMenuItem>
                    ))}
                </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
                <SidebarGroupLabel>
                    Your Projects
                </SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {projects?.map((project)=>(
                            <SidebarMenuItem key={project.name}>
                                <SidebarMenuButton onClick={()=>{setProjectId(project.id)}} asChild>
                                    <div>
                                        <div className={cn(
                                            'rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary',
                                            {
                                                   'bg-primary text-white': projectId === project.id
                                            }
                                        )}>
                                            {project.name[0]}
                                            
                                        </div>
                                        <span>{project.name}</span>
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                        <div className="h-4"></div>

                        {open && (
                            <SidebarMenuItem>
                            <Link href={'/create'}>
                            <Button variant={"outline"} size={'sm'}>
                                <Plus/>
                                Create Project
                            </Button>
                            </Link>
                        </SidebarMenuItem>
                        )}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>
    </Sidebar>
  )
}
