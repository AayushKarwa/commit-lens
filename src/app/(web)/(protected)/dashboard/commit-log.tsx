'use client'

import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import useProject from '~/hooks/use-project'
import { cn } from '~/lib/utils'
import { api } from '~/trpc/react'

const CommitLog = () => {
    const { projectId, project } = useProject();
    if (!projectId) return <div>Loading...</div>;

    const { data: commits } = api.project.getCommits.useQuery({ projectId });

    return (
        <ul className="space-y-6 pl-6 relative"> 
            {commits?.map((commit, index) => (
                <li key={commit.id} className="relative flex items-start gap-4">
                    {/* Left Timeline + Avatar */}
                    <div className="relative flex flex-col items-center">
                        {/* Vertical Line */}
                        {index !== commits.length - 1 && (
                            <div className="absolute top-10 left-1/2 w-px h-full bg-gray-300"></div>
                        )}
                        {/* Commit Avatar */}
                        <img 
                            src={commit.commitAuthorAvatar} 
                            alt="Commit Author Avatar" 
                            className="size-10 rounded-full border border-gray-300 object-cover"
                        />
                    </div>

                    {/* Commit Details */}
                    <div className="flex-auto rounded-lg bg-white p-4 shadow-md ring-1 ring-gray-200 w-full">
                        <div className="flex justify-between items-center">
                            <Link 
                                target="_blank" 
                                href={`${project?.githubUrl}/commit/${commit.commitHash}`} 
                                className="text-xs text-gray-500"
                            >
                                <span className="font-medium text-gray-900">
                                    {commit.commitAuthorName}
                                </span>{" "}
                                <span className="inline-flex items-center">
                                    committed
                                    <ExternalLink className="ml-1 size-4"/>
                                </span>
                            </Link>
                        </div>

                        {/* Commit Message & Summary */}
                        <div className="mt-2">
                            <span className="font-semibold">{commit.commitMessage}</span>
                            <pre className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-500">
                                {commit.summary}
                            </pre>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default CommitLog;
