import {GoogleGenerativeAI} from '@google/generative-ai';
import { Document } from '@langchain/core/documents';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model= genAI.getGenerativeModel({
    model: 'gemini-1.5-flash'
})

export const aiSummarizeCommit = async(diff: string)=>{

    //https://github.com/AayushKarwa/anony/commit/<commitHash>.diff  (GIVES THE CHANGE MADE IN THE COMMIT)
    const response = await model.generateContent([
        "You are a code change summarizer. You will be given a 'git diff' output. The diff may include metadata lines (e.g., 'diff --git a/file1.txt b/file1.txt', 'index ...'). Ignore these metadata lines when summarizing the changes. Focus on the lines that start with '+', '-', or ' '. '+' indicates an addition, '-' indicates a deletion, and a line starting with a space provides context but is not a change itself. Provide a summary that explains what was added, deleted, and modified. Be concise and focus on the functional changes. The input will be in the standard 'git diff' format",
        `Please summarize the following diff file: \n\n${diff}`
    ])

    return response.response.text();
}

export async function summarizeCode(doc:Document){
    console.log(`getting summary for: ${doc.metadata.source}`);



    try {
        const code = doc.pageContent.slice(0,1000) //limiting to 1k characters
        const response = await model.generateContent([
            `You are an intelligent senior software engineer who specializes in onboarding junior software engineers onto projects. You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file.
            Here is the code: 
            ---
            ${code}
            ---
            
            Give me summary no more than 100 words of the code above.`
        ])
        return response.response.text()
    } catch (error) {
        console.log(`error summarizing code: ${error}`)
        return ""
        
    }
}


export async function generateEmbedding(summary:string){
     const model = genAI.getGenerativeModel({
        model: 'text-embedding-004'
     })
     const result = await model.embedContent(summary)
     const embedding = result.embedding
     return embedding.values
}

