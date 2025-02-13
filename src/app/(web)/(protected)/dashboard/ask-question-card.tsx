'use client'
import Image from 'next/image'
import MDEditor from '@uiw/react-md-editor'
import React, { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Textarea } from '~/components/ui/textarea'
import useProject from '~/hooks/use-project'
import { askQuestion } from './actions'
import { readStreamableValue } from 'ai/rsc'
import CodeRefferences from './code-references'
import { api } from '~/trpc/react'
import { toast } from 'sonner'

const AskQuestionCard = () => {
  const {project} = useProject()
  const [loading,setLoading] = useState(false)
  const [open,setOpen] = useState(false)
  const [question,setQuestion]= useState('')
const [filesReferences, setFilesReferences] = useState<{fileName:string,sourceCode:string,summary:string,similarity:number}[]>([])
  const [answer,setAnswer] = useState('')
  const saveAnswer = api.project.saveAnswer.useMutation()

  const onSubmit = async(e: React.FormEvent<HTMLFormElement>)=>{
    setAnswer('')
    setFilesReferences([])
    e.preventDefault()
    if(!project?.id) return
    setLoading(true)
    
   
    const {output,filesRefferences: filesReferences} = await askQuestion(question,project.id)
    setOpen(true)
    setFilesReferences(filesReferences)

    for await (const delta of readStreamableValue(output)){
        if(delta){
            setAnswer(ans => ans + delta)
        }
    }
    setLoading(false)
    
  }
  return(
    <> 
    <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent className='sm:max-w-[80vw]'>
    <DialogHeader>
        <div className='flex items-center gap-2'>
        <DialogTitle>
           <Image src='/logo.png' alt='commitLens' width={40} height={70}/>
        </DialogTitle>
        <Button disabled={saveAnswer.isPending} onClick={()=>{
            {console.log(`files are: ${filesReferences}`)}
            {console.log(`project id is: ${project?.id}`)}
            {console.log(`question is: ${question}`)}
            {console.log(`answer is: ${answer}`)}
            {console.log(`filesReferences are: ${filesReferences[0]}`)}
            saveAnswer.mutate({
                projectId: project?.id!,
                question,
                answer,
                filesReferences: filesReferences,
            },{
                onSuccess:()=>{
                    toast.success('Answer saved')
                },
                onError:()=>{
                    toast.error('Failed to save answer')
                }
            })
        }} variant={'outline'}>
            Save Answer
        </Button>
        </div>  
    </DialogHeader>
    <MDEditor.Markdown source={answer} className='max-w-[70vw] !h-full max-h-[40vh] overflow-scroll'/>
   <div className="h-4"></div>
    <CodeRefferences fileReferences={filesReferences}/>
    <Button onClick={()=> setOpen(false)}>
        close 
    </Button>
    </DialogContent>
    </Dialog>

    <Card className='relative col-span-3'>
        <CardHeader>
            <CardTitle>
                Ask a question
            </CardTitle>
        </CardHeader>
        <CardContent>
            <form onSubmit={onSubmit}>
                <Textarea value={question} onChange={(e)=>setQuestion(e.target.value)} placeholder='which file should i edit to change home page'/>
                <div className='h-4'></div>
                    <Button type='submit' disabled={loading}>
                        Ask CommitLens!
                    </Button>
                
            </form>
        </CardContent>
    </Card>
    </>
  )
}

export default AskQuestionCard