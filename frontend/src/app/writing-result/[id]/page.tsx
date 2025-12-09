'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { IELTSFeedbackDisplay } from './ielts-writing-feedback';
import LiquidLoading from '@/components/ui/liquid-loader';
import { toast } from 'sonner';
import { fetchWrapper, throwIfError } from '@/lib/service';

export default function WritingResultPage() {
    // const searchParams = useSearchParams();
    // const idsString = searchParams.get('ids');
    // // State quản lý
    // const [results, setResults] = useState<any[]>([]);
    // const [isLoading, setIsLoading] = useState(true);
    // const [hasError, setHasError] = useState(false);
    // useEffect(() => {
    //     const fetchAndEvaluate = async () => {
    //         if (!idsString) {
    //             setIsLoading(false);
    //             return;
    //         }
    //         const answerIds = idsString.split(',');
    //         setIsLoading(true);
    //         try {
    //             // Chạy song song tất cả các bài làm (Promise.all)
    //             const promises = answerIds.map(async (answerId) => {
    //                 // BƯỚC 1: Lấy thông tin bài làm (Answer) để có User Content & QuestionID
    //                 const answerRes = await fetchWrapper(
    //                     `/api/answers/${answerId}`,
    //                 );
    //                 await throwIfError(answerRes);
    //                 const answerData: AnswerResponse = await answerRes.json();
    //                 // BƯỚC 2: Lấy thông tin câu hỏi (Question) dựa trên questionId từ Answer
    //                 // (Cách này an toàn hơn localStorage vì questionId gắn liền với answer)
    //                 const questionRes = await fetchWrapper(
    //                     `/questions/${answerData.questionId}`,
    //                 ); // Endpoint theo hook useGetWritingSection
    //                 await throwIfError(questionRes);
    //                 const questionData: WritingQuestion =
    //                     await questionRes.json();
    //                 // BƯỚC 3: Chuẩn bị Payload "ngon lành"
    //                 // taskNumber: 1 -> TASK_1, 2 -> TASK_2
    //                 const taskType =
    //                     questionData.content.taskNumber === 1
    //                         ? 'TASK_1'
    //                         : 'TASK_2';
    //                 const payload = {
    //                     section_id: HARDCODED_SECTION_ID,
    //                     user_id: HARDCODED_USER_ID,
    //                     essay_content: answerData.answerContent, // Content user nhập
    //                     task_type: taskType, // TASK_1 hoặc TASK_2
    //                     prompt: questionData.content.instruction, // Instruction làm prompt
    //                     word_count: countWords(answerData.answerContent),
    //                 };
    //                 // BƯỚC 4: Gọi API Evaluate (Cú chốt)
    //                 const evaluateRes = await fetchWrapper(
    //                     `/api/v1/evaluations/writing/evaluate/${answerId}`,
    //                     {
    //                         method: 'POST',
    //                         headers: {
    //                             'Content-Type': 'application/json',
    //                         },
    //                         body: JSON.stringify(payload),
    //                     },
    //                 );
    //                 await throwIfError(evaluateRes);
    //                 const rawResult = await evaluateRes.json();
    //                 // BƯỚC 5: Xử lý data trả về cho khớp UI
    //                 return processFeedbackData(rawResult);
    //             });
    //             // Đợi tất cả hoàn thành
    //             const data = await Promise.all(promises);
    //             setResults(data);
    //         } catch (error) {
    //             console.error('Evaluation Error:', error);
    //             setHasError(true);
    //             toast.error('Failed to load evaluation results.');
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };
    //     fetchAndEvaluate();
    // }, [idsString]); // Chỉ chạy lại khi ID thay đổi
    // if (isLoading) {
    //     return (
    //         <div className="bg-background flex h-screen w-full items-center justify-center">
    //             <LiquidLoading />
    //         </div>
    //     );
    // }
    // if (hasError || results.length === 0) {
    //     return (
    //         <div className="p-10 text-center">
    //             <h2 className="text-destructive text-xl font-bold">
    //                 Unable to load results
    //             </h2>
    //             <p className="text-muted-foreground">
    //                 Please try refreshing the page.
    //             </p>
    //         </div>
    //     );
    // }
    // return (
    //     <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
    //         <div className="container mx-auto px-4 py-8 md:py-12">
    //             <div className="mb-8 text-center">
    //                 <h1 className="mb-2 text-4xl font-bold tracking-tight">
    //                     IELTS Writing Feedback
    //                 </h1>
    //                 <p className="text-muted-foreground">
    //                     Detailed analysis of your writing performance
    //                 </p>
    //             </div>
    //             <IELTSFeedbackDisplay data={results} />
    //         </div>
    //     </div>
    // );
}
