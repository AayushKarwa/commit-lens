'use client'
import { Bot, CreditCard, LayoutDashboard, Plus, Presentation } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "~/components/ui/sidebar";
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

const projects = [
    {
        name: 'Project 1'
    },
    {
        name: 'Droject 2'
    },
    {
        name: 'Kroject 3'
    },
    {
        name: 'Oroject 4'
    },
    {
        name: 'Uroject 5'
    },
    {
        name: 'Troject 6'
    },
]

export const AppSidebar = () => {
    const pathname = usePathname()
  return (
    <Sidebar collapsible="icon" variant="floating">
        <SidebarHeader>
            Logo
            {/* <div className="flex items-center gap-2">
                <Image src='#' alt='logo' width={40} height={40} / >
            </div> */}
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
                        {projects.map((project)=>(
                            <SidebarMenuItem key={project.name}>
                                <SidebarMenuButton asChild>
                                    <div>
                                        <div className={cn(
                                            'rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary',
                                            {
                                                'bg-primary text-white': true
                                                // 'bg-primary text-white': project.id === project.id
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

                        <SidebarMenuItem>
                            <Link href={'/create'}>
                            <Button variant={"outline"} size={'sm'}>
                                <Plus/>
                                Create Project
                            </Button>
                            </Link>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>
    </Sidebar>
  )
}
