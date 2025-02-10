import {Octokit} from 'octokit'
import { db } from '~/server/db'

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
})

type Response = {
    commitHash:string,
    commitMessage:string,
    commitAuthorName:string,
    commitAuthorAvatar:string,
    commitDate: string
}



export const getCommitHash = async(githubUrl: string): Promise<Response[]> => {
    
    const [owner,repo] = githubUrl.split('/').slice(-2)
    if(!owner || !repo){
        throw new Error('Invalid github url')
    }
    const {data} = await octokit.rest.repos.listCommits({
        owner: owner,
        repo: repo
    })
    const sortedCommits = data.sort((a:any,b:any)=> new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime())

    return sortedCommits.slice(0,10).map((commit:any)=>({
        commitHash: commit.sha as string,
        commitMessage: commit.commit.message ?? "",
        commitAuthorName: commit.commit?.author?.name ?? "",
        commitAuthorAvatar: commit.author?.avatar_url ?? "",
        commitDate: commit.commit?.author?.date

    }))
}

export const pollCommit = async(projectId: string) => {
    const {project,githubUrl} = await fetchProjectsGithubUrl(projectId)
    console.log(`project: ${project}, githubUrl: ${githubUrl}`)
    const commitHashes = await getCommitHash(githubUrl)
    const unprocessedCommits = await filterUnprocessedCommits(projectId,commitHashes)
    console.log(unprocessedCommits)
    return unprocessedCommits
}

async function fetchProjectsGithubUrl(projectId: string){
    const project = await db.project.findUnique({
        where:{
            id: projectId
        },
        select:{
            githubUrl: true
        }
    })
    if(!project?.githubUrl){
        throw new Error('Project does not have a github url')
    }
    return {project : project , githubUrl: project?.githubUrl} 
}

async function filterUnprocessedCommits(projectId:string,commitHashes:Response[]){
    const processedCommits = await db.commit.findMany({
        where:{
            projectId: projectId
        }
    })

    const unprocessedCommits = commitHashes.filter((commit)=> !processedCommits.some((processedCommit)=> processedCommit.commitHash === commit.commitHash))
    return unprocessedCommits;
}

