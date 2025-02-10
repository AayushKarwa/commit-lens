import {Octokit} from 'octokit'
import { db } from '~/server/db'
import axios from 'axios'
import { aiSummarizeCommit } from './ai'

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
    const summaryResponses = await Promise.allSettled(unprocessedCommits.map(async(commit)=>{return summarizeCommit(githubUrl,commit.commitHash)}))
    const summaries = summaryResponses.map((response)=>{
        if(response.status ===  'fulfilled'){
            return response.value as string
        }
        return ""
    })
const commits = await db.commit.createMany({
    data: summaries.map((summary,index)=>{
        console.log(`processing commit ${index}`)
        return {
            projectId: projectId,
            commitHash: unprocessedCommits[index]!.commitHash,
            commitMessage: unprocessedCommits[index]!.commitMessage,
            commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
            commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
            commitDate: unprocessedCommits[index]!.commitDate,
            summary: summary
        }
    })
})

    return commits
}

async function summarizeCommit(githubUrl: string, commitHash: string){
    //get the diff and pass the diff to AI
    const {data }= await axios.get(`${githubUrl}/commit/${commitHash}.diff`,{
        headers:{
            'Accept': 'application/vnd.github.v3.diff'
        }
    })
    return await aiSummarizeCommit(data) || ""
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

