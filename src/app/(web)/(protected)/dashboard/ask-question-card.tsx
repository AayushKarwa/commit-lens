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

const AskQuestionCard = () => {
  const {project} = useProject()
  const [loading,setLoading] = useState(false)
  const [open,setOpen] = useState(false)
  const [question,setQuestion]= useState('')
  const [filesRefferences, setFilesRefferences] = useState<{fileName:string,sourceCode:string,summary:string,similarity:number}[]>([])
  const [answer,setAnswer] = useState('')

  const onSubmit = async(e: React.FormEvent<HTMLFormElement>)=>{
    setAnswer('')
    setFilesRefferences([])
    e.preventDefault()
    if(!project?.id) return
    setLoading(true)
    
   
    const {output,filesRefferences} = await askQuestion(question,project.id)
    setOpen(true)
    setFilesRefferences(filesRefferences)

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
        <DialogTitle>
           <Image src='/logo.png' alt='commitLens' width={40} height={70}/>
        </DialogTitle>
    </DialogHeader>
    <MDEditor.Markdown source={answer} className='max-w-[70vw] !h-full max-h-[40vh] overflow-scroll'/>
   <div className="h-4"></div>
    <CodeRefferences fileReferences={filesRefferences}/>
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