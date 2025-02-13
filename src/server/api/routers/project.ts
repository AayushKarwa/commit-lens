import { optional, z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { pollCommit } from "~/lib/github";
import { indexGithubRepo } from "~/lib/github-loader";

export const projectRouter = createTRPCRouter({
    createProject: protectedProcedure.input(
       z.object({
        name: z.string(),
        githubUrl: z.string(),
        githubToken: z.string().optional()
       }) 
    ).mutation(async({ctx,input})=>{
        const project =  await ctx.db.project.create({
            data:{
                githubUrl: input.githubUrl,
                name: input.name,
                userToProjects: {
                    create:{
                        userId: ctx.user.userId!,
                    }
                }
            }
        })   
        await indexGithubRepo(project.id,input.githubUrl,input.githubToken)
        await pollCommit(project.id)
        return project;
    }),

    getAllProjects: protectedProcedure.query(async({ctx})=>{
        return await ctx.db.project.findMany({
            where:{
                userToProjects:{
                    some:{
                        userId: ctx.user.userId!
                    }
                },
                deletedAt: null
            }
        })
    }),

    getCommits: protectedProcedure.input(z.object({
        projectId: z.string()
    })).query(async({ctx,input})=>{
        pollCommit(input.projectId).then().catch(console.error)
        return await ctx.db.commit.findMany({
            where:{
                projectId: input.projectId
            }
        })
    }),
    
    saveAnswer: protectedProcedure.input(
        z.object({
            projectId: z.string(),
            question: z.string(),
            answer: z.string(), 
            filesReferences: z.any(),  
        })
    ).mutation(async ({ ctx, input }) => {
        return await ctx.db.question.create({
            data: {
            answer: input.answer,
            projectId: input.projectId,
            question: input.question,
            fileReferences: input.filesReferences, 
            userId: ctx.user.userId!,
            }
        });
    })
});
