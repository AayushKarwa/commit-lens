import {GoogleGenerativeAI} from '@google/generative-ai';

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
