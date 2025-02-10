'use client'
import { useUser } from '@clerk/nextjs'
import React from 'react'
import useProject from '~/hooks/use-project'

const DashboardPage = () => {
    const {project} = useProject()
    if(!project) return
  return (
    <div>Dashboard Page: {project.name}</div>
  )
}

export default DashboardPage