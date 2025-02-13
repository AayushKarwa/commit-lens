'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet';
import useProject from '~/hooks/use-project';
import { api } from '~/trpc/react';
import AskQuestionCard from '../dashboard/ask-question-card';
import MDEditor from '@uiw/react-md-editor';
import CodeRefferences from '../dashboard/code-references';

function Qa() {
    const { projectId } = useProject();
    if (!projectId) return null;
    const { data: questions, isLoading } = api.project.getQuestions.useQuery({ projectId });
    const [questionIndex, setQuestionIndex] = React.useState(0);
    const question = questions?.[questionIndex];

    return (
        <Sheet>
            <AskQuestionCard />
            <div className="h-4"></div>
            <h1 className='text-xl font-semibold'>Saved Questions</h1>
            <div className="h-3"></div>
            <div className='flex flex-col gap-2'>
                {isLoading
                    ? Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className='flex items-center gap-4 bg-white p-4 shadow border rounded-lg'>
                            <Skeleton circle width={30} height={30} />
                            <div className='text-left flex flex-col w-full'>
                                <Skeleton width="60%" height={20} />
                                <Skeleton width="80%" height={15} />
                            </div>
                        </div>
                    ))
                    : questions?.map((question, index) => (
                        <React.Fragment key={question.id}>
                            <SheetTrigger onClick={() => setQuestionIndex(index)}>
                                <div className='flex items-center gap-4 bg-white p-4 shadow border rounded-lg'>
                                    <img className='rounded-full' height={30} width={30} src={question.user.imageUrl ?? ''} />
                                    <div className='text-left flex flex-col'>
                                        <div className='flex items-center gap-2'>
                                            <p className='text-gray-700 line-clamp-1 text-lg font-medium'>
                                                {question.question}
                                            </p>
                                            <span className='text-xs text-gray-400 whitespace-nowrap'>
                                                {question.createdAt.toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className='text-gray-700 line-clamp-1 text-sm'>
                                            {question.answer}
                                        </p>
                                    </div>
                                </div>
                            </SheetTrigger>
                        </React.Fragment>
                    ))}
            </div>
            {question && (
                <SheetContent className='sm:max-w-[80vw]'>
                    <SheetHeader>
                        <SheetTitle>{question.question}</SheetTitle>
                        <MDEditor.Markdown source={question.answer} />
                        <CodeRefferences fileReferences={(question.fileReferences ?? []) as any} />
                    </SheetHeader>
                </SheetContent>
            )}
        </Sheet>
    );
}

export default Qa;