'use client'

import { FolderPlusIcon, FolderSyncIcon, FolderTreeIcon, MoreHorizontal } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components'
import { useGetProjectsByIdQuery } from '@/hooks'
import { useRouter } from 'next/navigation'

export const NavProjects = () => {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const { data: projectsById, isFetching: isFetchingGetProjectsById } = useGetProjectsByIdQuery()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>
            {!isFetchingGetProjectsById ? (
              <>
                <FolderTreeIcon />
                <span>{projectsById?.name}</span>
              </>
            ) : (
              <TitleLoader />
            )}
          </SidebarMenuButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction showOnHover>
                <MoreHorizontal />
              </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" side={isMobile ? 'bottom' : 'right'} align={isMobile ? 'end' : 'start'}>
              <DropdownMenuItem
                onClick={() => {
                  router.push('/projects/list')
                }}
              >
                <FolderSyncIcon className="text-muted-foreground" />
                <span>Change Project</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  router.push('/projects/create')
                }}
              >
                <FolderPlusIcon className="text-muted-foreground" />
                <span>Create Project</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}

const TitleLoader = () => {
  return (
    <div className="w-28 animate-pulse">
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 h-2 rounded bg-slate-200" />
        </div>
        <div className="h-2 rounded bg-slate-200" />
      </div>
    </div>
  )
}