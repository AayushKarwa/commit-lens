'use client'
import React from 'react'
import { Button } from '~/components/ui/button'
import { useForm } from 'react-hook-form'
import { Input } from '~/components/ui/input'


type FormInput = {
    repoUrl: string,
    projectName: string,
    githubToken?: string
}
const CreatePage = () => {
    const {register, handleSubmit, reset} = useForm<FormInput>()
    function onSubmit(data: FormInput){
        window.alert(JSON.stringify(data))
        return true;
    }
  return (
   <div className='flex items-center gap-16 h-full justify-center'>
    <img src='/undraw_github.svg' className='h-56 w-auto'/>
    <div>
        <div>
            <h1 className='font-semibold text-2xl'>Link your Github Repository</h1>
            <p className='text-sm text-muted-foreground'>
                Enter the URl of your repository to link it to CommitLens
            </p>
        </div>
        <div className="h-4"></div>
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Input 
                {...register('projectName',{required: true})}
                placeholder='Project Name'
                required
                />
                <div className="h-4"></div>
                <Input required
                {...register('repoUrl',{required:true})}
                type='url'
                placeholder='Github URL'
                />
                <div className="h-4"></div>
                <Input 
                {...register('githubToken',{required:false})}
                placeholder='Github token (Optional)'
                />
                <div className="h-4"></div>
                <Button type='submit'>
                    Create Project
                </Button>
            </form>
        </div>
    </div>
   </div>
  )
}

export default CreatePage