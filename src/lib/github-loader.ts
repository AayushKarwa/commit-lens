import {GithubRepoLoader} from '@langchain/community/document_loaders/web/github'
import { Document } from '@langchain/core/documents'
import { summarizeCode } from './ai'
import { generateEmbedding } from './ai'
import { db } from '~/server/db'

export const loadGithubRepo = async(githubUrl: string, githubToken?: string)=>{
    const loader = new GithubRepoLoader(githubUrl, {
        accessToken: process.env.GITHUB_TOKEN || '',
        branch: 'main',
        ignoreFiles: [
            // 🔹 Dependency lock files
            'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lock',

            // 🔹 Build & Output directories
            'node_modules/', 'dist/', 'build/', 'out/', '.next/', '.turbo/', '.vercel/', '.expo/', 'coverage/', 

            // 🔹 System & Editor files
            '.DS_Store', 'Thumbs.db', '.idea/', '.vscode/', '.editorconfig', '.eslintcache',

            // 🔹 Logs & Temp files
            'npm-debug.log', 'yarn-error.log', 'pnpm-debug.log', 'lerna-debug.log', 'tsconfig.tsbuildinfo', 

            // 🔹 Git & CI/CD files
            '.git/', '.gitignore', '.gitattributes', '.github/', '.gitmodules', '.gitkeep',

            // 🔹 Docker & Deployment configs
            'Dockerfile', '*.Dockerfile', 'docker-compose.yml', '.dockerignore', 

            // 🔹 Environment & Config files
            '.env', '.env.local', '.env.development', '.env.production', '.env.test',
            'vite.config.js', 'vite.config.ts', 'postcss.config.js', 'postcss.config.ts',
            'svelte.config.js', 'tailwind.config.js', 'tailwind.config.ts',

            // 🔹 Public & Static Files
            'public/', 'public/*', 'public/**/*.svg', 'public/**/*.png', 'public/**/*.jpg', 'public/**/*.jpeg',
            'public/**/*.gif', 'public/**/*.ico', 'public/**/*.webp', 'public/**/*.avif',

            // 🔹 Media & Binary Files
            '*.mp4', '*.mov', '*.avi', '*.mkv', '*.webm', '*.mp3', '*.wav', '*.flac',

            // 🔹 Archives & Binaries
            '*.zip', '*.tar', '*.gz', '*.rar', '*.7z', '*.exe', '*.dll', '*.bin', '*.iso',

            // 🔹 Database & Cache Files
            '*.sqlite', '*.db', '*.mdb', '*.bak', '*.log', '*.cache', '*.pid',

            // 🔹 Frontend Files
            'front-end/.gitignore', 'front-end/README.md', 'front-end/index.html',
            'front-end/jsconfig.json', 'front-end/package-lock.json', 'front-end/package.json',
            'front-end/postcss.config.js', 'front-end/svelte.config.js',
            'front-end/tailwind.config.js', 'front-end/vite.config.js',
            'front-end/.vscode/extensions.json',
            'front-end/public/', 'front-end/public/vite.svg',
            'front-end/src/assets/', 'front-end/src/assets/*.svg',

            // 🔹 Miscellaneous Docs
            'README.md', 'readme.md', 'LICENSE', 'CONTRIBUTING.md', 'running_on_wsl.md',

            // 🔹 Python & API Files (if irrelevant)
            'api.py', 'bot.py', 'chains.py', 'loader.py', 'pdf_bot.py', 'utils.py',
            'install_ollama.sh', 'pull_model.Dockerfile',

            // 🔹 Requirements Files
            'requirements.txt', 'env.example'
        ],
        recursive: true,
        unknown: 'warn',
        maxConcurrency: 5,
    });

    const docs = await loader.load()
    return docs;
}

export const indexGithubRepo = async(projectId: string, githubUrl: string, githubToken?: string)=>{
    
    const docs = await loadGithubRepo(githubUrl,githubToken)
    const allEmbeddings = await generateEmbeddings(docs)
    await Promise.allSettled(allEmbeddings.map(async(embedding,index)=>{
        console.log(`processing ${index} of ${allEmbeddings.length}`)
        if(!embedding) return 

        const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
            data:{
                summary: embedding.summary,
                sourceCode: embedding.sourceCode,
                fileName: embedding.fileName,
                projectId: projectId
            }
        })

        await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding" = ${embedding.embedding}::vector
        WHERE "id" = ${sourceCodeEmbedding.id}`
    }))
}

const generateEmbeddings = async(docs: Document[])=>{

    return await Promise.all(docs.map(async doc => {
        const summary = await summarizeCode(doc);
        const embedding = await generateEmbedding(summary)
        return{
            summary,
            embedding,
            sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
            fileName: doc.metadata.source,
        }
    }))
}